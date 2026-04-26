import db from "@/database/db.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import type { NextFunction, Request, Response } from "express";
import { Room, RoomType } from "./room.js";
import pgPromise from "pg-promise";
import path from "node:path";
import crypto from "node:crypto";
import { supabaseAdmin } from "../../utils/initializeSession.js";

const ROOM_IMAGES_BUCKET = "room-images";

export async function getAllRoomTypes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    await rlsWrapper(
      "get-all-room-types",
      user,
      async (t) => {
        return await t.any(
          `
          SELECT *
          FROM vw_room_type_details
          WHERE hotelid = $(hotelid)
          ORDER BY id ASC
          `,
          {
            hotelid: user.hotelid,
          }
        );
      },
      (result) => {
        res.status(200).json(result);
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function createRoomType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    const {
      name,
      size,
      capacity,
      price,
      base_price,
      description,
      amenities,
      beds,
    } = req.body;

    if (!name || String(name).trim() === "") {
      return res.status(400).send("Room type name is required.");
    }

    const finalPrice = base_price !== undefined ? base_price : price;

    await rlsWrapper(
      "create-room-type",
      user,
      async (t) => {
        const existing = await t.oneOrNone(
          `
          SELECT id
          FROM roomTypes
          WHERE name = $(name)
            AND hotelID = $(hotelid)
          `,
          {
            name: String(name).trim(),
            hotelid: user.hotelid,
          }
        );

        if (existing) {
          throw new Error(`A room type named "${name}" already exists in this hotel.`);
        }

        return await t.one(
          `
          SELECT create_full_room_type(
            $(hotelid),
            $(name),
            $(size),
            $(capacity),
            $(price),
            $(description),
            $(amenities)::text[],
            $(beds)::jsonb
          ) AS id
          `,
          {
            hotelid: user.hotelid,
            name: String(name).trim(),
            size: size ? Number(size) : 100,
            capacity: capacity ? Number(capacity) : 1,
            price: finalPrice ? Number(finalPrice) : 0,
            description: description || null,
            amenities: Array.isArray(amenities) ? amenities : [],
            beds: JSON.stringify(Array.isArray(beds) ? beds : []),
          }
        );
      },
      (result) => {
        res.status(201).json({
          id: result.id,
          message: "Room type created successfully.",
        });
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function editRoomType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).send("Invalid room type id.");
    }

    const {
      name,
      size,
      capacity,
      price,
      base_price,
      description,
      amenities,
      beds,
    } = req.body;

    const finalPrice = base_price !== undefined ? base_price : price;

    await rlsWrapper(
      "edit-room-type",
      user,
      async (t) => {
        const existingRoomType = await t.oneOrNone(
          `
          SELECT id
          FROM roomTypes
          WHERE id = $(id)
            AND hotelID = $(hotelid)
          `,
          {
            id,
            hotelid: user.hotelid,
          }
        );

        if (!existingRoomType) {
          throw new Error("Room type not found or permission denied.");
        }

        if (name && String(name).trim() !== "") {
          const duplicate = await t.oneOrNone(
            `
            SELECT id
            FROM roomTypes
            WHERE name = $(name)
              AND hotelID = $(hotelid)
              AND id <> $(id)
            `,
            {
              id,
              name: String(name).trim(),
              hotelid: user.hotelid,
            }
          );

          if (duplicate) {
            throw new Error(`A room type named "${name}" already exists in this hotel.`);
          }
        }

        await t.none(
          `
          SELECT update_room_type(
            $(id),
            $(name),
            $(size),
            $(capacity),
            $(price),
            $(description),
            $(amenities)::text[],
            $(beds)::jsonb
          )
          `,
          {
            id,
            name: name ? String(name).trim() : null,
            size: size !== undefined && size !== null ? Number(size) : null,
            capacity:
              capacity !== undefined && capacity !== null
                ? Number(capacity)
                : null,
            price:
              finalPrice !== undefined && finalPrice !== null
                ? Number(finalPrice)
                : null,
            description: description ?? null,
            amenities: Array.isArray(amenities) ? amenities : null,
            beds: beds !== undefined ? JSON.stringify(Array.isArray(beds) ? beds : []) : null,
          }
        );

        return { id };
      },
      (result) => {
        res.status(200).json({
          id: result.id,
          message: "Room type updated successfully.",
        });
      }
    );
  } catch (error) {
    next(error);
  }
}
export async function deleteRoomType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const id = Number(req.params.id);

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).send("Invalid room type id.");
    }

    await rlsWrapper(
      "delete-room-type",
      user,
      async (t) => {
        const usedByRoom = await t.oneOrNone(
          `
          SELECT id
          FROM rooms
          WHERE typeID = $(id)
            AND hotelID = $(hotelid)
          LIMIT 1
          `,
          {
            id,
            hotelid: user.hotelid,
          }
        );

        if (usedByRoom) {
          throw new Error("Cannot delete this room type because it is being used by existing rooms.");
        }

        return await t.oneOrNone(
          `
          DELETE FROM roomTypes
          WHERE id = $(id)
            AND hotelID = $(hotelid)
          RETURNING id
          `,
          {
            id,
            hotelid: user.hotelid,
          }
        );
      },
      (result) => {
        if (!result) {
          return res.status(404).send("Room type not found or permission denied.");
        }

        return res.status(200).json({
          id: result.id,
          message: "Room type deleted successfully.",
        });
      }
    );
  } catch (error) {
    next(error);
  }
}



