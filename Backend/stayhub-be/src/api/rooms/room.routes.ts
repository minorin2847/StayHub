import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { uploadImage } from "../../middlewares/upload.js";

import {
  createRoom,
  editRoom,
  deleteRoom,
  getAllRooms,

  createRoomType,
  editRoomType,
  deleteRoomType,
  getAllRoomTypes,
  
  getRoomTypePage,

  uploadRoomImage,
  getRoomImages,
  deleteRoomImage,
} from "./room.handler.js";

const roomRoute = Router();
const publicRoomRoute = Router();

const canManageRooms = hasPermission([
  "MANAGE_ROOM",
  "MANAGE_HOTEL",
  "MANAGE_BRANCH",
  "ADMINISTRATOR",
]);

const canViewRooms = hasPermission([
  "MANAGE_BOOKING",
  "MANAGE_ROOM",
  "MANAGE_HOTEL",
  "MANAGE_BRANCH",
  "ADMINISTRATOR",
]);

/**
 * ROOM TYPES
 * Mounted under: /employee/rooms
 *
 * GET    /employee/rooms/types
 * POST   /employee/rooms/types/create
 * PATCH  /employee/rooms/types/edit/:id
 * PUT    /employee/rooms/types/edit/:id
 * DELETE /employee/rooms/types/delete/:id
 */
roomRoute.get(
  "/types",
  isLoggedIn,
  canViewRooms,
  getAllRoomTypes
);

roomRoute.post(
  "/types/create",
  isLoggedIn,
  canManageRooms,
  createRoomType
);

roomRoute.patch(
  "/types/edit/:id",
  isLoggedIn,
  canManageRooms,
  editRoomType
);

roomRoute.put(
  "/types/edit/:id",
  isLoggedIn,
  canManageRooms,
  editRoomType
);

roomRoute.delete(
  "/types/delete/:id",
  isLoggedIn,
  canManageRooms,
  deleteRoomType
);

/**
 * ROOMS
 * Mounted under: /employee/rooms
 *
 * GET    /employee/rooms
 * POST   /employee/rooms/create
 * PATCH  /employee/rooms/edit/:id
 * PUT    /employee/rooms/edit/:id
 * DELETE /employee/rooms/delete/:id
 */
roomRoute.get(
  "/",
  isLoggedIn,
  canViewRooms,
  getAllRooms
);

roomRoute.post(
  "/create",
  isLoggedIn,
  canManageRooms,
  createRoom
);

roomRoute.patch(
  "/edit/:id",
  isLoggedIn,
  canManageRooms,
  editRoom
);

roomRoute.put(
  "/edit/:id",
  isLoggedIn,
  canManageRooms,
  editRoom
);

roomRoute.delete(
  "/delete/:id",
  isLoggedIn,
  canManageRooms,
  deleteRoom
);

/**
 * ROOM IMAGES
 * Mounted under: /employee/rooms
 *
 * GET    /employee/rooms/:roomId/images
 * POST   /employee/rooms/:roomId/images
 * DELETE /employee/rooms/:roomId/images/:imageId
 */
roomRoute.get(
  "/:roomId/images",
  isLoggedIn,
  canViewRooms,
  getRoomImages
);

roomRoute.post(
  "/:roomId/images",
  isLoggedIn,
  canManageRooms,
  uploadImage.single("image"),
  uploadRoomImage
);

roomRoute.delete(
  "/:roomId/images/:imageId",
  isLoggedIn,
  canManageRooms,
  deleteRoomImage
);


// GET /rooms/:id
publicRoomRoute.get("/:id", getRoomTypePage);
export { roomRoute, publicRoomRoute };