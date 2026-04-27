import type { NextFunction, Request, Response } from "express";
import Booking from "./booking.js"; // The class we created in the previous step
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";

const pgp = pgPromise();

const bookingColumns = new pgp.helpers.ColumnSet(
  [
    {
      name: "guestid",
      prop: "guestID",
      skip: (c: any) => c.value === undefined,
    },
    {
      name: "reserveid",
      prop: "reserveID",
      skip: (c: any) => c.value === undefined,
    },
    // booking_status is updated by triggers, but we keep it here for manual overrides
    { name: "booking_status", skip: (c: any) => c.value === undefined },
  ],
  { table: "booking" },
);

const roomColumns = new pgp.helpers.ColumnSet(
  [
    // Add skip logic to ALL fields so PATCH requests don't crash
    { name: "bookingid", skip: (c: any) => c.value === undefined },
    { name: "roomid", prop: "roomID", skip: (c: any) => c.value === undefined },
    { name: "checkin_date", skip: (c: any) => c.value === undefined },
    { name: "checkout_date", skip: (c: any) => c.value === undefined },
    { name: "room_status", skip: (c: any) => c.value === undefined },
    {
      name: "room_price",
      prop: "roomPrice",
      skip: (c: any) => c.value === undefined,
    },
  ],
  { table: "booked_room" },
);

const ACTIVE_RESERVE_HOLD_STATUSES = [
  "Pending",
  "Awaiting Confirmation",
  "Confirmed",
  "Partial Confirmed",
];

async function ensureRoomAvailabilityForBooking(
  t: pgPromise.ITask<unknown>,
  payload: {
    roomID: number;
    checkin_date: string;
    checkout_date: string;
    excludeBookedRoomId?: number;
  },
) {
  const activeBookingOverlap = await t.oneOrNone(
    `
        SELECT id
        FROM booked_room
        WHERE roomid = $(roomID)
          AND room_status NOT IN ('Cancelled', 'Checked-Out')
          AND checkin_date < $(checkout_date)
          AND checkout_date > $(checkin_date)
          AND ($(excludeBookedRoomId) = 0 OR id <> $(excludeBookedRoomId))
        LIMIT 1
        `,
    {
      ...payload,
      excludeBookedRoomId: payload.excludeBookedRoomId ?? 0,
    },
  );

  if (activeBookingOverlap) {
    throw new Error(
      `Room ${payload.roomID} is occupied during selected dates.`,
    );
  }

  const activeReserveOverlap = await t.oneOrNone(
    `
        SELECT id
        FROM reserved_room
        WHERE roomid = $(roomID)
          AND booking_status IN ($(activeReserveStatuses:csv))
          AND checkin_date < $(checkout_date)
          AND checkout_date > $(checkin_date)
        LIMIT 1
        `,
    {
      ...payload,
      activeReserveStatuses: ACTIVE_RESERVE_HOLD_STATUSES,
    },
  );

  if (activeReserveOverlap) {
    throw new Error(
      `Room ${payload.roomID} is currently held by an active reservation.`,
    );
  }
}

