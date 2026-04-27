import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { 
    createBooking, 
    deleteBooking, 
    editBooking, 
    addRoomToBooking,
    editRoom,
    deleteRoom,
    cancelBooking,
    getRoomStatus
} from "./booking.handler.js";

const bookingsRoute = Router();

/** * BOOKING HEADER ROUTES
 * These affect the entire group or the guest associated with the booking
 */

// POST /employee/bookings/add - Create a booking with multiple rooms
bookingsRoute.post("/add", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), createBooking);

// PATCH /employee/bookings/edit/:id - Update booking header (Guest/ReserveID)
bookingsRoute.patch("/edit/:id", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), editBooking);

// DELETE /employee/bookings/delete/:id - Delete entire booking and all rooms (Cascade)
bookingsRoute.delete("/delete/:id", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), deleteBooking);

// GET /employee/bookings/room-status - Live room inventory status
bookingsRoute.get("/room-status", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), getRoomStatus);


/** * INDIVIDUAL ROOM ROUTES
 * These allow for granular control over rooms within a booking
 */

// POST /employee/bookings/:bookingId/rooms/add - Add a new room to an existing booking
bookingsRoute.post("/:bookingId/rooms/add", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), addRoomToBooking);

// PATCH /employee/bookings/rooms/edit/:roomId - Update room status, dates, or price
// (This is the route that will trigger the booking_status update)
bookingsRoute.patch("/rooms/edit/:roomId", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), editRoom);
// POST /employee/bookings/cancel/:id - Cancel entire booking
bookingsRoute.post("/cancel/:id", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), cancelBooking);
// DELETE /employee/bookings/rooms/delete/:roomId - Remove a single room from a booking
bookingsRoute.delete("/rooms/delete/:roomId", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), deleteRoom);

export { bookingsRoute };
