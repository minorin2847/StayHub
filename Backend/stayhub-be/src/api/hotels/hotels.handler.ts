import db from "@/database/db.js";
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import Hotel from "./hotels.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import path from "node:path";
import { supabaseAdmin } from "../../utils/initializeSession.js";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function getHotels(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { branchid } = req.params;

  rlsWrapper(
    "get-hotels-list",
    req.user,
    async (t) => {
      // If branchid exists, we filter by it.
      // If the user is a MANAGE_BRANCH who tries to access a different branchid,
      // the RLS policy will automatically return an empty array.
      if (branchid) {
        return await t.map(
          "SELECT * FROM hotels WHERE branchid = $1",
          [branchid],
          (row: any) => new Hotel(row),
        );
      }

      // Global fetch - RLS will still restrict this to only
      // the hotels the user is allowed to see.
      return await t.map(
        "SELECT * FROM hotels",
        [],
        (row: any) => new Hotel(row),
      );
    },
    (hotels) => {
      res.status(200).json(hotels);
    },
  );
}

export async function getHotelById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;

  rlsWrapper(
    "get-hotel-by-id",
    req.user,
    async (t) => {
      return await t.oneOrNone(
        "SELECT * FROM hotels WHERE id = $1",
        [id],
        (row: any) => new Hotel(row),
      );
    },
    (hotel) => {
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.status(200).json(hotel);
    },
  );
}

export async function createHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const salt = crypto.randomBytes(16);
  const {
    name,
    branchid,
    location,
    contact_email,
    contact_phone,
    classification,
    description,
  } = req.body;

  if (!name || !location) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields!" });
  }

  const user = (req as any).user;
  const isOnlyBranchManager =
    user &&
    user.roles.some((r: any) => r.name === "MANAGE_BRANCH") &&
    !user.roles.some((r: any) => r.name === "ADMINISTRATOR");
  // If the user's highest role is branch manager, force the branch ID to theirs!
  const effectiveBranchId = isOnlyBranchManager
    ? user.branchid
    : branchid || null;

  try {
    await rlsWrapper(
      "create-hotel",
      req.user,
      async (t) => {
        return await t.one(
          `INSERT INTO hotels
             (name, classification, description, branchid, location, contact_email, contact_phone)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, name, classification, branchid, location, contact_email, contact_phone`,
          [
            name,
            classification || 0,
            description || "",
            effectiveBranchId,
            location,
            contact_email || null,
            contact_phone || null,
          ],
        );
      },
      (hotel) => {
        res.status(200).json({ message: "Created successfully", hotel });
      },
    );
  } catch (error) {
    next(error);
  }
}

export async function updateHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const {
    name,
    branchid,
    location,
    contact_email,
    contact_phone,
    classification,
    description,
  } = req.body;

  // Enforce branchid based on user role
  const user = (req as any).user;
  const isOnlyBranchManager =
    user &&
    user.roles.some((r: any) => r.name === "MANAGE_BRANCH") &&
    !user.roles.some((r: any) => r.name === "ADMINISTRATOR");
  // If the user's highest role is branch manager, force the branch ID to theirs!
  const effectiveBranchId = isOnlyBranchManager
    ? user.branchid
    : branchid || null;

  try {
    const hotel = await db.oneOrNone(
      `UPDATE hotels 
       SET name = $1, branchid = $2, location = $3, contact_email = $4, contact_phone = $5, classification = $6, description = $7
       WHERE id = $8 
       RETURNING id, name, branchid, location, classification, contact_email, contact_phone`,
      [
        name,
        effectiveBranchId,
        location,
        contact_email || null,
        contact_phone || null,
        classification || 0,
        description || "",
        id,
      ],
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ message: "Updated successfully", hotel });
  } catch (error) {
    next(error);
  }
}

