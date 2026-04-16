import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { createRoom, createRoomType, deleteRoom, deleteRoomType, editRoom, editRoomType, getAllRooms, getAllRoomTypes } from "./room.handler.js";

const roomRoute = Router();

// GET /employee/rooms/types
roomRoute.get("/types", isLoggedIn, getAllRoomTypes);

// POST /employee/rooms/types/create
roomRoute.post("/types/create", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), createRoomType);

// PATCH /employee/rooms/types/edit/:id
roomRoute.patch("/types/edit/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), editRoomType);

// DELETE /employee/rooms/types/delete/:id
roomRoute.delete("/types/delete/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), deleteRoomType);

// GET /employee/rooms
roomRoute.get("/", isLoggedIn, getAllRooms);

// POST /employee/rooms/create
roomRoute.post("/create", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), createRoom);

// PATCH /employee/rooms/edit/:id
roomRoute.patch("/edit/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), editRoom);

// DELETE /employee/rooms/delete/:id
roomRoute.delete("/delete/:id", isLoggedIn, hasPermission(['MANAGE_HOTEL']), deleteRoom);

export { roomRoute };