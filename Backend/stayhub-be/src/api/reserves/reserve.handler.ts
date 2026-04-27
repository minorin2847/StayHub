import type { NextFunction, Request, Response } from "express";
import Reserve from "./reserve.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";
import db from "@/database/db.js";
import { supabaseAdmin } from "@/utils/initializeSession.js";

const pgp = pgPromise();
const DEFAULT_HOTEL_IMAGE = "/images/Top-Sight-1.jpg";
const DEFAULT_ROOM_IMAGE = "/images/hotel1.png";
const ACTIVE_BOOKING_ROOM_STATUSES = ["Reserved", "Checked-In"];
const ACTIVE_RESERVE_ROOM_STATUSES = [
  "Pending",
  "Awaiting Confirmation",
  "Confirmed",
  "Partial Confirmed",
];

// Column definitions for partial updates
const reserveColumns = new pgp.helpers.ColumnSet(
  [
    { name: "userid", prop: "userID", skip: (c: any) => c.value === undefined },
    {
      name: "guestid",
      prop: "guestID",
      skip: (c: any) => c.value === undefined,
    },
  ],
  { table: "reserves" },
);

const reservedRoomColumns = new pgp.helpers.ColumnSet(
  [
    {
      name: "roomtypeid",
      prop: "roomTypeID",
      skip: (c: any) => c.value === undefined,
    },
    { name: "roomid", prop: "roomID", skip: (c: any) => c.value === undefined },
    { name: "booking_status", skip: (c: any) => c.value === undefined },
    { name: "payment_status", skip: (c: any) => c.value === undefined },
    { name: "checkin_date", skip: (c: any) => c.value === undefined },
    { name: "checkout_date", skip: (c: any) => c.value === undefined },
    { name: "num_adults", skip: (c: any) => c.value === undefined },
    { name: "num_children", skip: (c: any) => c.value === undefined },
    { name: "final_price", skip: (c: any) => c.value === undefined },
    { name: "special_requests", skip: (c: any) => c.value === undefined },
  ],
  { table: "reserved_room" },
);

type ImageColumnName = "image_url" | "image_path";

const imageColumnCache = new Map<string, Promise<ImageColumnName | null>>();

