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
    return res.status(400).json({ message: "Please fill in all required fields!" });
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
            description || '',
            effectiveBranchId,
            location,
            contact_email || null,
            contact_phone || null,
          ]
        );
      },
      (hotel) => {
        res.status(200).json({ message: "Created successfully", hotel });
      }
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


export async function uploadHotelImage(req: Request, res: Response, next: NextFunction) {
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
        if (isCover) {
          await t.none(
            `UPDATE hotel_images SET is_cover = false WHERE hotelid = $1`,
            [hotelId]
          );
        }

        const inserted = await t.one(
          `
          INSERT INTO hotel_images (
            hotelid,
            image_hash,
            image_path,
            is_cover
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (hotelid, image_hash)
          DO UPDATE SET is_cover = EXCLUDED.is_cover
          RETURNING
            id,
            hotelid,
            image_hash,
            image_path,
            is_cover
          `,
          [hotelId, hash, imagePath, isCover]
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
      }
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
  next: NextFunction
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
          [hotelId]
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
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteHotelImage(
  req: Request,
  res: Response,
  next: NextFunction
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
          [imageId, hotelId]
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
          [imageId, hotelId]
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
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function setCoverImage(
  req: Request,
  res: Response,
  next: NextFunction
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
          [imageId, hotelId]
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
          [hotelId]
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
          [imageId, hotelId]
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
      }
    );
  } catch (error) {
    next(error);
  }
}


/**
 * Fetches other room types available in the same hotel,
 * excluding the one currently being viewed.
 */
export async function getOtherRoomsInHotel(req: Request, res: Response, next: NextFunction) {
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
      [hotel_id, exclude_id || 0] // Default to 0 if no exclude_id provided
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