import rlsWrapper from "@/utils/rlsWrapper.js";
import type { NextFunction, Request, Response } from "express";
import { Room, RoomType } from "./room.js";
import pgPromise from "pg-promise";

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
        description,
        amenities, // Expected as string[]
        beds       // Expected as object[] e.g., [{name: 'King', count: 1}]
    } = req.body;

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
                    $(hotelID), $(name), $(size), $(capacity), $(price), $(description), $(amenities), $(beds)::jsonb
                )`,
                {
                    hotelID: req.user.hotelid,
                    name,
                    size: size || 100,
                    capacity: capacity || 1,
                    price: price || 0,
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
    const { name, size, capacity, price, description, amenities, beds } = req.body;

    rlsWrapper(
        "edit-room-type",
        req.user,
        async t => {
            // Check permissions/existence first or let the function handle it.
            // We use SELECT because the function returns VOID.
            await t.none(
                `SELECT update_room_type(
                    $(id), $(name), $(size), $(capacity), $(price), $(description), $(amenities), $(beds)::jsonb
                )`,
                {
                    id: parseInt(id),
                    name: name || null,
                    size: size || null,
                    capacity: capacity || null,
                    price: price || null,
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