export async function getRoomStatus(req: Request, res: Response) {
  rlsWrapper(
    "get-room-status",
    req.user,
    async (t) => {
      const user = req.user as any;

      return await t.any(
        `
            SELECT
                r.id,
                r.name,
                r.typeid,
                rt.name AS room_type_name,
                rt.capacity,
                rt.size,
                rt.base_price,
                CASE
                    WHEN occupied.booking_id IS NOT NULL THEN 'occupied'
                    WHEN held_booking.booking_id IS NOT NULL OR held_reserve.reserve_id IS NOT NULL THEN 'hold'
                    ELSE 'available'
                END AS room_status,
                COALESCE(
                    occupied.guest_full_name,
                    held_booking.guest_full_name,
                    held_reserve.guest_full_name
                ) AS guest_full_name,
                COALESCE(
                    occupied.checkin_date,
                    held_booking.checkin_date,
                    held_reserve.checkin_date
                ) AS checkin_date,
                COALESCE(
                    occupied.checkout_date,
                    held_booking.checkout_date,
                    held_reserve.checkout_date
                ) AS checkout_date,
                occupied.booking_id,
                held_booking.booking_id AS hold_booking_id,
                held_reserve.reserve_id AS hold_reserve_id,
                COALESCE(
                    occupied.source_status,
                    held_booking.source_status,
                    held_reserve.source_status
                ) AS source_status,
                CASE
                    WHEN occupied.booking_id IS NOT NULL THEN 'booking'
                    WHEN held_booking.booking_id IS NOT NULL THEN 'booking'
                    WHEN held_reserve.reserve_id IS NOT NULL THEN 'reserve'
                    ELSE NULL
                END AS source_type
            FROM rooms r
            JOIN roomtypes rt
                ON rt.id = r.typeid
               AND rt.hotelid = r.hotelid
            LEFT JOIN LATERAL (
                SELECT
                    b.id AS booking_id,
                    CONCAT_WS(' ', g.first_name, g.last_name) AS guest_full_name,
                    br.checkin_date,
                    br.checkout_date,
                    br.room_status AS source_status
                FROM booked_room br
                JOIN booking b
                    ON b.id = br.bookingid
                   AND b.hotelid = r.hotelid
                LEFT JOIN guests g
                    ON g.id = b.guestid
                WHERE br.roomid = r.id
                  AND br.room_status = 'Checked-In'
                  AND br.checkin_date <= CURRENT_DATE
                  AND br.checkout_date >= CURRENT_DATE
                ORDER BY br.checkin_date ASC, br.id ASC
                LIMIT 1
            ) occupied ON TRUE
            LEFT JOIN LATERAL (
                SELECT
                    b.id AS booking_id,
                    CONCAT_WS(' ', g.first_name, g.last_name) AS guest_full_name,
                    br.checkin_date,
                    br.checkout_date,
                    br.room_status AS source_status
                FROM booked_room br
                JOIN booking b
                    ON b.id = br.bookingid
                   AND b.hotelid = r.hotelid
                LEFT JOIN guests g
                    ON g.id = b.guestid
                WHERE occupied.booking_id IS NULL
                  AND br.roomid = r.id
                  AND br.room_status = 'Reserved'
                  AND br.checkout_date >= CURRENT_DATE
                ORDER BY br.checkin_date ASC, br.id ASC
                LIMIT 1
            ) held_booking ON TRUE
            LEFT JOIN LATERAL (
                SELECT
                    rr.reserveid AS reserve_id,
                    CONCAT_WS(' ', g.first_name, g.last_name) AS guest_full_name,
                    rr.checkin_date,
                    rr.checkout_date,
                    rr.booking_status AS source_status
                FROM reserved_room rr
                JOIN reserves rs
                    ON rs.id = rr.reserveid
                LEFT JOIN guests g
                    ON g.id = rs.guestid
                WHERE occupied.booking_id IS NULL
                  AND held_booking.booking_id IS NULL
                  AND rr.roomid = r.id
                  AND rr.hotelid = r.hotelid
                  AND rr.booking_status IN ('Pending', 'Awaiting Confirmation', 'Confirmed', 'Partial Confirmed')
                  AND rr.checkout_date >= CURRENT_DATE
                ORDER BY rr.checkin_date ASC, rr.id ASC
                LIMIT 1
            ) held_reserve ON TRUE
            WHERE r.hotelid = $1
            ORDER BY rt.name ASC, r.name ASC, r.id ASC
            `,
        [user.hotelid],
      );
    },
    (result) => res.status(200).json(result),
  );
}
export function createBooking(req: Request, res: Response, next: NextFunction) {
  const { guestID, reserveID, rooms } = req.body; // 'rooms' is an array of room objects

  rlsWrapper(
    "create-booking",
    req.user,
    async (t) => {
      return await t.tx(async (batch) => {
        // 1. Create the Parent Booking
        const parent = await batch.one(
          `INSERT INTO booking(hotelid, guestid, reserveid) 
                 VALUES ($(hotelID), $(guestID), $(reserveID)) RETURNING id`,
          { hotelID: req.user.hotelid, guestID, reserveID: reserveID || null },
        );

        // 2. Prepare room data with the new bookingid
        const roomsWithId = rooms.map((r: any) => {
          if (!r.checkin_date || !r.checkout_date) {
            throw new Error(
              "Check-in and check-out dates are strictly required.",
            );
          }
          return {
            bookingid: parent.id,
            roomID: r.roomID,
            checkin_date: r.checkin_date,
            checkout_date: r.checkout_date,
            roomPrice: r.roomPrice || 0,
            room_status: r.room_status || "Reserved",
          };
        });

        // 3. Perform Overlap Check for all rooms in the batch
        for (const room of roomsWithId) {
          await ensureRoomAvailabilityForBooking(batch, {
            roomID: room.roomID,
            checkin_date: room.checkin_date,
            checkout_date: room.checkout_date,
          });
        }

        // 4. Bulk Insert Rooms
        const insertRooms = pgp.helpers.insert(roomsWithId, roomColumns);
        await batch.none(insertRooms);

        // 5. Return the full booking via the view
        return await batch.one(
          `SELECT * FROM vw_booking_details WHERE id = $1`,
          [parent.id],
          (row: any) => new Booking(row),
        );
      });
    },
    (result) => res.status(200).json(result),
  );
}
export async function addRoomToBooking(req: Request, res: Response) {
  const { bookingId } = req.params;
  const roomData = req.body;

  rlsWrapper(
    "add-room",
    req.user,
    async (t) => {
      // Verify booking ownership
      const booking = await t.oneOrNone(
        `SELECT id FROM booking WHERE id=$1 AND hotelid=$2`,
        [bookingId, req.user.hotelid],
      );
      if (!booking) throw new Error("Booking not found");

      await ensureRoomAvailabilityForBooking(t, {
        roomID: Number(roomData.roomID),
        checkin_date: roomData.checkin_date,
        checkout_date: roomData.checkout_date,
      });

      const newRoom = { ...roomData, bookingid: parseInt(bookingId) };
      return await t.one(
        `${pgp.helpers.insert(newRoom, roomColumns)} RETURNING *`,
      );
    },
    (result) => res.status(200).json(result),
  );
}
export async function editRoom(req: Request, res: Response) {
  const { roomId } = req.params; // The ID of the entry in booked_room table
  const updateData = req.body;

  rlsWrapper(
    "edit-room",
    req.user,
    async (t) => {
      const current = await t.oneOrNone(
        `SELECT * FROM booked_room WHERE id=$1`,
        [roomId],
      );
      if (!current) {
        return null;
      }

      const nextRoomID = Number(updateData.roomID ?? current.roomid);
      const nextCheckin = String(
        updateData.checkin_date ?? current.checkin_date,
      );
      const nextCheckout = String(
        updateData.checkout_date ?? current.checkout_date,
      );
      const nextStatus = String(updateData.room_status ?? current.room_status);

      if (nextStatus !== "Cancelled" && nextStatus !== "Checked-Out") {
        await ensureRoomAvailabilityForBooking(t, {
          roomID: nextRoomID,
          checkin_date: nextCheckin,
          checkout_date: nextCheckout,
          excludeBookedRoomId: Number(roomId),
        });
      }

      const query =
        pgp.helpers.update(updateData, roomColumns) +
        pgp.as.format(" WHERE id=$1 RETURNING *", [roomId]);

      return await t.oneOrNone(query);
    },
    (result) => {
      if (!result) return res.status(404).send("Room entry not found");
      res.status(200).json(result);
    },
  );
}

