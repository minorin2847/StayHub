import type { NextFunction, Request, Response } from "express";
import Booking from "./booking.js"; // The class we created in the previous step
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";

const pgp = pgPromise(); 

const bookingColumns = new pgp.helpers.ColumnSet(
    [
        { name: 'guestid', prop: 'guestID', skip: (c: any) => c.value === undefined },
        { name: 'reserveid', prop: 'reserveID', skip: (c: any) => c.value === undefined },
        // booking_status is updated by triggers, but we keep it here for manual overrides
        { name: 'booking_status', skip: (c: any) => c.value === undefined },
    ],
    { table: "booking" }
);


const roomColumns = new pgp.helpers.ColumnSet(
    [
        // Add skip logic to ALL fields so PATCH requests don't crash
        { name: 'bookingid', skip: (c: any) => c.value === undefined },
        { name: 'roomid', prop: 'roomID', skip: (c: any) => c.value === undefined },
        { name: 'checkin_date', skip: (c: any) => c.value === undefined },
        { name: 'checkout_date', skip: (c: any) => c.value === undefined },
        { name: 'room_status', skip: (c: any) => c.value === undefined },
        { name: 'room_price', prop: 'roomPrice', skip: (c: any) => c.value === undefined }
    ],
    { table: "booked_room" }
);
export function createBooking(req: Request, res: Response, next: NextFunction) {
    const { guestID, reserveID, rooms } = req.body; // 'rooms' is an array of room objects

    rlsWrapper("create-booking", req.user, async t => {
        return await t.tx(async batch => {
            // 1. Create the Parent Booking
            const parent = await batch.one(
                `INSERT INTO booking(hotelid, guestid, reserveid) 
                 VALUES ($(hotelID), $(guestID), $(reserveID)) RETURNING id`,
                { hotelID: req.user.hotelid, guestID, reserveID: reserveID || null }
            );

            // 2. Prepare room data with the new bookingid
            const roomsWithId = rooms.map((r: any) => ({
                bookingid: parent.id,
                roomID: r.roomID,
                checkin_date: r.checkin_date || new Date(),
                checkout_date: r.checkout_date || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                roomPrice: r.roomPrice || 0,
                room_status: r.room_status || 'Reserved'
            }));

            // 3. Perform Overlap Check for all rooms in the batch
            for (const room of roomsWithId) {
                const overlap = await batch.oneOrNone(
                    `SELECT id FROM booked_room 
                     WHERE roomid = $(roomID) 
                     AND room_status NOT IN ('Cancelled')
                     AND checkin_date < $(checkout_date) 
                     AND checkout_date > $(checkin_date)`,
                    room
                );
                if (overlap) throw new Error(`Room ${room.roomID} is occupied during selected dates.`);
            }

            // 4. Bulk Insert Rooms
            const insertRooms = pgp.helpers.insert(roomsWithId, roomColumns);
            await batch.none(insertRooms);

            // 5. Return the full booking via the view
            return await batch.one(`SELECT * FROM vw_booking_details WHERE id = $1`, [parent.id], (row: any) => new Booking(row));
        });
    }, result => res.status(200).json(result));
}
export async function addRoomToBooking(req: Request, res: Response) {
    const { bookingId } = req.params;
    const roomData = req.body;

    rlsWrapper("add-room", req.user, async t => {
        // Verify booking ownership
        const booking = await t.oneOrNone(`SELECT id FROM booking WHERE id=$1 AND hotelid=$2`, [bookingId, req.user.hotelid]);
        if (!booking) throw new Error("Booking not found");

        const newRoom = { ...roomData, bookingid: parseInt(bookingId) };
        return await t.one(
            `${pgp.helpers.insert(newRoom, roomColumns)} RETURNING *`
        );
    }, result => res.status(200).json(result));
}
export async function editRoom(req: Request, res: Response) {
    const { roomId } = req.params; // The ID of the entry in booked_room table
    const updateData = req.body;

    rlsWrapper("edit-room", req.user, async t => {
        const query = pgp.helpers.update(updateData, roomColumns) 
                    + pgp.as.format(' WHERE id=$1 RETURNING *', [roomId]);
        
        return await t.oneOrNone(query);
    }, result => {
        if (!result) return res.status(404).send("Room entry not found");
        res.status(200).json(result);
    });
}

/**
 * Edit the booking header (Guest or Reservation ID)
 */
export async function editBooking(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { guestID, reserveID } = req.body;

    // Filter to only allow header-level updates
    const updateData = { guestID, reserveID };

    // Remove undefined values to prevent overwriting with nulls
    Object.keys(updateData).forEach(key => 
        (updateData as any)[key] === undefined && delete (updateData as any)[key]
    );

    if (Object.keys(updateData).length === 0) {
        return res.status(400).send("No valid header data (guestID or reserveID) provided.");
    }

    rlsWrapper(
        "edit-booking-header",
        req.user,
        async t => {
            // We use bookingColumns but the trigger will ignore status if not provided
            const query = pgp.helpers.update(updateData, bookingColumns) 
                        + pgp.as.format(' WHERE id=$1 AND hotelid=$2 RETURNING *', [id, req.user.hotelid]);

            // Return the updated view so the frontend sees the fresh aggregate data
            return await t.oneOrNone(
                `WITH updated AS (${query}) 
                 SELECT v.* FROM vw_booking_details v 
                 INNER JOIN updated u ON v.id = u.id`,
                [], 
                (row: any) => new Booking(row)
            );
        },
        result => {
            if (!result) return res.status(404).send("Booking not found or permission denied!");
            return res.status(200).json(result);
        }
    );
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    rlsWrapper(
        "cancel-booking",
        req.user,
        async t => {
            // Update all rooms belonging to this booking to 'Cancelled'
            // We specifically ignore rooms that have already been Checked-Out
            const updatedRooms = await t.any(
                `UPDATE booked_room 
                 SET room_status = 'Cancelled' 
                 WHERE bookingid = $1 
                 AND room_status NOT IN ('Cancelled', 'Checked-Out') 
                 RETURNING *`,
                [id]
            );

            // Because of our DB trigger, updating these rooms automatically updates 
            // the parent `booking` table status. We don't need to do it manually here.
            return updatedRooms;
        },
        result => {
            // If the array is empty, it means there were no active rooms to cancel
            if (!result || result.length === 0) {
                return res.status(400).send("No eligible rooms found to cancel or booking not found.");
            }
            return res.status(200).json({ 
                message: "Booking cancelled successfully", 
                rooms_cancelled: result.length 
            });
        }
    );
}

// DELETE ONE ROOM
export async function deleteRoom(req: Request, res: Response) {
    const { roomId } = req.params;
    rlsWrapper("delete-room", req.user, async t => {
        return await t.oneOrNone(`DELETE FROM booked_room WHERE id=$1 RETURNING *`, [roomId]);
    }, result => res.status(200).json({ message: "Room removed", result }));
}

// DELETE ENTIRE BOOKING
export async function deleteBooking(req: Request, res: Response) {
    const { id } = req.params;
    rlsWrapper("delete-booking", req.user, async t => {
        // ON DELETE CASCADE will handle removing the rooms automatically
        return await t.oneOrNone(`DELETE FROM booking WHERE id=$1 AND hotelid=$2 RETURNING *`, [id, req.user.hotelid]);
    }, result => res.status(200).json({ message: "Booking and all associated rooms deleted" }));
}
