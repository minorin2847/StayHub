import { Router } from "express";
import { getHotels, createHotel, updateHotel, deleteHotel, getOtherRoomsInHotel } from "./hotels.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { uploadImage } from "../../middlewares/upload.js";
import { uploadHotelImage, getHotelImages, deleteHotelImage, setCoverImage } from "./hotels.handler.js";

const hotelsRoute = Router();
const publicHotelRoute = Router();
hotelsRoute.get("/", isLoggedIn, getHotels);
hotelsRoute.get("/get/:id", isLoggedIn, getHotels);
hotelsRoute.post("/create", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), createHotel);
hotelsRoute.put("/edit/:id", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), updateHotel);
hotelsRoute.delete("/delete/:id", isLoggedIn, hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), deleteHotel);

// route to upload images for hotels
hotelsRoute.get(
  "/:hotelId/images",
  isLoggedIn,
  hasPermission(["MANAGE_HOTEL", "MANAGE_BRANCH", "ADMINISTRATOR"]),
  getHotelImages
);

hotelsRoute.post(
  "/:hotelId/images",
  isLoggedIn,
  hasPermission(["MANAGE_HOTEL", "MANAGE_BRANCH", "ADMINISTRATOR"]),
  uploadImage.single("image"),
  uploadHotelImage
);

hotelsRoute.delete(
  "/:hotelId/images/:imageId",
  isLoggedIn,
  hasPermission(["MANAGE_HOTEL", "MANAGE_BRANCH", "ADMINISTRATOR"]),
  deleteHotelImage
);

hotelsRoute.put(
  "/:hotelId/images/:imageId/cover",
  isLoggedIn,
  hasPermission(["MANAGE_HOTEL", "MANAGE_BRANCH", "ADMINISTRATOR"]),
  setCoverImage
);


publicHotelRoute.get("/:hotel_id/other-rooms", getOtherRoomsInHotel);

export default hotelsRoute;
export {publicHotelRoute};