export async function deleteHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  try {
    await db.none("DELETE FROM hotels WHERE id = $1", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function uploadHotelImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let uploadedPath: string | null = null;

  try {
    const user = (req as any).user;
    const file = (req as any).file as Express.Multer.File | undefined;
    const hotelIdRaw = req.params.hotelId ?? user?.hotelid;
    const hotelId = Number(hotelIdRaw);

    if (!file) {
      return res.status(400).json({ message: "Missing image file" });
    }

    if (Number.isNaN(hotelId) || hotelId <= 0) {
      return res.status(400).json({ message: "Invalid hotelId" });
    }

    const isCover = req.body.isCover === "true" || req.body.isCover === true;
    const ext = path.extname(file.originalname) || "";
    const hash = crypto.createHash("md5").update(file.buffer).digest("hex");
    const objectPath = `hotels/${hotelId}/${hash}${ext}`;
    uploadedPath = objectPath;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("hotel-images")
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (
      uploadError &&
      !String(uploadError.message).toLowerCase().includes("already exists")
    ) {
      return next(uploadError);
    }

    const imagePath = uploadData?.path || objectPath;

    await rlsWrapper(
      "insert-hotel-image",
      user,
      async (t) => {
        const inserted = await t.one(
          `
          INSERT INTO hotel_images (
            hotelid,
            image_hash,
            image_path
          )
          VALUES ($1, $2, $3)
          RETURNING
            id,
            hotelid,
            image_hash,
            image_path
          `,
          [hotelId, hash, imagePath],
        );

        return {
          ...inserted,
          duplicated: Boolean(uploadError),
        };
      },
      (row) => {
        res.status(201).json({
          message: row.duplicated
            ? "Image already exists"
            : "Upload image successfully",
          image: row,
        });
      },
    );
  } catch (error) {
    if (uploadedPath) {
      await supabaseAdmin.storage.from("hotel-images").remove([uploadedPath]);
    }

    next(error);
  }
}

export async function getHotelImages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;
    const hotelIdRaw = req.params.hotelId ?? user?.hotelid;
    const hotelId = Number(hotelIdRaw);

    if (Number.isNaN(hotelId) || hotelId <= 0) {
      return res.status(400).json({ message: "Invalid hotelId" });
    }

    await rlsWrapper(
      "get-all-hotel-images",
      user,
      async (t) => {
        const rows = await t.manyOrNone(
          `
          SELECT
            id,
            hotelid,
            image_path,
            image_hash,
            created_at
          FROM hotel_images
          WHERE hotelid = $1
          ORDER BY id ASC
          `,
          [hotelId],
        );

        return rows.map((row, index) => {
          const { data } = supabaseAdmin.storage
            .from("hotel-images")
            .getPublicUrl(row.image_path);

          return {
            ...row,
            image_path: row.image_path,
            image_url: data.publicUrl,
            signed_url: data.publicUrl,
            is_cover: index === 0,
          };
        });
      },
      (rows) => {
        res.status(200).json(rows);
      },
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteHotelImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;
    const hotelIdParam = req.params.hotelId;
    const imageIdParam = req.params.imageId;

    const hotelId = Number(hotelIdParam || user?.hotelid);
    const imageId = Number(imageIdParam);

    if (Number.isNaN(hotelId) || hotelId <= 0) {
      return res.status(400).json({ message: "Invalid hotelId" });
    }

    if (Number.isNaN(imageId) || imageId <= 0) {
      return res.status(400).json({ message: "Invalid imageId" });
    }

    await rlsWrapper(
      "delete-hotel-image",
      user,
      async (t) => {
        const image = await t.oneOrNone(
          `
          SELECT
            id,
            hotelid,
            image_path,
            is_cover
          FROM hotel_images
          WHERE id = $1 AND hotelid = $2
          `,
          [imageId, hotelId],
        );

        if (!image) {
          return null;
        }

        const { error: storageError } = await supabaseAdmin.storage
          .from("hotel-images")
          .remove([image.image_path]);

        if (storageError) {
          throw storageError;
        }

        await t.none(
          `
          DELETE FROM hotel_images
          WHERE id = $1 AND hotelid = $2
          `,
          [imageId, hotelId],
        );

        return image;
      },
      (deletedImage) => {
        if (!deletedImage) {
          return res.status(404).json({ message: "Image not found" });
        }

        res.status(200).json({
          message: "Image deleted successfully",
          image: deletedImage,
        });
      },
    );
  } catch (error) {
    next(error);
  }
}

