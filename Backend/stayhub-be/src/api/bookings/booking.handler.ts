import type { NextFunction, Request, Response } from "express";
import Booking from "./booking.js"; // The class we created in the previous step
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";

const pgp = pgPromise();

// Define which columns are allowed to be updated dynamically for bookings
const bookingColumns = new pgp.helpers.ColumnSet(
    [
        { name: 'guestid', prop: 'guestID', skip: (c: any) => c.value === undefined },
        { name: 'roomid', prop: 'roomID', skip: (c: any) => c.value === undefined },
        { name: 'reserveid', prop: 'reserveID', skip: (c: any) => c.value === undefined },
        { name: 'checkin_date', skip: (c: any) => c.value === undefined },
        { name: 'checkout_date', skip: (c: any) => c.value === undefined },
        { name: 'booking_status', skip: (c: any) => c.value === undefined },
        { name: 'actual_total_price', skip: (c: any) => c.value === undefined }
    ],
    { table: "booking" }
);

/**
 * Get all bookings for the authenticated user's hotel
 */
export async function getAllBookings(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-all-bookings",
        req.user,
        async t => {
            // RLS automatically filters this to only show bookings for the user's hotelID
            return await t.map("SELECT * FROM booking", [], (row: any) => new Booking(row));
        },
        result => {
            res.status(200).json(result);
        }
    );
}

/**
 * Create a new booking entry with an occupancy check
 */
export function createBooking(req: Request, res: Response, next: NextFunction) {
    const {
        guestID,
        roomID,
        reserveID,
        checkin_date,
        checkout_date,
        booking_status,
        actual_total_price
    } = req.body;

    rlsWrapper(
        "create-booking",
        req.user,
        async t => {
            // 1. Normalize dates to ensure the check uses the same logic as the insert
            const finalCheckin = checkin_date || new Date();
            // If no checkout is provided, we assume the 5-day default from your schema
            const finalCheckout = checkout_date || new Date(new Date(finalCheckin).getTime() + 5 * 24 * 60 * 60 * 1000);

            // 2. Perform Overlap Check
            // A room is occupied if: (ExistingCheckin < NewCheckout) AND (ExistingCheckout > NewCheckin)
            const overlap = await t.oneOrNone(
                `SELECT id FROM booking 
                 WHERE roomid = $(roomID) 
                 AND hotelid = $(hotelID)
                 AND booking_status NOT IN ('Cancelled')
                 AND checkin_date < $(finalCheckout) 
                 AND checkout_date > $(finalCheckin)`,
                { 
                    roomID, 
                    hotelID: req.user.hotelid, 
                    finalCheckin, 
                    finalCheckout 
                }
            );

            if (overlap) {
                throw new Error(`Room ${roomID} is already occupied or reserved during the selected dates.`);
            }

            // 3. Proceed with INSERT if no overlap is found
            return await t.one(
                `INSERT INTO booking(hotelid, guestid, roomid, reserveid, checkin_date, checkout_date, booking_status, actual_total_price) 
                 VALUES ($(hotelID), $(guestID), $(roomID), $(reserveID), $(finalCheckin), $(finalCheckout), $(booking_status), $(actual_total_price))
                 RETURNING *`,
                {
                    hotelID: req.user.hotelid,
                    guestID,
                    roomID,
                    reserveID: reserveID || null,
                    finalCheckin,
                    finalCheckout,
                    booking_status: booking_status || 'Checked-In',
                    actual_total_price: actual_total_price || 0
                },
                (row: any) => new Booking(row)
            );
        },
        result => {
            res.status(200).json(result);
        }
    );
}

/**
 * Edit an existing booking dynamically
 */
export async function editBooking(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const bookingData = req.body;

    if (Object.keys(bookingData).length === 0) {
        return res.status(400).send("No data provided to update.");
    }

    rlsWrapper(
        "edit-booking",
        req.user,
        async t => {
            // Generate dynamic update query
            const query = pgp.helpers.update(bookingData, bookingColumns) 
                        + pgp.as.format(' WHERE id=$1 AND hotelid=$2 RETURNING *', [id, req.user.hotelid]);

            return await t.oneOrNone(query, [], (row: any) => new Booking(row));
        },
        result => {
            if (!result) return res.status(404).send("Booking not found or permission denied!");
            return res.status(200).json(result);
        }
    );
}

/**
 * Remove a booking record
 */
export async function deleteBooking(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    rlsWrapper(
        "delete-booking",
        req.user,
        async t => {
            return await t.oneOrNone(
                `DELETE FROM booking WHERE id=$1 AND hotelid=$2 RETURNING *`, 
                [id, req.user.hotelid],
                (row: any) => new Booking(row)
            );
        },
        result => {
            if (!result) return res.status(404).send("Booking not found or permission denied!");
            return res.status(200).json(result);
        }
    );
}