/**
 * Edit the booking header (Guest or Reservation ID)
 */
export async function editBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const { guestID, reserveID } = req.body;

  // Filter to only allow header-level updates
  const updateData = { guestID, reserveID };

  // Remove undefined values to prevent overwriting with nulls
  Object.keys(updateData).forEach(
    (key) =>
      (updateData as any)[key] === undefined && delete (updateData as any)[key],
  );

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .send("No valid header data (guestID or reserveID) provided.");
  }

  rlsWrapper(
    "edit-booking-header",
    req.user,
    async (t) => {
      // We use bookingColumns but the trigger will ignore status if not provided
      const query =
        pgp.helpers.update(updateData, bookingColumns) +
        pgp.as.format(" WHERE id=$1 AND hotelid=$2 RETURNING *", [
          id,
          req.user.hotelid,
        ]);

      // Return the updated view so the frontend sees the fresh aggregate data
      return await t.oneOrNone(
        `WITH updated AS (${query}) 
                 SELECT v.* FROM vw_booking_details v 
                 INNER JOIN updated u ON v.id = u.id`,
        [],
        (row: any) => new Booking(row),
      );
    },
    (result) => {
      if (!result)
        return res.status(404).send("Booking not found or permission denied!");
      return res.status(200).json(result);
    },
  );
}

export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;

  rlsWrapper(
    "cancel-booking",
    req.user,
    async (t) => {
      // Update all rooms belonging to this booking to 'Cancelled'
      // We specifically ignore rooms that have already been Checked-Out
      const updatedRooms = await t.any(
        `UPDATE booked_room 
                 SET room_status = 'Cancelled' 
                 WHERE bookingid = $1 
                 AND room_status NOT IN ('Cancelled', 'Checked-Out') 
                 RETURNING *`,
        [id],
      );

      // Because of our DB trigger, updating these rooms automatically updates
      // the parent `booking` table status. We don't need to do it manually here.
      return updatedRooms;
    },
    (result) => {
      // If the array is empty, it means there were no active rooms to cancel
      if (!result || result.length === 0) {
        return res
          .status(400)
          .send("No eligible rooms found to cancel or booking not found.");
      }
      return res.status(200).json({
        message: "Booking cancelled successfully",
        rooms_cancelled: result.length,
      });
    },
  );
}

// DELETE ONE ROOM
export async function deleteRoom(req: Request, res: Response) {
  const { roomId } = req.params;
  rlsWrapper(
    "delete-room",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        `DELETE FROM booked_room WHERE id=$1 RETURNING *`,
        [roomId],
      );
    },
    (result) => res.status(200).json({ message: "Room removed", result }),
  );
}

// DELETE ENTIRE BOOKING
export async function deleteBooking(req: Request, res: Response) {
  const { id } = req.params;
  rlsWrapper(
    "delete-booking",
    req.user,
    async (t) => {
      // ON DELETE CASCADE will handle removing the rooms automatically
      return await t.oneOrNone(
        `DELETE FROM booking WHERE id=$1 AND hotelid=$2 RETURNING *`,
        [id, req.user.hotelid],
      );
    },
    (result) =>
      res
        .status(200)
        .json({ message: "Booking and all associated rooms deleted" }),
  );
}
