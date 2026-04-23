import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { createGuest, deleteGuest, editGuest, getAllGuests } from "./guests.handler.js";

const guestsRoute = Router();

// GET /employee/guests/
guestsRoute.get("/", isLoggedIn, getAllGuests);

// POST /employee/guests/add
guestsRoute.post("/add", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), createGuest);

// PATCH /employee/guests/edit/:id
guestsRoute.patch("/edit/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), editGuest);

// DELETE /employee/guests/delete/:id
guestsRoute.delete("/delete/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), deleteGuest);

export { guestsRoute };