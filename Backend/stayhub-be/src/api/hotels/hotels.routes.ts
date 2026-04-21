import { Router } from "express";
import { getHotels, createHotel, updateHotel, deleteHotel } from "./hotels.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { uploadImage } from "../../middlewares/upload.js";
import { uploadHotelImage } from "./hotels.handler.js";

const hotelsRoute = Router();

hotelsRoute.get("/", isLoggedIn, getHotels);
hotelsRoute.post("/", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), createHotel);
hotelsRoute.put("/:id", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), updateHotel);
hotelsRoute.delete("/:id", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), deleteHotel);

// route to upload images for hotels
hotelsRoute.post(
  "/:hotelId/images",
  isLoggedIn,
  hasPermission(["MANAGE_HOTEL", "MANAGE_BRANCH", "ADMINISTRATOR"]),
  uploadImage.single("image"),
  uploadHotelImage
);

export default hotelsRoute;
