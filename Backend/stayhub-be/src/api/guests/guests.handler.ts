import type { NextFunction, Request, Response } from "express";
import Guest from "./guests.js"; // Replace with your actual model import
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";

const pgp = pgPromise();

// Define which columns are allowed to be updated dynamically for guests
const guestColumns = new pgp.helpers.ColumnSet(
    [
        { name: 'first_name', skip: (c: any) => c.value === undefined },
        { name: 'last_name', skip: (c: any) => c.value === undefined },
        { name: 'email', skip: (c: any) => c.value === undefined },
        { name: 'phone', skip: (c: any) => c.value === undefined },
        { name: 'id_card_number', skip: (c: any) => c.value === undefined },
        { name: 'address', skip: (c: any) => c.value === undefined }
    ],
    { table: "guests" }
);

/**
 * Get all guests for the authenticated user's hotel
 */
export async function getAllGuests(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-all-guests",
        req.user,
        async t => {
            // RLS automatically filters this to only show guests for the user's hotelID
            return await t.map("SELECT * FROM guests", [], (row: any) => new Guest(row));
        },
        result => {
            res.status(200).json(result);
        }
    );
}

/**
 * Create a new guest entry
 */
export function createGuest(req: Request, res: Response, next: NextFunction) {
    const {
        first_name,
        last_name,
        email,
        phone,
        id_card_number,
        address
    } = req.body;

    rlsWrapper(
        "create-guest",
        req.user,
        async t => {
            // Check for duplicate PHONE within the same hotel
            const existingGuest = await t.oneOrNone(
                "SELECT id FROM guests WHERE phone=$(phone) AND hotelid=$(hotelID)",
                { phone: phone, hotelID: req.user.hotelid }
            );

            if (existingGuest) {
                throw new Error(`A guest with phone number ${phone} is already registered in your hotel!`);
            }

            return await t.one(
                `INSERT INTO guests(hotelid, first_name, last_name, email, phone, id_card_number, address) 
                 VALUES ($(hotelID), $(first_name), $(last_name), $(email), $(phone), $(id_card_number), $(address))
                 RETURNING *`,
                {
                    hotelID: req.user.hotelid,
                    first_name,
                    last_name,
                    email: email || null, // Allows null if not provided
                    phone,
                    id_card_number: id_card_number || null,
                    address: address || null
                },
                (row: any) => new Guest(row)
            );
        },
        result => {
            res.status(200).json(result);
        }
    );
}

/**
 * Edit an existing guest profile dynamically
 */
export async function editGuest(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const guestData = req.body;

    if (Object.keys(guestData).length === 0) {
        return res.status(400).send("No data provided to update.");
    }

    rlsWrapper(
        "edit-guest",
        req.user,
        async t => {
            // If updating the phone number, ensure it doesn't conflict with another guest record in this hotel
            if (guestData.phone) {
                const existing = await t.oneOrNone(
                    "SELECT id FROM guests WHERE phone=$1 AND id != $2 AND hotelid=$3",
                    [guestData.phone, id, req.user.hotelid]
                );
                if (existing) {
                    throw new Error(`Phone number ${guestData.phone} is already assigned to another guest.`);
                }
            }

            const query = pgp.helpers.update(guestData, guestColumns) 
                        + pgp.as.format(' WHERE id=$1 RETURNING *', [id]);

            return await t.oneOrNone(query, [], (row: any) => new Guest(row));
        },
        result => {
            if (!result) return res.status(404).send("Guest not found or permission denied!");
            return res.status(200).json(result);
        }
    );
}

/**
 * Remove a guest record
 */
export async function deleteGuest(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    rlsWrapper(
        "delete-guest",
        req.user,
        async t => {
            return await t.oneOrNone(
                `DELETE FROM guests WHERE id=$1 RETURNING *`, 
                [id],
                (row: any) => new Guest(row)
            );
        },
        result => {
            if (!result) return res.status(404).send("Guest not found or permission denied!");
            return res.status(200).json(result);
        }
    );
}