export async function setCoverImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;
    const hotelIdParam = req.params.hotelId;
    const imageIdParam = req.params.imageId;

    const hotelId = Number(hotelIdParam || user?.hotelid);
    const imageId = Number(imageIdParam);

    if (Number.isNaN(hotelId) || hotelId <= 0) {
      return res.status(400).json({ message: "Invalid hotelId" });
    }

    if (Number.isNaN(imageId) || imageId <= 0) {
      return res.status(400).json({ message: "Invalid imageId" });
    }

    await rlsWrapper(
      "set-cover-image",
      user,
      async (t) => {
        const image = await t.oneOrNone(
          `
          SELECT id
          FROM hotel_images
          WHERE id = $1 AND hotelid = $2
          `,
          [imageId, hotelId],
        );

        if (!image) {
          return null;
        }

        await t.none(
          `
          UPDATE hotel_images
          SET is_cover = false
          WHERE hotelid = $1
          `,
          [hotelId],
        );

        const updatedImage = await t.one(
          `
          UPDATE hotel_images
          SET is_cover = true
          WHERE id = $1 AND hotelid = $2
          RETURNING
            id,
            hotelid,
            image_path,
            is_cover
          `,
          [imageId, hotelId],
        );

        return updatedImage;
      },
      (updatedImage) => {
        if (!updatedImage) {
          return res.status(404).json({ message: "Image not found" });
        }

        res.status(200).json({
          message: "Cover image updated successfully",
          image: updatedImage,
        });
      },
    );
  } catch (error) {
    next(error);
  }
}

/**
 * PUBLIC: Get a single room type's full detail for the public-facing page.
 * Route: GET /hotels/:hotel_id/rooms/:room_id
 * Queries the room_details_view materialized view and computes live availability.
 */