function toInt(value: unknown, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function quoteIdentifier(identifier: string) {
  return /^[a-z_][a-z0-9_]*$/.test(identifier)
    ? identifier
    : `"${identifier.replace(/"/g, '""')}"`;
}

function getPublicImageUrl(
  imageValue: string | null,
  bucket: "hotel-images" | "room-type-images",
) {
  if (!imageValue) {
    return null;
  }

  if (/^https?:\/\//i.test(imageValue) || imageValue.startsWith("/")) {
    return imageValue;
  }

  return supabaseAdmin.storage.from(bucket).getPublicUrl(imageValue).data
    .publicUrl;
}

async function resolveImageColumn(
  tableName: string,
): Promise<ImageColumnName | null> {
  let pending = imageColumnCache.get(tableName);

  if (!pending) {
    pending = db
      .manyOrNone<{ column_name: ImageColumnName }>(
        `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = $1
                  AND column_name IN ('image_url', 'image_path')
                `,
        [tableName],
      )
      .then((rows) => {
        const columnNames = rows.map((row) => row.column_name);

        if (columnNames.includes("image_url")) {
          return "image_url";
        }

        if (columnNames.includes("image_path")) {
          return "image_path";
        }

        return null;
      })
      .catch(() => null);

    imageColumnCache.set(tableName, pending);
  }

  return pending;
}

function buildImageJoinSql(options: {
  tableName: "hotel_images" | "room_type_images";
  idColumn: "hotelid" | "room_typeid";
  sourceColumn: ImageColumnName | null;
  targetAlias: string;
  targetIdExpression: string;
  defaultImage: string;
}) {
  if (!options.sourceColumn) {
    return `
        LEFT JOIN LATERAL (
            SELECT '${options.defaultImage}'::text AS image_value
        ) ${options.targetAlias} ON TRUE
        `;
  }

  return `
    LEFT JOIN LATERAL (
        SELECT COALESCE(${quoteIdentifier(options.sourceColumn)}, '${options.defaultImage}') AS image_value
        FROM ${options.tableName}
        WHERE ${options.idColumn} = ${options.targetIdExpression}
        ORDER BY id ASC
        LIMIT 1
    ) ${options.targetAlias} ON TRUE
    `;
}

function normalizeReserveRoomRow<
  T extends { hotel_image?: string | null; room_image?: string | null },
>(row: T) {
  return {
    ...row,
    hotel_image:
      getPublicImageUrl(row.hotel_image ?? null, "hotel-images") ||
      DEFAULT_HOTEL_IMAGE,
    room_image:
      getPublicImageUrl(row.room_image ?? null, "room-type-images") ||
      DEFAULT_ROOM_IMAGE,
  };
}

function normalizeTripRoom(room: any) {
  return {
    ...room,
    hotelImage:
      getPublicImageUrl(room.hotelImage ?? null, "hotel-images") ||
      DEFAULT_HOTEL_IMAGE,
    roomImage:
      getPublicImageUrl(room.roomImage ?? null, "room-type-images") ||
      DEFAULT_ROOM_IMAGE,
  };
}

function normalizeDate(value: unknown) {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function getNightCount(checkin: string, checkout: string) {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

function buildConfirmationCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function getRoomTypeCapacitySnapshot(
  t: pgPromise.ITask<unknown>,
  payload: {
    hotelID: number;
    roomTypeID: number;
    checkin: string;
    checkout: string;
    excludeReservedRoomId?: number;
  },
) {
  return t.oneOrNone(
    `
        SELECT
            rt.id,
            rt.hotelid,
            rt.name,
            rt.base_price,
            COUNT(DISTINCT r.id)::int AS total_rooms,
            COALESCE((
                SELECT COUNT(*)
                FROM booked_room br
                JOIN rooms booked_rooms ON booked_rooms.id = br.roomid
                WHERE booked_rooms.hotelid = $(hotelID)
                  AND booked_rooms.typeid = $(roomTypeID)
                  AND br.room_status IN ($(activeBookingStatuses:csv))
                  AND br.checkin_date < $(checkout)
                  AND br.checkout_date > $(checkin)
            ), 0)::int AS booked_count,
            COALESCE((
                SELECT COUNT(*)
                FROM reserved_room rr
                WHERE rr.hotelid = $(hotelID)
                  AND rr.roomtypeid = $(roomTypeID)
                  AND rr.booking_status IN ($(activeReserveStatuses:csv))
                  AND rr.checkin_date < $(checkout)
                  AND rr.checkout_date > $(checkin)
                  AND ($(excludeReservedRoomId) = 0 OR rr.id <> $(excludeReservedRoomId))
            ), 0)::int AS reserved_count
        FROM roomtypes rt
        LEFT JOIN rooms r
            ON r.hotelid = rt.hotelid
           AND r.typeid = rt.id
        WHERE rt.hotelid = $(hotelID)
          AND rt.id = $(roomTypeID)
        GROUP BY rt.id, rt.hotelid, rt.name, rt.base_price
        `,
    {
      hotelID: payload.hotelID,
      roomTypeID: payload.roomTypeID,
      checkin: payload.checkin,
      checkout: payload.checkout,
      excludeReservedRoomId: payload.excludeReservedRoomId ?? 0,
      activeBookingStatuses: ACTIVE_BOOKING_ROOM_STATUSES,
      activeReserveStatuses: ACTIVE_RESERVE_ROOM_STATUSES,
    },
  );
}

async function ensureRoomTypeCapacity(
  t: pgPromise.ITask<unknown>,
  payload: {
    hotelID: number;
    roomTypeID: number;
    checkin: string;
    checkout: string;
    excludeReservedRoomId?: number;
  },
) {
  const snapshot = await getRoomTypeCapacitySnapshot(t, payload);

  if (!snapshot) {
    throw new Error("Selected room type was not found for this hotel.");
  }

  const availableCount =
    Number(snapshot.total_rooms ?? 0) -
    Number(snapshot.booked_count ?? 0) -
    Number(snapshot.reserved_count ?? 0);

  if (availableCount < 1) {
    throw new Error(
      "No remaining room capacity matches the selected room type for these dates.",
    );
  }

  return snapshot;
}

async function ensureAssignableRoom(
  t: pgPromise.ITask<unknown>,
  payload: {
    hotelID: number;
    roomTypeID: number;
    roomID: number;
    checkin: string;
    checkout: string;
    excludeReservedRoomId?: number;
  },
) {
  const selectedRoom = await t.oneOrNone(
    `
        SELECT
            r.id,
            r.name,
            r.hotelid,
            r.typeid
        FROM rooms r
        WHERE r.id = $(roomID)
          AND r.hotelid = $(hotelID)
          AND r.typeid = $(roomTypeID)
          AND NOT EXISTS (
              SELECT 1
              FROM booked_room br
              WHERE br.roomid = r.id
                AND br.room_status IN ($(activeBookingStatuses:csv))
                AND br.checkin_date < $(checkout)
                AND br.checkout_date > $(checkin)
          )
          AND NOT EXISTS (
              SELECT 1
              FROM reserved_room rr
              WHERE rr.roomid = r.id
                AND rr.booking_status IN ($(activeReserveStatuses:csv))
                AND rr.checkin_date < $(checkout)
                AND rr.checkout_date > $(checkin)
                AND ($(excludeReservedRoomId) = 0 OR rr.id <> $(excludeReservedRoomId))
          )
        LIMIT 1
        `,
    {
      hotelID: payload.hotelID,
      roomTypeID: payload.roomTypeID,
      roomID: payload.roomID,
      checkin: payload.checkin,
      checkout: payload.checkout,
      excludeReservedRoomId: payload.excludeReservedRoomId ?? 0,
      activeBookingStatuses: ACTIVE_BOOKING_ROOM_STATUSES,
      activeReserveStatuses: ACTIVE_RESERVE_ROOM_STATUSES,
    },
  );

  if (!selectedRoom) {
    throw new Error("Selected room is unavailable for the chosen stay.");
  }

  return selectedRoom;
}

function normalizeGuestNameParts(payload: {
  guestName?: string;
  first_name?: string;
  last_name?: string;
}) {
  const firstName = String(payload.first_name ?? "").trim();
  const lastName = String(payload.last_name ?? "").trim();

  if (firstName && lastName) {
    return { firstName, lastName };
  }

  const guestName = String(payload.guestName ?? "").trim();
  if (!guestName) {
    return {
      firstName,
      lastName,
    };
  }

  const parts = guestName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "Guest",
    };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

async function getReserveRoomRows(reserveID: number) {
  const hotelImageColumn = await resolveImageColumn("hotel_images");
  const roomTypeImageColumn = await resolveImageColumn("room_type_images");
  const rows = await db.manyOrNone(
    `
        SELECT
            rr.id,
            rr.reserveid,
            rr.hotelid,
            rr.roomtypeid,
            rr.roomid,
            rr.confirmation_code,
            rr.booking_status,
            rr.payment_status,
            rr.checkin_date,
            rr.checkout_date,
            rr.num_adults,
            rr.num_children,
            rr.final_price,
            rr.special_requests,
            h.name AS hotel_name,
            h.location AS hotel_location,
            hi.image_value AS hotel_image,
            rm.name AS room_name,
            rt.id AS room_type_id,
            rt.name AS room_type_name,
            rt.size,
            rt.capacity,
            rt.base_price,
            rti.image_value AS room_image
        FROM reserved_room rr
        JOIN hotels h ON h.id = rr.hotelid
        JOIN roomtypes rt ON rt.id = rr.roomtypeid
        LEFT JOIN rooms rm ON rm.id = rr.roomid
        ${buildImageJoinSql({
          tableName: "hotel_images",
          idColumn: "hotelid",
          sourceColumn: hotelImageColumn,
          targetAlias: "hi",
          targetIdExpression: "h.id",
          defaultImage: DEFAULT_HOTEL_IMAGE,
        })}
        ${buildImageJoinSql({
          tableName: "room_type_images",
          idColumn: "room_typeid",
          sourceColumn: roomTypeImageColumn,
          targetAlias: "rti",
          targetIdExpression: "rt.id",
          defaultImage: DEFAULT_ROOM_IMAGE,
        })}
        WHERE rr.reserveid = $1
        ORDER BY rr.created_at ASC
        `,
    [reserveID],
  );

  return rows.map(normalizeReserveRoomRow);
}

async function getReserveSnapshotById(userID: number, reserveID: number) {
  const reserve = await db.oneOrNone(
    `
        SELECT
            r.id,
            r.userid,
            r.guestid,
            r.status,
            r.created_at,
            r.updated_at,
            COALESCE(SUM(rr.final_price), 0) AS total_price,
            COUNT(rr.id)::int AS total_rooms,
            g.first_name,
            g.last_name,
            g.phone,
            g.email,
            g.id_card_number,
            g.address
        FROM reserves r
        LEFT JOIN reserved_room rr ON rr.reserveid = r.id
        LEFT JOIN guests g ON g.id = r.guestid
        WHERE r.userid = $1 AND r.id = $2
        GROUP BY r.id, g.first_name, g.last_name, g.phone, g.email, g.id_card_number, g.address
        LIMIT 1
        `,
    [userID, reserveID],
  );

  if (!reserve) {
    return null;
  }

  const rooms = await getReserveRoomRows(reserve.id);

  return {
    id: reserve.id,
    userID: reserve.userid,
    guestID: reserve.guestid,
    status: reserve.status,
    createdAt: reserve.created_at,
    updatedAt: reserve.updated_at,
    totalPrice: Number(reserve.total_price ?? 0),
    totalRooms: reserve.total_rooms,
    guest: reserve.guestid
      ? {
          firstName: reserve.first_name,
          lastName: reserve.last_name,
          phone: reserve.phone,
          email: reserve.email,
          idCardNumber: reserve.id_card_number,
          address: reserve.address,
        }
      : null,
    rooms,
  };
}

async function getPendingReserveSnapshot(userID: number) {
  const reserve = await db.oneOrNone(
    `
        SELECT
            r.id,
            r.userid,
            r.guestid,
            r.status,
            r.created_at,
            r.updated_at,
            COALESCE(SUM(rr.final_price), 0) AS total_price,
            COUNT(rr.id)::int AS total_rooms
        FROM reserves r
        LEFT JOIN reserved_room rr ON rr.reserveid = r.id
        WHERE r.userid = $1 AND r.status = 'Pending'
        GROUP BY r.id
        ORDER BY r.created_at DESC
        LIMIT 1
        `,
    [userID],
  );

  if (!reserve) {
    return null;
  }

  const hotelImageColumn = await resolveImageColumn("hotel_images");
  const roomTypeImageColumn = await resolveImageColumn("room_type_images");
  const rooms = await db.manyOrNone(
    `
        SELECT
            rr.id,
            rr.reserveid,
            rr.hotelid,
            rr.roomtypeid,
            rr.roomid,
            rr.confirmation_code,
            rr.booking_status,
            rr.payment_status,
            rr.checkin_date,
            rr.checkout_date,
            rr.num_adults,
            rr.num_children,
            rr.final_price,
            rr.special_requests,
            h.name AS hotel_name,
            h.location AS hotel_location,
            hi.image_value AS hotel_image,
            rm.name AS room_name,
            rt.id AS room_type_id,
            rt.name AS room_type_name,
            rt.size,
            rt.capacity,
            rt.base_price,
            rti.image_value AS room_image
        FROM reserved_room rr
        JOIN hotels h ON h.id = rr.hotelid
        JOIN roomtypes rt ON rt.id = rr.roomtypeid
        LEFT JOIN rooms rm ON rm.id = rr.roomid
        ${buildImageJoinSql({
          tableName: "hotel_images",
          idColumn: "hotelid",
          sourceColumn: hotelImageColumn,
          targetAlias: "hi",
          targetIdExpression: "h.id",
          defaultImage: DEFAULT_HOTEL_IMAGE,
        })}
        ${buildImageJoinSql({
          tableName: "room_type_images",
          idColumn: "room_typeid",
          sourceColumn: roomTypeImageColumn,
          targetAlias: "rti",
          targetIdExpression: "rt.id",
          defaultImage: DEFAULT_ROOM_IMAGE,
        })}
        WHERE rr.reserveid = $1
        ORDER BY rr.created_at ASC
        `,
    [reserve.id],
  );

  return {
    id: reserve.id,
    userID: reserve.userid,
    guestID: reserve.guestid,
    status: reserve.status,
    createdAt: reserve.created_at,
    updatedAt: reserve.updated_at,
    totalPrice: Number(reserve.total_price ?? 0),
    totalRooms: reserve.total_rooms,
    rooms: rooms.map(normalizeReserveRoomRow),
  };
}

async function getReserveHistorySnapshot(userID: number) {
  const hotelImageColumn = await resolveImageColumn("hotel_images");
  const roomTypeImageColumn = await resolveImageColumn("room_type_images");
  const reserves = await db.manyOrNone(
    `
        SELECT
            r.id,
            r.status,
            r.created_at,
            r.updated_at,
            COALESCE(SUM(rr.final_price), 0) AS total_price,
            COUNT(rr.id)::int AS total_rooms,
            jsonb_agg(
                jsonb_build_object(
                    'reservedRoomId', rr.id,
                    'hotelId', rr.hotelid,
                    'hotelName', h.name,
                    'hotelLocation', h.location,
                    'hotelImage', hi.image_value,
                    'roomId', rr.roomid,
                    'roomName', rm.name,
                    'roomTypeId', rt.id,
                    'roomTypeName', rt.name,
                    'roomImage', rti.image_value,
                    'checkinDate', rr.checkin_date,
                    'checkoutDate', rr.checkout_date,
                    'bookingStatus', rr.booking_status,
                    'paymentStatus', rr.payment_status,
                    'finalPrice', rr.final_price,
                    'confirmationCode', rr.confirmation_code,
                    'bookingId', b.id,
                    'bookingOverallStatus', b.booking_status
                )
                ORDER BY rr.created_at ASC
            ) AS rooms
        FROM reserves r
        JOIN reserved_room rr ON rr.reserveid = r.id
        JOIN hotels h ON h.id = rr.hotelid
        JOIN roomtypes rt ON rt.id = rr.roomtypeid
        LEFT JOIN rooms rm ON rm.id = rr.roomid
        LEFT JOIN booking b ON b.reserveid = r.id AND b.hotelid = rr.hotelid
        ${buildImageJoinSql({
          tableName: "hotel_images",
          idColumn: "hotelid",
          sourceColumn: hotelImageColumn,
          targetAlias: "hi",
          targetIdExpression: "h.id",
          defaultImage: DEFAULT_HOTEL_IMAGE,
        })}
        ${buildImageJoinSql({
          tableName: "room_type_images",
          idColumn: "room_typeid",
          sourceColumn: roomTypeImageColumn,
          targetAlias: "rti",
          targetIdExpression: "rt.id",
          defaultImage: DEFAULT_ROOM_IMAGE,
        })}
        WHERE r.userid = $1
        GROUP BY r.id
        ORDER BY r.created_at DESC
        `,
    [userID],
  );

  return reserves.map((reserve) => ({
    id: reserve.id,
    status: reserve.status,
    createdAt: reserve.created_at,
    updatedAt: reserve.updated_at,
    totalPrice: Number(reserve.total_price ?? 0),
    totalRooms: reserve.total_rooms,
    rooms: Array.isArray(reserve.rooms)
      ? reserve.rooms.map(normalizeTripRoom)
      : [],
  }));
}

/**
 * STAFF ACTION: Approve Reservation
 * Staff reviews an 'Awaiting Confirmation' reserve and clicks approve.
 * This runs the process_online_checkout procedure.
 */
export async function approveReserve(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params; // reserveID

  rlsWrapper(
    "approve-reserve",
    req.user,
    async (t) => {
      // Calls the SQL procedure to convert the cart to actual bookings
      await t.none(`CALL process_online_checkout($1)`, [id]);

      // Return the fresh aggregate data for the dashboard
      return await t.one(`SELECT * FROM vw_reserve_details WHERE id = $1`, [
        id,
      ]);
    },
    (result) =>
      res.status(200).json({
        message: "Reservation approved and converted to PMS Booking.",
        reserve: result,
      }),
  );
}

/**
 * Edit Reserve Header (User / Guest)
 */
export async function editReserve(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const { userID, guestID } = req.body;

  const updateData = { userID, guestID };
  Object.keys(updateData).forEach(
    (key) =>
      (updateData as any)[key] === undefined && delete (updateData as any)[key],
  );

  if (Object.keys(updateData).length === 0) {
    return res.status(400).send("No valid header data provided.");
  }

  rlsWrapper(
    "edit-reserve-header",
    req.user,
    async (t) => {
      const query =
        pgp.helpers.update(updateData, reserveColumns) +
        pgp.as.format(" WHERE id=$1 RETURNING *", [id]);

      return await t.oneOrNone(
        `WITH updated AS (${query}) 
             SELECT v.* FROM vw_reserve_details v 
             INNER JOIN updated u ON v.id = u.id`,
        [],
        (row: any) => new Reserve(row),
      );
    },
    (result) => {
      if (!result) return res.status(404).send("Reserve not found!");
      return res.status(200).json(result);
    },
  );
}

/**
 * Edit a specific room inside a reservation cart
 * Note: Employees should only edit rooms belonging to their hotel!
 */
export async function editReservedRoom(req: Request, res: Response) {
  const { roomId } = req.params;
  const employee = req.user as any;
  const requestedRoomId =
    req.body.roomID === null || req.body.roomID === ""
      ? null
      : toInt(req.body.roomID, 0) || undefined;

  rlsWrapper(
    "edit-reserved-room",
    req.user,
    async (t) => {
      const currentReservedRoom = await t.oneOrNone(
        `SELECT * FROM reserved_room WHERE id = $1 AND hotelid = $2 LIMIT 1`,
        [roomId, employee?.hotelid],
      );

      if (!currentReservedRoom) {
        return null;
      }

      const nextCheckin =
        normalizeDate(req.body.checkin_date) ??
        currentReservedRoom.checkin_date;
      const nextCheckout =
        normalizeDate(req.body.checkout_date) ??
        currentReservedRoom.checkout_date;
        
      // FIX: Khai báo lại nextRoomTypeID bị thiếu trong code hiện tại của bạn
      const nextRoomTypeID = toInt(
        req.body.roomTypeID ?? currentReservedRoom.roomtypeid,
        0,
      );
      
      const nextStatus =
        req.body.booking_status ?? currentReservedRoom.booking_status;

      if (
        !nextRoomTypeID ||
        !nextCheckin ||
        !nextCheckout ||
        nextCheckin >= nextCheckout
      ) {
        throw new Error("Invalid reserve room dates or room type.");
      }

      // FIX: Xóa phần code thừa bị lặp ở dưới và chỉ giữ lại 1 lần gọi duy nhất nằm trong if
      if (nextStatus !== "Cancelled") {
        await ensureRoomTypeCapacity(t, {
          hotelID: employee?.hotelid,
          roomTypeID: nextRoomTypeID,
          checkin: nextCheckin,
          checkout: nextCheckout,
          excludeReservedRoomId: Number(roomId),
        });

        if (requestedRoomId) {
          await ensureAssignableRoom(t, {
            hotelID: employee?.hotelid,
            roomTypeID: nextRoomTypeID,
            roomID: requestedRoomId,
            checkin: nextCheckin,
            checkout: nextCheckout,
            excludeReservedRoomId: Number(roomId),
          });
        }
      }

      const updateData = {
        ...req.body,
        roomTypeID: nextRoomTypeID,
        roomID:
          requestedRoomId === undefined ? req.body.roomID : requestedRoomId,
        checkin_date: nextCheckin,
        checkout_date: nextCheckout,
      };

      const query =
        pgp.helpers.update(updateData, reservedRoomColumns) +
        pgp.as.format(" WHERE id=$1 AND hotelid=$2 RETURNING *", [
          roomId,
          employee?.hotelid,
        ]);

      return await t.oneOrNone(query);
    },
    (result) => {
      if (!result)
        return res
          .status(404)
          .send("Reserved room entry not found or permission denied");
      res.status(200).json(result);
    },
  );
}


export async function addReservedRoom(req: Request, res: Response) {
  const reserveID = toInt(req.params.reserveId, 0);
  const employee = req.user as any;
  const roomTypeID = toInt(req.body.roomTypeID, 0);
  const roomID =
    req.body.roomID === null || req.body.roomID === ""
      ? null
      : toInt(req.body.roomID, 0) || null;
  const checkin = normalizeDate(req.body.checkin_date);
  const checkout = normalizeDate(req.body.checkout_date);

  rlsWrapper(
    "add-reserved-room",
    req.user,
    async (t) => {
      if (
        !reserveID ||
        !roomTypeID ||
        !checkin ||
        !checkout ||
        checkin >= checkout
      ) {
        throw new Error(
          "reserveId, roomTypeID and a valid stay range are required.",
        );
      }

      const reserve = await t.oneOrNone(
        `SELECT id FROM reserves WHERE id = $1 LIMIT 1`,
        [reserveID],
      );
      if (!reserve) {
        throw new Error("Reserve not found.");
      }

      const roomType = await ensureRoomTypeCapacity(t, {
        hotelID: employee?.hotelid,
        roomTypeID,
        checkin,
        checkout,
      });

      if (roomID) {
        await ensureAssignableRoom(t, {
          hotelID: employee?.hotelid,
          roomTypeID,
          roomID,
          checkin,
          checkout,
        });
      }

      const nights = getNightCount(checkin, checkout);

      return await t.one(
        `INSERT INTO reserved_room (
                reserveID, hotelID, roomTypeID, roomID, confirmation_code,
                booking_status, payment_status, checkin_date, checkout_date,
                num_adults, num_children, final_price, special_requests
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12, $13
            ) RETURNING *`,
        [
          reserveID,
          employee?.hotelid,
          roomTypeID,
          roomID,
          buildConfirmationCode(),
          req.body.booking_status ?? "Pending",
          req.body.payment_status ?? "Unpaid",
          checkin,
          checkout,
          Math.max(1, toInt(req.body.num_adults, 1)),
          Math.max(0, toInt(req.body.num_children, 0)),
          req.body.final_price ?? Number(roomType.base_price) * nights,
          req.body.special_requests ?? null,
        ],
      );
    },
    (result) => res.status(200).json(result),
  );
}

/**
 * Cancel an entire reservation and its connected PMS bookings
 */
export async function cancelReserve(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;

  rlsWrapper(
    "cancel-reserve",
    req.user,
    async (t) => {
      // Calls our new SQL procedure to cancel both the cart and the stay
      await t.none(`CALL cancel_online_reserve($1)`, [id]);
      return {
        message:
          "Online reserve and corresponding bookings cancelled successfully.",
      };
    },
    (result) => res.status(200).json(result),
  );
}

/**
 * Delete an entire reservation cart
 */
export async function deleteReserve(req: Request, res: Response) {
  const { id } = req.params;
  rlsWrapper(
    "delete-reserve",
    req.user,
    async (t) => {
      // ON DELETE CASCADE will handle removing the reserved_room entries automatically
      // Note: You may want to handle the connected `booking` records manually or let them detach (SET NULL)
      return await t.oneOrNone(`DELETE FROM reserves WHERE id=$1 RETURNING *`, [
        id,
      ]);
    },
    (result) => res.status(200).json({ message: "Reserve deleted" }),
  );
}

/**
 * Delete a specific room from a reservation
 */
export async function deleteReservedRoom(req: Request, res: Response) {
  const { roomId } = req.params;
  const employee = req.user as any;
  rlsWrapper(
    "delete-reserved-room",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        `DELETE FROM reserved_room WHERE id=$1 AND hotelid=$2 RETURNING *`,
        [roomId, employee?.hotelid],
      );
    },
    (result) =>
      res.status(200).json({ message: "Reserved room removed", result }),
  );
}

export async function createReservation(req: Request, res: Response) {
  const userID = (req.user as any)?.id;
  const {
    hotelID,
    roomTypeID,
    checkIn,
    checkOut,
    checkin_date,
    checkout_date,
    num_adults,
    num_children,
    phone,
    email,
    id_card_number,
    address,
    special_requests,
    guestName,
    first_name,
    last_name,
  } = req.body;

  try {
    const result = await db.tx(async (t) => {
      const normalizedHotelID = toInt(hotelID, 0);
      const normalizedRoomTypeID = toInt(roomTypeID, 0);
      const checkin = normalizeDate(checkIn ?? checkin_date);
      const checkout = normalizeDate(checkOut ?? checkout_date);
      const adults = Math.max(1, toInt(num_adults, 1));
      const children = Math.max(0, toInt(num_children, 0));
      const guestPhone = String(phone ?? "").trim();
      const guestEmail = String(email ?? "").trim() || null;
      const guestIdCard = String(id_card_number ?? "").trim() || null;
      const guestAddress = String(address ?? "").trim() || null;
      const guestNameParts = normalizeGuestNameParts({
        guestName,
        first_name,
        last_name,
      });

      if (!normalizedHotelID || !normalizedRoomTypeID) {
        throw new Error("hotelID and roomTypeID are required.");
      }

      if (!checkin || !checkout || checkin >= checkout) {
        throw new Error("A valid check-in and check-out range is required.");
      }

      if (
        !guestNameParts.firstName ||
        !guestNameParts.lastName ||
        !guestPhone
      ) {
        throw new Error("Guest name and phone are required.");
      }

      const selectedRoomType = await ensureRoomTypeCapacity(t, {
        hotelID: normalizedHotelID,
        roomTypeID: normalizedRoomTypeID,
        checkin,
        checkout,
      });

      const nights = getNightCount(checkin, checkout);
      const finalPrice = Number(selectedRoomType.base_price) * nights;
      const confCode = buildConfirmationCode();

      let guest = await t.oneOrNone(
        `SELECT id FROM guests WHERE hotelid = $1 AND phone = $2 LIMIT 1`,
        [normalizedHotelID, guestPhone],
      );

      if (!guest) {
        guest = await t.one(
          `INSERT INTO guests (hotelID, first_name, last_name, phone, email, id_card_number, address)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING id`,
          [
            normalizedHotelID,
            guestNameParts.firstName,
            guestNameParts.lastName,
            guestPhone,
            guestEmail,
            guestIdCard,
            guestAddress,
          ],
        );
      }

      const reserve = await t.one(
        `INSERT INTO reserves (userID, guestID, status)
                 VALUES ($1, $2, 'Pending')
                 RETURNING id, status`,
        [userID, guest.id],
      );

      await t.one(
        `INSERT INTO reserved_room (
                    reserveID, hotelID, roomTypeID, roomID, confirmation_code,
                    booking_status, payment_status, checkin_date, checkout_date,
                    num_adults, num_children, final_price, special_requests
                ) VALUES (
                    $1, $2, $3, NULL, $4,
                    'Pending', 'Unpaid', $5, $6,
                    $7, $8, $9, $10
                ) RETURNING id`,
        [
          reserve.id,
          normalizedHotelID,
          normalizedRoomTypeID,
          confCode,
          checkin,
          checkout,
          adults,
          children,
          finalPrice,
          special_requests ?? null,
        ],
      );

      return {
        reservationId: reserve.id,
        totalPrice: finalPrice,
        status: reserve.status,
      };
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in createReservation:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to create reservation." });
  }
}

export async function getReservationById(req: Request, res: Response) {
  const userID = (req.user as any)?.id;
  const reservationID = toInt(req.params.id, 0);

  try {
    if (!reservationID) {
      return res.status(400).json({ error: "Invalid reservation id." });
    }

    const reservation = await getReserveSnapshotById(userID, reservationID);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    res.status(200).json({ reservation });
  } catch (error: any) {
    console.error("Error in getReservationById:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to load reservation." });
  }
}

export async function payReservation(req: Request, res: Response) {
  const userID = (req.user as any)?.id;
  const reservationID = toInt(req.params.id, 0);
  const method = String(req.body.method).trim().toUpperCase();
  if (!method || method === "UNDEFINED") {
    return res.status(400).json({ error: "Payment method is required." });
  }

  try {
    if (!reservationID) {
      return res.status(400).json({ error: "Invalid reservation id." });
    }

    await db.tx(async (t) => {
      const reservation = await t.oneOrNone(
        `SELECT id, status FROM reserves WHERE id = $1 AND userid = $2 LIMIT 1`,
        [reservationID, userID],
      );

      if (!reservation) {
        throw new Error("Reservation not found.");
      }

      if (reservation.status === "Confirmed") {
        return;
      }

      if (
        reservation.status !== "Pending" &&
        reservation.status !== "Awaiting Confirmation"
      ) {
        throw new Error(
          `Reservation cannot be paid in status ${reservation.status}.`,
        );
      }

      const paymentStatus = method === "PAY-LATER" ? "Unpaid" : "Paid";

      await t.none(
        `UPDATE reserved_room
                 SET booking_status = 'Awaiting Confirmation',
                     payment_status = $2,
                     updated_at = now()
                 WHERE reserveID = $1
                   AND booking_status IN ('Pending', 'Awaiting Confirmation')`,
        [reservationID, paymentStatus],
      );
    });

    const reservation = await getReserveSnapshotById(userID, reservationID);
    res.status(200).json({
      reservationId: reservationID,
      status: reservation?.status ?? "Awaiting Confirmation",
      paymentStatus: method === "PAY-LATER" ? "UNPAID" : "PAID",
      reservation,
    });
  } catch (error: any) {
    console.error("Error in payReservation:", error);
    res.status(400).json({ error: error.message || "Payment failed." });
  }
}

/**
 * Add to Cart: Inserts a room into a user's Pending reserve.
 * No guest information is required at this stage.
 */
export async function addToReserves(req: Request, res: Response) {
  const userID = (req.user as any)?.id;
  const {
    hotelID,
    roomTypeID,
    roomID,
    checkin_date,
    checkout_date,
    num_adults,
    num_children,
    final_price,
    special_requests,
  } = req.body;

  try {
    const result = await db.tx(async (t) => {
      const normalizedHotelID = toInt(hotelID, 0);
      const normalizedRoomID = toInt(roomID, 0);
      const normalizedRoomTypeID = toInt(roomTypeID, 0);
      const checkin = normalizeDate(checkin_date);
      const checkout = normalizeDate(checkout_date);

      if (!normalizedHotelID || (!normalizedRoomID && !normalizedRoomTypeID)) {
        throw new Error("hotelID and a room selection are required.");
      }

      if (!checkin || !checkout || checkin >= checkout) {
        throw new Error("A valid check-in and check-out range is required.");
      }

      let targetRoomTypeID = normalizedRoomTypeID;
      let targetRoomID: number | null = null;

      if (!targetRoomTypeID && normalizedRoomID) {
        const roomRow = await t.oneOrNone(
          `
                    SELECT r.id, r.typeid
                    FROM rooms r
                    WHERE r.id = $1 AND r.hotelid = $2
                    LIMIT 1
                    `,
          [normalizedRoomID, normalizedHotelID],
        );

        if (!roomRow) {
          throw new Error("Selected room does not belong to this hotel.");
        }

        targetRoomTypeID = Number(roomRow.typeid);
      }

      if (!targetRoomTypeID) {
        throw new Error("roomTypeID is required.");
      }

      const selectedRoomType = await ensureRoomTypeCapacity(t, {
        hotelID: normalizedHotelID,
        roomTypeID: targetRoomTypeID,
        checkin,
        checkout,
      });

      if (normalizedRoomID) {
        const selectedRoom = await ensureAssignableRoom(t, {
          hotelID: normalizedHotelID,
          roomTypeID: targetRoomTypeID,
          roomID: normalizedRoomID,
          checkin,
          checkout,
        });

        targetRoomID = Number(selectedRoom.id);
      }

      // 1. Find an existing 'Pending' cart for this user
      let reserve = await t.oneOrNone(
        `SELECT id FROM reserves WHERE userID = $1 AND status = 'Pending' LIMIT 1`,
        [userID],
      );

      // 2. If no pending cart exists, create a new one WITHOUT a guestID
      if (!reserve) {
        reserve = await t.one(
          `INSERT INTO reserves (userID, status) 
                     VALUES ($1, 'Pending') RETURNING id`,
          [userID],
        );
      }

      // 3. Generate an 8-character confirmation code
      const nights = getNightCount(checkin, checkout);
      const confCode = buildConfirmationCode();

      // 4. Insert the room into the cart (reserved_room)
      const newRoom = await t.one(
        `INSERT INTO reserved_room (
                    reserveID, hotelID, roomTypeID, roomID, confirmation_code, 
                    booking_status, payment_status, checkin_date, checkout_date, 
                    num_adults, num_children, final_price, special_requests
                ) VALUES (
                    $1, $2, $3, $4, $5, 
                    'Pending', 'Unpaid', $6, $7, 
                    $8, $9, $10, $11
                ) RETURNING *`,
        [
          reserve.id,
          normalizedHotelID,
          targetRoomTypeID,
          targetRoomID,
          confCode,
          checkin,
          checkout,
          num_adults || 1,
          num_children || 0,
          final_price ?? Number(selectedRoomType.base_price) * nights,
          special_requests,
        ],
      );

      return {
        reserveId: reserve.id,
        room: newRoom,
      };
    });

    const cart = await getPendingReserveSnapshot(userID);
    res
      .status(200)
      .json({ message: "Added to cart successfully", ...result, cart });
  } catch (error: any) {
    console.error("Error in addToReserves:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to add room to cart." });
  }
}

/**
 * Remove from Cart: Allows a user to remove a specific room from their pending cart
 */
export async function removeFromReserves(req: Request, res: Response) {
  const { roomId } = req.params;
  const userID = (req.user as any)?.id;

  try {
    // Ensure the user actually owns the cart this room belongs to
    const result = await db.oneOrNone(
      `DELETE FROM reserved_room 
             WHERE id = $1 
             AND reserveID IN (SELECT id FROM reserves WHERE userID = $2 AND status = 'Pending') 
             RETURNING *`,
      [roomId, userID],
    );

    if (!result) return res.status(404).send("Item not found in your cart.");

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error: any) {
    console.error("Error in removeFromReserves:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to remove item from cart." });
  }
}

