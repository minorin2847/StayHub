import { Router } from "express";
import { getHotels, createHotel, updateHotel, deleteHotel } from "./hotels.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";

const hotelsRoute = Router();

hotelsRoute.get("/", getHotels);
hotelsRoute.post("/", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), createHotel);
hotelsRoute.put("/:id", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), updateHotel);
hotelsRoute.delete("/:id", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), deleteHotel);

export default hotelsRoute;
