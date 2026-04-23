import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { createBooking, deleteBooking, editBooking, getAllBookings } from "./booking.handler.js";

const bookingsRoute = Router();

// GET /employee/bookings/
bookingsRoute.get("/", isLoggedIn, getAllBookings);

// POST /employee/bookings/add
bookingsRoute.post("/add", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), createBooking);

// PATCH /employee/bookings/edit/:id
bookingsRoute.patch("/edit/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), editBooking);

// DELETE /employee/bookings/delete/:id
bookingsRoute.delete("/delete/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), deleteBooking);

export { bookingsRoute };