export async function getAllRooms(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    await rlsWrapper(
      "get-all-rooms",
      user,
      async (t) => {
        const rows = await t.any(
          `
          SELECT *
          FROM vw_room_details
          WHERE hotelID = $(hotelid)
          ORDER BY id ASC
          `,
          {
            hotelid: user.hotelid,
          }
        );

        return rows.map((row: any) => {
          if (!row.room_type_cover_image) {
            return {
              ...row,
              preview_image: null,
            };
          }

          const { data } = supabaseAdmin.storage
            .from("room-type-images")
            .getPublicUrl(row.room_type_cover_image);

          return {
            ...row,
            preview_image: data.publicUrl,
          };
        });
      },
      (result) => {
        res.status(200).json(result);
      }
    );
  } catch (error) {
    next(error);
  }
}

export function createRoom(req: Request, res: Response, next: NextFunction) {
  const { name, typeid, note } = req.body;

  rlsWrapper(
    "create-room",
    req.user,
    async (t) => {
      if (!name || String(name).trim() === "") {
        throw new Error("Room name is required.");
      }

      if (!typeid || Number.isNaN(Number(typeid))) {
        throw new Error("Room type is required.");
      }

      const validRoomType = await t.oneOrNone(
        `
        SELECT id
        FROM roomTypes
        WHERE id = $(typeid)
          AND hotelID = $(hotelid)
        `,
        {
          typeid: Number(typeid),
          hotelid: req.user.hotelid,
        }
      );

      if (!validRoomType) {
        throw new Error("Invalid room type for this hotel.");
      }

      const existingRoom = await t.oneOrNone(
        `
        SELECT id
        FROM rooms
        WHERE name = $(name)
          AND hotelID = $(hotelid)
        `,
        {
          name: String(name).trim(),
          hotelid: req.user.hotelid,
        }
      );

      if (existingRoom) {
        throw new Error("Room already exists for this hotel!");
      }

      return await t.one(
        `
        INSERT INTO rooms(hotelID, name, typeID, note)
        VALUES ($(hotelid), $(name), $(typeid), $(note))
        RETURNING *
        `,
        {
          hotelid: req.user.hotelid,
          name: String(name).trim(),
          typeid: Number(typeid),
          note: note || null,
        },
        (row: any) => new Room(row)
      );
    },
    (result) => {
      res.status(200).json(result);
    }
  );
}

