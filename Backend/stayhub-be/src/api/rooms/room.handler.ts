import db from "@/database/db.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import type { NextFunction, Request, Response } from "express";
import { Room, RoomType } from "./room.js";
import pgPromise from "pg-promise";
import path from "node:path";
import crypto from "node:crypto";
import { supabaseAdmin } from "../../utils/initializeSession.js";

const ROOM_IMAGES_BUCKET = "room-images";

export async function getAllRoomTypes(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-all-room-types",
        req.user,
        async t => {
            // RLS should ensure they only see room types for their specific hotel
            return await t.any("SELECT * FROM roomTypes ORDER BY id ASC", [], row=> new RoomType(row));
        },
        result => {
            res.status(200).json(result);
        }
    );
}

export async function createRoomType(req: Request, res: Response, next: NextFunction) {
    const {
        name,
        size,
        capacity,
        price,
        base_price,
        description,
        amenities, // Expected as string[]
        beds       // Expected as object[] e.g., [{name: 'King', count: 1}]
    } = req.body;

    const finalPrice = base_price !== undefined ? base_price : price;

    rlsWrapper(
        "create-room-type",
        req.user,
        async t => {
            // 1. Check for duplicate names within the same hotel
            const existing = await t.oneOrNone(
                "SELECT id FROM roomTypes WHERE name=$(name) AND hotelID=$(hotelID)",
                { name, hotelID: req.user.hotelid }
            );

            if (existing) {
                throw new Error(`A room type named "${name}" already exists in this hotel!`);
            }

            // 2. Call the updated SQL function
            return await t.one(
                `SELECT create_full_room_type(
                    $(hotelID), $(name), $(size), $(capacity), $(price), $(description), $(amenities)::text[], $(beds)::jsonb
                )`,
                {
                    hotelID: req.user.hotelid,
                    name,
                    size: size || 100,
                    capacity: capacity || 1,
                    price: finalPrice || 0,
                    description: description || null,
                    amenities: amenities || [],
                    beds: JSON.stringify(beds || [])
                },
                // The function returns the INT id of the newly created room type
                (row: any) => row.create_full_room_type 
            );
        },
        resultId => {
            res.status(200).json({ 
                id: resultId, 
                message: "Room type created successfully." 
            });
        }
    );
}


export async function editRoomType(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { name, size, capacity, price, base_price, description, amenities, beds } = req.body;

    const finalPrice = base_price !== undefined ? base_price : price;

    rlsWrapper(
        "edit-room-type",
        req.user,
        async t => {
            // Check permissions/existence first or let the function handle it.
            await t.any(
                `SELECT update_room_type(
                    $(id), $(name), $(size), $(capacity), $(price), $(description), $(amenities)::text[], $(beds)::jsonb
                )`,
                {
                    id: parseInt(id),
                    name: name || null,
                    size: size || null,
                    capacity: capacity || null,
                    price: finalPrice || null,
                    description: description || null,
                    amenities: amenities || null, // NULL skips update, [] clears it
                    beds: beds ? JSON.stringify(beds) : null
                }
            );
            return { id };
        },
        result => {
            res.status(200).json({ message: "Room type updated successfully." });
        }
    );
}

export async function deleteRoomType(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    rlsWrapper(
        "delete-room-type",
        req.user,
        async t => {
            return await t.oneOrNone(
                `DELETE FROM roomTypes WHERE id=$1 RETURNING id`, 
                [id]
            );
        },
        result => {
            if (!result) return res.status(404).send("Room type not found or permission denied!");
            return res.status(200).json({ message: "Room type deleted successfully.", id: result.id });
        }
    );
}

// Define which columns are allowed to be updated dynamically
// Note: Postgres lowercases unquoted column names by default (e.g., typeID -> typeid)
const roomColumns = new (pgPromise()).helpers.ColumnSet(
    [
        { name: 'name', skip: (c: any) => c.value === undefined },
        { name: 'typeid', skip: (c: any) => c.value === undefined }, 
        { name: 'note', skip: (c: any) => c.value === undefined }
    ],
    { table: "rooms" }
);


export async function getAllRooms(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-all-rooms",
        req.user,
        async t => {
            // RLS automatically filters this to only show rooms for the user's hotel
            return await t.map("SELECT * FROM rooms", [], (row: any) => new Room(row));
        },
        result => {
            res.status(200).json(result);
        }
    );
}

export function createRoom(req: Request, res: Response, next: NextFunction) {
    const {
        name,
        typeid,
        note
    } = req.body;

    rlsWrapper(
        "create-room",
        req.user,
        async t => {
            // Check for duplicate names within the same hotel using the current RLS context
            const existingRoom = await t.oneOrNone(
                "SELECT id FROM rooms WHERE name=$(name) AND hotelID=$(hotelID)",
                { name: name, hotelID: req.user.hotelid }
            );

            if (existingRoom) {
                throw new Error("Room already exists for this hotel!");
            }

            return await t.one(
                `INSERT INTO rooms(hotelID, name, typeID, note) 
                 VALUES ($(hotelID), $(name), $(typeid), $(note))
                 RETURNING *`,
                {
                    hotelID: req.user.hotelid, // Fallback to user's hotel if not explicitly provided
                    name,
                    typeid,
                    note: note || null
                },
                (row: any) => new Room(row)
            );
        },
        result => {
            res.status(200).json(result);
        }
    );
}

export async function editRoom(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const roomData = req.body;

    // Prevent crashing if an empty body is sent to pg-promise update helper
    if (Object.keys(roomData).length === 0) {
        return res.status(400).send("No data provided to update.");
    }

    rlsWrapper(
        "edit-room",
        req.user,
        async t => {
            // If updating the name, check that it doesn't conflict with another room in this hotel
            if (roomData.name) {
                const existing = await t.oneOrNone(
                    "SELECT id FROM rooms WHERE name=$1 AND id != $2",
                    [roomData.name, id]
                );
                if (existing) {
                    throw new Error(`Room with name ${roomData.name} already exists in your hotel!`);
                }
            }

            // Generate dynamic SQL update string
            const query = pgPromise().helpers.update(roomData, roomColumns) 
                        + pgPromise().as.format(' WHERE id=$1 RETURNING *', [id]);

            return await t.oneOrNone(query, [], (row: any) => new Room(row));
        },
        result => {
            if (!result) return res.status(404).send("Room not found or you don't have permission to edit it!");
            return res.status(200).json(result);
        }
    );
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