export async function getPublicRoomDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const hotelId = Number(req.params.hotel_id);
  const roomId = Number(req.params.room_id);
  const checkin = String(req.query.checkin ?? "").trim() || null;
  const checkout = String(req.query.checkout ?? "").trim() || null;

  if (Number.isNaN(hotelId) || hotelId <= 0) {
    return res.status(400).json({ message: "Invalid hotel_id" });
  }
  if (Number.isNaN(roomId) || roomId <= 0) {
    return res.status(400).json({ message: "Invalid room_id" });
  }

  try {
    // 1. Fetch base room detail from the materialized view
    const roomRow = await db.oneOrNone(
      `SELECT * FROM room_details_view WHERE room_id = $1 AND hotel_id = $2`,
      [roomId, hotelId],
    );

    if (!roomRow) {
      return res.status(404).json({ message: "Room not found" });
    }

    // 2. Resolve all image URLs via Supabase storage
    const rawImages: string[] = Array.isArray(roomRow.previewimages)
      ? roomRow.previewimages
      : [];

    const resolvedImages = rawImages.map((p: string) => {
      if (/^https?:\/\//i.test(p) || p.startsWith("/")) return p;
      const { data } = supabaseAdmin.storage
        .from("room-type-images")
        .getPublicUrl(p);
      return data.publicUrl;
    });

    // 3. Compute live availability if a date range is provided
    let availableRoomCount: number | null = null;

    if (checkin && checkout && checkin < checkout) {
      const ACTIVE_BOOKING = ["Reserved", "Checked-In"];
      const ACTIVE_RESERVE = [
        "Pending",
        "Awaiting Confirmation",
        "Confirmed",
        "Partial Confirmed",
      ];

      const availRow = await db.oneOrNone(
        `
        SELECT
          COUNT(DISTINCT r.id)::int AS total_rooms,
          COALESCE((
              SELECT COUNT(*)
              FROM booked_room br
              JOIN rooms booked_r ON booked_r.id = br.roomid
              WHERE booked_r.hotelid = $(hotelId)
                AND booked_r.typeid  = $(roomId)
                AND br.room_status   IN ($(activeBooking:csv))
                AND br.checkin_date  < $(checkout)
                AND br.checkout_date > $(checkin)
          ), 0)::int AS booked_count,
          COALESCE((
              SELECT COUNT(*)
              FROM reserved_room rr
              WHERE rr.hotelid         = $(hotelId)
                AND rr.roomtypeid      = $(roomId)
                AND rr.booking_status  IN ($(activeReserve:csv))
                AND rr.checkin_date    < $(checkout)
                AND rr.checkout_date   > $(checkin)
          ), 0)::int AS reserved_count
        FROM rooms r
        WHERE r.hotelid = $(hotelId)
          AND r.typeid  = $(roomId)
        `,
        {
          hotelId,
          roomId,
          checkin,
          checkout,
          activeBooking: ACTIVE_BOOKING,
          activeReserve: ACTIVE_RESERVE,
        },
      );

      if (availRow) {
        availableRoomCount =
          Number(availRow.total_rooms) -
          Number(availRow.booked_count) -
          Number(availRow.reserved_count);
      }
    }

    // 4. Build the response
    const response = {
      id: roomRow.room_id,
      hotelId: roomRow.hotel_id,
      hotelName: roomRow.hotel_name,
      hotelLocation: roomRow.hotel_location,
      hotelClassification: roomRow.hotel_classification,
      hotelRating: Number(roomRow.avg_rating ?? 0),
      name: roomRow.room_type,
      size: roomRow.size,
      capacity: roomRow.capacity,
      price: Number(roomRow.price),
      description: roomRow.room_description,
      beds: roomRow.room_beds ?? [],
      amenities: roomRow.room_amenities ?? [],
      images: resolvedImages,
      image: resolvedImages[0] ?? "/images/hotel1.png",
      policies: roomRow.hotel_policies ?? [],
      availableRoomCount: availableRoomCount,
      reviews: [], // Loaded separately if needed
      stay: checkin && checkout ? { checkin, checkout } : null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * PUBLIC: Fetches other room types available in the same hotel,
 * excluding the one currently being viewed.
 */
export async function getOtherRoomsInHotel(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // hotel_id: current hotel context
  // exclude_id: the current room type ID to omit from the results
  const { hotel_id } = req.params;
  const { exclude_id } = req.query;

  try {
    // We use manyOrNone because a hotel might have multiple other rooms or none
    const otherRooms = await db.manyOrNone(
      `SELECT * FROM hotel_other_rooms_view 
       WHERE hotel_id = $1 AND room_id != $2
       ORDER BY final_price ASC
       LIMIT 10`,
      [hotel_id, exclude_id || 0], // Default to 0 if no exclude_id provided
    );

    // Note: We return an empty array if none found (200 OK),
    // as it's a valid state for a carousel.
    res.status(200).json(otherRooms);
  } catch (error) {
    console.error("Error fetching other rooms in hotel:", error);
    res.status(500).json({
      message: "Internal server error while retrieving related rooms",
    });
    next(error);
  }
}

/**
 * PUBLIC: Get full hotel detail including room types and live availability.
 * Route: GET /hotels/:id
 */
export async function getPublicHotelDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const hotelId = Number(req.params.id);
  const checkin = String(req.query.checkin ?? "").trim() || null;
  const checkout = String(req.query.checkout ?? "").trim() || null;
  const adults = Number(req.query.adults);
  const children = Number(req.query.children);

  if (Number.isNaN(hotelId) || hotelId <= 0) {
    return res.status(400).json({ message: "Invalid hotel_id" });
  }

  try {
    const result = await db.tx(async (t) => {
      // 1. Hotel info
      const hotelRow = await t.oneOrNone(
        `SELECT h.*, 
          COALESCE((SELECT AVG(rating) FROM reviews r JOIN rooms rm ON r.roomid = rm.id WHERE rm.hotelid = h.id), 0) AS rating,
          (SELECT COUNT(*) FROM reviews r JOIN rooms rm ON r.roomid = rm.id WHERE rm.hotelid = h.id) AS review_count
         FROM hotels h WHERE h.id = $1`,
        [hotelId],
      );

      if (!hotelRow) return null;

      // 2. Images
      const images = await t.manyOrNone(
        `SELECT image_path FROM hotel_images WHERE hotelid = $1 ORDER BY is_cover DESC, id ASC`,
        [hotelId],
      );

      const resolvedImages = images.map((img) => {
        const p = img.image_path;
        if (/^https?:\/\//i.test(p) || p.startsWith("/")) return p;
        const { data } = supabaseAdmin.storage
          .from("hotel-images")
          .getPublicUrl(p);
        return data.publicUrl;
      });

      // 3. Amenities & Policies
      const amenities = await t.manyOrNone(
        `SELECT a.name, a.icon, a.category 
         FROM hotel_amenities ha JOIN amenities a ON ha.amenity_name = a.name 
         WHERE ha.hotelid = $1`,
        [hotelId],
      );

      const policies = await t.manyOrNone(
        `SELECT p.name, p.icon, p.description 
         FROM hotel_policies hp JOIN policies p ON hp.policy_name = p.name 
         WHERE hp.hotelid = $1`,
        [hotelId],
      );

      // 4. Room Types (using materialized view)
      const roomTypesRaw = await t.manyOrNone(
        `SELECT * FROM hotel_other_rooms_view WHERE hotel_id = $1`,
        [hotelId],
      );

      // Add availability
      const roomTypes = await Promise.all(
        roomTypesRaw.map(async (rt) => {
          let availableCount = null;
          let totalCount = 0;

          if (checkin && checkout && checkin < checkout) {
            const ACTIVE_BOOKING = ["Reserved", "Checked-In"];
            const ACTIVE_RESERVE = [
              "Pending",
              "Awaiting Confirmation",
              "Confirmed",
              "Partial Confirmed",
            ];

            const availRow = await t.oneOrNone(
              `
              SELECT
                COUNT(DISTINCT r.id)::int AS total_rooms,
                COALESCE((
                    SELECT COUNT(*)
                    FROM booked_room br
                    JOIN rooms booked_r ON booked_r.id = br.roomid
                    WHERE booked_r.hotelid = $(hotelId)
                      AND booked_r.typeid  = $(roomId)
                      AND br.room_status   IN ($(activeBooking:csv))
                      AND br.checkin_date  < $(checkout)
                      AND br.checkout_date > $(checkin)
                ), 0)::int AS booked_count,
                COALESCE((
                    SELECT COUNT(*)
                    FROM reserved_room rr
                    WHERE rr.hotelid         = $(hotelId)
                      AND rr.roomtypeid      = $(roomId)
                      AND rr.booking_status  IN ($(activeReserve:csv))
                      AND rr.checkin_date    < $(checkout)
                      AND rr.checkout_date   > $(checkin)
                ), 0)::int AS reserved_count
              FROM rooms r
              WHERE r.hotelid = $(hotelId)
                AND r.typeid  = $(roomId)
              `,
              {
                hotelId,
                roomId: rt.room_id,
                checkin,
                checkout,
                activeBooking: ACTIVE_BOOKING,
                activeReserve: ACTIVE_RESERVE,
              },
            );
            if (availRow) {
              totalCount = Number(availRow.total_rooms);
              availableCount =
                totalCount -
                Number(availRow.booked_count) -
                Number(availRow.reserved_count);
            }
          } else {
            // Just get total physical rooms if no dates given
            const availRow = await t.oneOrNone(
              `SELECT COUNT(DISTINCT id)::int AS total_rooms FROM rooms WHERE hotelid = $1 AND typeid = $2`,
              [hotelId, rt.room_id],
            );
            totalCount = availRow ? Number(availRow.total_rooms) : 0;
          }

          const rtResolvedImages = (rt.previewimages || []).map((p: string) => {
            if (/^https?:\/\//i.test(p) || p.startsWith("/")) return p;
            const { data } = supabaseAdmin.storage
              .from("room-type-images")
              .getPublicUrl(p);
            return data.publicUrl;
          });

          return {
            id: rt.room_id,
            hotelId: rt.hotel_id,
            name: rt.room_type,
            size: rt.size,
            capacity: rt.capacity,
            price: Number(rt.price),
            description: rt.room_description,
            beds: rt.beds || [],
            totalBeds: (rt.beds || []).reduce(
              (acc: number, b: any) => acc + (b.count || 0),
              0,
            ),
            amenities: rt.amenities || [],
            image: rtResolvedImages[0] || "/images/hotel1.png",
            images: rtResolvedImages,
            totalRoomCount: totalCount,
            availableRoomCount:
              availableCount !== null ? availableCount : totalCount, // Fallback if no dates
          };
        }),
      );

      const rating = Number(hotelRow.rating);

      return {
        id: hotelRow.id,
        name: hotelRow.name,
        classification: hotelRow.classification,
        cityAbbreviation: hotelRow.city_abbreviation,
        location: hotelRow.location,
        description: hotelRow.description,
        contactEmail: hotelRow.contact_email,
        contactPhone: hotelRow.contact_phone,
        image: resolvedImages[0] || "/images/hotel1.png",
        images: resolvedImages,
        rating: rating,
        ratingLabel:
          rating >= 4.5
            ? "Excellent"
            : rating >= 4.0
              ? "Very Good"
              : rating >= 3.0
                ? "Good"
                : "Okay",
        reviewCount: Number(hotelRow.review_count),
        amenities: amenities,
        policies: policies,
        roomTypes: roomTypes,
        reviews: [],
        stay: checkin && checkout ? { checkin, checkout } : null,
      };
    });

    if (!result) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
