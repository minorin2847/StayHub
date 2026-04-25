import type { NextFunction, Request, Response } from "express";
import Reserve from "./reserve.js"; 
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";
import db from "@/database/db.js";

const pgp = pgPromise(); 

// Column definitions for partial updates
const reserveColumns = new pgp.helpers.ColumnSet(
    [
        { name: 'userid', prop: 'userID', skip: (c: any) => c.value === undefined },
        { name: 'guestid', prop: 'guestID', skip: (c: any) => c.value === undefined }
    ],
    { table: "reserves" }
);

const reservedRoomColumns = new pgp.helpers.ColumnSet(
    [
        { name: 'booking_status', skip: (c: any) => c.value === undefined },
        { name: 'payment_status', skip: (c: any) => c.value === undefined },
        { name: 'checkin_date', skip: (c: any) => c.value === undefined },
        { name: 'checkout_date', skip: (c: any) => c.value === undefined },
        { name: 'num_adults', skip: (c: any) => c.value === undefined },
        { name: 'num_children', skip: (c: any) => c.value === undefined },
        { name: 'final_price', skip: (c: any) => c.value === undefined },
        { name: 'special_requests', skip: (c: any) => c.value === undefined }
    ],
    { table: "reserved_room" }
);


/**
 * STAFF ACTION: Approve Reservation
 * Staff reviews an 'Awaiting Confirmation' reserve and clicks approve.
 * This runs the process_online_checkout procedure.
 */
export async function approveReserve(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params; // reserveID

    rlsWrapper("approve-reserve", req.user, async t => {
        // Calls the SQL procedure to convert the cart to actual bookings
        await t.none(`CALL process_online_checkout($1)`, [id]);
        
        // Return the fresh aggregate data for the dashboard
        return await t.one(
            `SELECT * FROM vw_reserve_details WHERE id = $1`, 
            [id]
        );
    }, result => res.status(200).json({ 
        message: "Reservation approved and converted to PMS Booking.", 
        reserve: result 
    }));
}

/**
 * Edit Reserve Header (User / Guest)
 */
export async function editReserve(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { userID, guestID } = req.body;

    const updateData = { userID, guestID };
    Object.keys(updateData).forEach(key => 
        (updateData as any)[key] === undefined && delete (updateData as any)[key]
    );

    if (Object.keys(updateData).length === 0) {
        return res.status(400).send("No valid header data provided.");
    }

    rlsWrapper("edit-reserve-header", req.user, async t => {
        const query = pgp.helpers.update(updateData, reserveColumns) 
                    + pgp.as.format(' WHERE id=$1 RETURNING *', [id]);

        return await t.oneOrNone(
            `WITH updated AS (${query}) 
             SELECT v.* FROM vw_reserve_details v 
             INNER JOIN updated u ON v.id = u.id`,
            [], 
            (row: any) => new Reserve(row)
        );
    }, result => {
        if (!result) return res.status(404).send("Reserve not found!");
        return res.status(200).json(result);
    });
}

/**
 * Edit a specific room inside a reservation cart
 * Note: Employees should only edit rooms belonging to their hotel!
 */
export async function editReservedRoom(req: Request, res: Response) {
    const { roomId } = req.params; 
    const updateData = req.body;

    rlsWrapper("edit-reserved-room", req.user, async t => {
        const query = pgp.helpers.update(updateData, reservedRoomColumns) 
                    + pgp.as.format(' WHERE id=$1 AND hotelid=$2 RETURNING *', [roomId, req.user.hotelid]);
        
        return await t.oneOrNone(query);
    }, result => {
        if (!result) return res.status(404).send("Reserved room entry not found or permission denied");
        res.status(200).json(result);
    });
}

/**
 * Cancel an entire reservation and its connected PMS bookings
 */
export async function cancelReserve(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    rlsWrapper("cancel-reserve", req.user, async t => {
        // Calls our new SQL procedure to cancel both the cart and the stay
        await t.none(`CALL cancel_online_reserve($1)`, [id]);
        return { message: "Online reserve and corresponding bookings cancelled successfully." };
    }, result => res.status(200).json(result));
}

/**
 * Delete an entire reservation cart
 */
export async function deleteReserve(req: Request, res: Response) {
    const { id } = req.params;
    rlsWrapper("delete-reserve", req.user, async t => {
        // ON DELETE CASCADE will handle removing the reserved_room entries automatically
        // Note: You may want to handle the connected `booking` records manually or let them detach (SET NULL)
        return await t.oneOrNone(`DELETE FROM reserves WHERE id=$1 RETURNING *`, [id]);
    }, result => res.status(200).json({ message: "Reserve deleted" }));
}

/**
 * Delete a specific room from a reservation
 */
export async function deleteReservedRoom(req: Request, res: Response) {
    const { roomId } = req.params;
    rlsWrapper("delete-reserved-room", req.user, async t => {
        return await t.oneOrNone(
            `DELETE FROM reserved_room WHERE id=$1 AND hotelid=$2 RETURNING *`, 
            [roomId, req.user.hotelid]
        );
    }, result => res.status(200).json({ message: "Reserved room removed", result }));
}



/**
 * Add to Cart: Inserts a room into a user's Pending reserve.
 * No guest information is required at this stage.
 */
