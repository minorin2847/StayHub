import { Router } from "express";
import { getHotels, createHotel, updateHotel, deleteHotel, hasPermission } from "./hotels.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";

const hotelsRoute = Router();

hotelsRoute.get("/", getHotels);
hotelsRoute.post("/", isLoggedIn, hasPermission('MANAGE_HOTEL'), createHotel);
hotelsRoute.put("/:id", isLoggedIn, hasPermission('MANAGE_HOTEL'), updateHotel);
hotelsRoute.delete("/:id", isLoggedIn, hasPermission('MANAGE_HOTEL'), deleteHotel);

export default hotelsRoute;