export async function editRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const id = Number(req.params.id);
    const { name, typeid, note } = req.body;

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).send("Invalid room id.");
    }

    if (!name || String(name).trim() === "") {
      return res.status(400).send("Room name is required.");
    }

    if (!typeid || Number.isNaN(Number(typeid))) {
      return res.status(400).send("Room type is required.");
    }

    await rlsWrapper(
      "edit-room",
      user,
      async (t) => {
        const existingRoom = await t.oneOrNone(
          `
          SELECT id
          FROM rooms
          WHERE id = $(id)
            AND hotelID = $(hotelid)
          `,
          {
            id,
            hotelid: user.hotelid,
          }
        );

        if (!existingRoom) {
          throw new Error("Room not found or permission denied.");
        }

        const validRoomType = await t.oneOrNone(
          `
          SELECT id
          FROM roomTypes
          WHERE id = $(typeid)
            AND hotelID = $(hotelid)
          `,
          {
            typeid: Number(typeid),
            hotelid: user.hotelid,
          }
        );

        if (!validRoomType) {
          throw new Error("Invalid room type for this hotel.");
        }

        const duplicateRoom = await t.oneOrNone(
          `
          SELECT id
          FROM rooms
          WHERE name = $(name)
            AND hotelID = $(hotelid)
            AND id <> $(id)
          `,
          {
            id,
            name: String(name).trim(),
            hotelid: user.hotelid,
          }
        );

        if (duplicateRoom) {
          throw new Error("Room already exists for this hotel!");
        }

        return await t.one(
          `
          UPDATE rooms
          SET
            name = $(name),
            typeID = $(typeid),
            note = $(note)
          WHERE id = $(id)
            AND hotelID = $(hotelid)
          RETURNING *
          `,
          {
            id,
            hotelid: user.hotelid,
            name: String(name).trim(),
            typeid: Number(typeid),
            note: note || null,
          },
          (row: any) => new Room(row)
        );
      },
      (result) => {
        res.status(200).json(result);
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    rlsWrapper(
        "delete-room",
        req.user,
        async t => {
            return await t.oneOrNone(
                `DELETE FROM rooms WHERE id=$1 RETURNING *`, 
                [id],
                (row: any) => new Room(row)
            );
        },
        result => {
            if (!result) return res.status(404).send("Room not found, already deleted, or permission denied!");
            return res.status(200).json(result);
        }
    );
}

export const uploadRoomImage = async (req: any, res: any) => {
  try {
    const { roomId } = req.params;

    if (!req.file) {
      return res.status(400).send("No image uploaded");
    }

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const filePath = `rooms/${roomId}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(ROOM_IMAGES_BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const created = await db.one(
      `
      INSERT INTO room_images (
        roomid,
        image_url
      )
      VALUES ($(roomId), $(filePath))
      RETURNING *
      `,
      {
        roomId: Number(roomId),
        filePath,
      }
    );

    return res.status(201).json(created);
  } catch (error: any) {
    console.error("uploadRoomImage error:", error);
    return res.status(500).send(error.message || "Failed to upload room image");
  }
};

export async function getRoomImages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    const roomIdRaw = req.params.roomId;
    const roomId = Number(roomIdRaw);

    if (Number.isNaN(roomId) || roomId <= 0) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    await rlsWrapper(
      "get-all-room-images",
      user,
      async (t) => {
        const rows = await t.manyOrNone(
          `
          SELECT
            id,
            roomid,
            image_url,
            image_hash,
            created_at
          FROM room_images
          WHERE roomid = $1
          ORDER BY id ASC
          `,
          [roomId]
        );

        return rows.map((row, index) => {
          const { data } = supabaseAdmin.storage
            .from(ROOM_IMAGES_BUCKET)
            .getPublicUrl(row.image_url);

          return {
            ...row,
            image_path: row.image_url,
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

export const deleteRoomImage = async (req: any, res: any) => {
  try {
    const { roomId, imageId } = req.params;

    const image = await db.oneOrNone(
      `
      SELECT *
      FROM room_images
      WHERE id = $(imageId)
        AND roomid = $(roomId)
      `,
      {
        imageId: Number(imageId),
        roomId: Number(roomId),
      }
    );

    if (!image) {
      return res.status(404).send("Room image not found");
    }

    const { error: deleteStorageError } = await supabaseAdmin.storage
      .from(ROOM_IMAGES_BUCKET)
      .remove([image.image_url]);

    if (deleteStorageError) {
      throw deleteStorageError;
    }

    await db.none(
      `
      DELETE FROM room_images
      WHERE id = $(imageId)
        AND roomid = $(roomId)
      `,
      {
        imageId: Number(imageId),
        roomId: Number(roomId),
      }
    );

    return res.json({ message: "Room image deleted successfully" });
  } catch (error: any) {
    console.error("deleteRoomImage error:", error);
    return res.status(500).send(error.message || "Failed to delete room image");
  }
};