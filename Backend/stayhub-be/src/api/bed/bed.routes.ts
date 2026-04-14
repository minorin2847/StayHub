import { Router } from "express";
import { addBeds, deleteBed, editBed, getBeds, insertBedToHotel, removeBedFromHotel } from "./bed.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";

const publicBedRoute = Router();
const employeeBedRoute = Router();
// GET /beds
publicBedRoute.get("/", getBeds);



// POST /employee/beds/create
// Body: {name: string, count: number }
employeeBedRoute.post("/create", isLoggedIn, hasPermission(["ADMINISTRATOR", "MANAGE_HOTEL"]), addBeds);

// PATCH /employee/beds/edit/:name
// Body: {name?: string}
employeeBedRoute.patch("/edit/:name", isLoggedIn, hasPermission(["ADMINISTRATOR"]), editBed);

// DELETE /employee/beds/delete/:name
employeeBedRoute.delete("/delete/:name", isLoggedIn, hasPermission(["ADMINISTRATOR"]), deleteBed);

// POST /employee/beds/hotels/add
// Body: {name: string}
employeeBedRoute.post("/hotels/add", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), insertBedToHotel);

// DELETE /employee/beds/hotels/remove/:name
employeeBedRoute.delete("/hotels/remove/:name", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), removeBedFromHotel);


export { employeeBedRoute, publicBedRoute }