export async function addToReserves(req: Request, res: Response) {
    const userID = req.user.id; 
    const { 
        hotelID, 
        roomID, 
        checkin_date, 
        checkout_date, 
        num_adults, 
        num_children, 
        final_price, 
        special_requests 
    } = req.body;

    try {
        const result = await db.tx(async t => {
            // 1. Find an existing 'Pending' cart for this user
            let reserve = await t.oneOrNone(
                `SELECT id FROM reserves WHERE userID = $1 AND status = 'Pending' LIMIT 1`,
                [userID]
            );

            // 2. If no pending cart exists, create a new one WITHOUT a guestID
            if (!reserve) {
                reserve = await t.one(
                    `INSERT INTO reserves (userID, status) 
                     VALUES ($1, 'Pending') RETURNING id`,
                    [userID]
                );
            }

            // 3. Generate an 8-character confirmation code
            const confCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            // 4. Insert the room into the cart (reserved_room)
            const newRoom = await t.one(
                `INSERT INTO reserved_room (
                    reserveID, hotelID, roomID, confirmation_code, 
                    booking_status, payment_status, checkin_date, checkout_date, 
                    num_adults, num_children, final_price, special_requests
                ) VALUES (
                    $1, $2, $3, $4, 
                    'Pending', 'Unpaid', $5, $6, 
                    $7, $8, $9, $10
                ) RETURNING *`,
                [
                    reserve.id, hotelID, roomID, confCode, 
                    checkin_date, checkout_date, 
                    num_adults || 1, num_children || 0, final_price, special_requests
                ]
            );

            return newRoom;
        });

        res.status(200).json({ message: "Added to cart successfully", room: result });
    } catch (error: any) {
        console.error("Error in addToReserves:", error);
        res.status(500).json({ error: error.message || "Failed to add room to cart." });
    }
}

/**
 * Remove from Cart: Allows a user to remove a specific room from their pending cart
 */
export async function removeFromReserves(req: Request, res: Response) {
    const { roomId } = req.params;
    const userID = req.user.id;

    try {
        // Ensure the user actually owns the cart this room belongs to
        const result = await db.oneOrNone(
            `DELETE FROM reserved_room 
             WHERE id = $1 
             AND reserveID IN (SELECT id FROM reserves WHERE userID = $2 AND status = 'Pending') 
             RETURNING *`,
            [roomId, userID]
        );

        if (!result) return res.status(404).send("Item not found in your cart.");
        
        res.status(200).json({ message: "Item removed from cart" });
    } catch (error: any) {
        console.error("Error in removeFromReserves:", error);
        res.status(500).json({ error: error.message || "Failed to remove item from cart." });
    }
}

/**
 * USER ACTION: Submit Cart
 * Requires guest information (either an ID or new details) to finalize the cart.
 */
export async function submitCart(req: Request, res: Response, next: NextFunction) {
    const userID = req.user.id;
    
    // Expecting either a guestID OR raw guest details from the checkout form
    const { guestID, first_name, last_name, phone, email, id_card_number, address } = req.body;

    try {
        const result = await db.tx(async t => {
            // 1. Find the active pending cart
            const activeCart = await t.oneOrNone(
                `SELECT id FROM reserves WHERE userID = $1 AND status = 'Pending' LIMIT 1`,
                [userID]
            );

            if (!activeCart) throw new Error("No pending cart found to submit.");

            let finalGuestID = guestID;

            // 2. If no guestID was provided, find or create the guest record
            if (!finalGuestID) {
                if (!first_name || !last_name || !phone) {
                    throw new Error("Guest information (first name, last name, phone) is required to checkout.");
                }

                // Look up a hotelID from the cart so we can link the guest to a hotel properly
                const cartRoom = await t.oneOrNone(
                    `SELECT hotelID FROM reserved_room WHERE reserveID = $1 LIMIT 1`, 
                    [activeCart.id]
                );
                
                if (!cartRoom) {
                    throw new Error("Your cart is empty. Cannot submit.");
                }

                const guestHotelID = cartRoom.hotelid;

                // Check if guest exists by phone number
                let guest = await t.oneOrNone(`SELECT id FROM guests WHERE phone = $1 LIMIT 1`, [phone]);
                
                if (!guest) {
                    guest = await t.one(
                        `INSERT INTO guests (hotelID, first_name, last_name, phone, email, id_card_number, address) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                        [guestHotelID, first_name, last_name, phone, email, id_card_number, address]
                    );
                }
                finalGuestID = guest.id;
            }

            // 3. Attach the guestID to the master cart
            await t.none(
                `UPDATE reserves SET guestID = $1 WHERE id = $2`,
                [finalGuestID, activeCart.id]
            );

            // 4. Change room statuses to trigger the workflow
            await t.none(
                `UPDATE reserved_room 
                 SET booking_status = 'Awaiting Confirmation' 
                 WHERE reserveID = $1 AND booking_status = 'Pending'`,
                [activeCart.id]
            );

            return { message: "Your reservation request has been submitted to the hotel.", reserveID: activeCart.id };
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error in submitCart:", error);
        res.status(400).json({ error: error.message || "Failed to submit cart." });
    }
}

