import rlsWrapper from "@/utils/rlsWrapper.js";
import type { NextFunction, Request, Response } from "express";

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