/**
 * USER ACTION: Submit Cart
 * Requires guest information (either an ID or new details) to finalize the cart.
 */
export async function submitCart(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userID = (req.user as any)?.id;

  // Expecting either a guestID OR raw guest details from the checkout form
  const {
    guestID,
    first_name,
    last_name,
    phone,
    email,
    id_card_number,
    address,
  } = req.body;
  const method = String(req.body.method ?? "PAY-LATER")
    .trim()
    .toUpperCase();
  const paymentStatus = method === "PAY-LATER" ? "Unpaid" : "Paid";

  try {
    const result = await db.tx(async (t) => {
      // 1. Find the active pending cart
      const activeCart = await t.oneOrNone(
        `SELECT id FROM reserves WHERE userID = $1 AND status = 'Pending' LIMIT 1`,
        [userID],
      );

      if (!activeCart) throw new Error("No pending cart found to submit.");

      let finalGuestID = guestID;

      // 2. If no guestID was provided, find or create the guest record
      if (!finalGuestID) {
        if (!first_name || !last_name || !phone) {
          throw new Error(
            "Guest information (first name, last name, phone) is required to checkout.",
          );
        }

        // Look up a hotelID from the cart so we can link the guest to a hotel properly
        const cartRoom = await t.oneOrNone(
          `SELECT hotelID FROM reserved_room WHERE reserveID = $1 LIMIT 1`,
          [activeCart.id],
        );

        if (!cartRoom) {
          throw new Error("Your cart is empty. Cannot submit.");
        }

        const guestHotelID = cartRoom.hotelid;

        // Check if guest exists by phone number
        let guest = await t.oneOrNone(
          `SELECT id FROM guests WHERE phone = $1 LIMIT 1`,
          [phone],
        );

        if (!guest) {
          guest = await t.one(
            `INSERT INTO guests (hotelID, first_name, last_name, phone, email, id_card_number, address) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
              guestHotelID,
              first_name,
              last_name,
              phone,
              email,
              id_card_number,
              address,
            ],
          );
        }
        finalGuestID = guest.id;
      }

      // 3. Attach the guestID to the master cart
      await t.none(`UPDATE reserves SET guestID = $1 WHERE id = $2`, [
        finalGuestID,
        activeCart.id,
      ]);

      // 4. Change room statuses to trigger the workflow
      await t.none(
        `UPDATE reserved_room 
                 SET booking_status = 'Awaiting Confirmation',
                     payment_status = $2,
                     updated_at = now()
                 WHERE reserveID = $1 AND booking_status = 'Pending'`,
        [activeCart.id, paymentStatus],
      );

      return {
        message: "Your reservation request has been submitted to the hotel.",
        reserveID: activeCart.id,
        paymentStatus: paymentStatus.toUpperCase(),
      };
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in submitCart:", error);
    res.status(400).json({ error: error.message || "Failed to submit cart." });
  }
}

export async function getCart(req: Request, res: Response) {
  try {
    const cart = await getPendingReserveSnapshot((req.user as any)?.id);
    res.status(200).json({ cart });
  } catch (error: any) {
    console.error("Error in getCart:", error);
    res.status(500).json({ error: error.message || "Failed to load cart." });
  }
}

export async function getTripHistory(req: Request, res: Response) {
  try {
    const trips = await getReserveHistorySnapshot((req.user as any)?.id);
    res.status(200).json({ trips });
  } catch (error: any) {
    console.error("Error in getTripHistory:", error);
    res.status(500).json({ error: error.message || "Failed to load trips." });
  }
}
