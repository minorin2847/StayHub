import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { 
    addToReserves,
    createReservation,
    getReservationById,
    payReservation,
    removeFromReserves,
    // processOnlineCheckout, // (Your checkout handler)
    editReserve, 
    cancelReserve, 
    deleteReserve, 
    addReservedRoom,
    editReservedRoom, 
    deleteReservedRoom, 
    submitCart,
    approveReserve,
    getCart,
    getTripHistory,
} from "./reserve.handler.js";

const publicReservesRoute = Router();
const employeeReservesRoute = Router();

// ==========================================
// PUBLIC ROUTES (User Facing / E-Commerce)
// ==========================================

// POST /user/reserves/add - Add a room to the user's online cart
publicReservesRoute.post("/add", isLoggedIn, addToReserves);

// POST /user/reserves/reservations - Create a direct reservation from the client flow
publicReservesRoute.post("/reservations", isLoggedIn, createReservation);

// GET /user/reserves/reservations/:id - Fetch a direct reservation owned by the user
publicReservesRoute.get("/reservations/:id", isLoggedIn, getReservationById);

// POST /user/reserves/reservations/:id/pay - Confirm payment for a reservation
publicReservesRoute.post("/reservations/:id/pay", isLoggedIn, payReservation);

// DELETE /user/reserves/remove/:roomId - Remove a room from the cart
publicReservesRoute.delete("/remove/:roomId", isLoggedIn, removeFromReserves);

// POST /user/reserves/submit - User submits the cart for hotel review
publicReservesRoute.post("/submit", isLoggedIn, submitCart);
publicReservesRoute.get("/cart", isLoggedIn, getCart);
publicReservesRoute.get("/history", isLoggedIn, getTripHistory);



// ==========================================
// EMPLOYEE ROUTES (Dashboard / PMS Management)
// ==========================================

// PATCH /employee/reserves/edit/:id - Update reserve header (User/Guest ID)
employeeReservesRoute.patch("/edit/:id", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), editReserve);

// POST /employee/reserves/cancel/:id - Cancel entire reserve AND matching PMS bookings
employeeReservesRoute.post("/cancel/:id", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), cancelReserve);

// DELETE /employee/reserves/delete/:id - Delete entire reserve
employeeReservesRoute.delete("/delete/:id", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), deleteReserve);

// PATCH /employee/reserves/rooms/edit/:roomId - Update room status, dates, or payment
employeeReservesRoute.patch("/rooms/edit/:roomId", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), editReservedRoom);

// POST /employee/reserves/:reserveId/rooms/add - Add a reserve line for a room type, room assignment optional
employeeReservesRoute.post("/:reserveId/rooms/add", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), addReservedRoom);

// DELETE /employee/reserves/rooms/delete/:roomId - Remove a single room from the cart
employeeReservesRoute.delete("/rooms/delete/:roomId", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), deleteReservedRoom);

// POST /employee/reserves/approve/:id - Staff converts requested reserve into actual PMS booking
employeeReservesRoute.post("/approve/:id", isLoggedIn, hasPermission(["MANAGE_BOOKING"]), approveReserve);

export { publicReservesRoute, employeeReservesRoute };
