import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { createRoomType, deleteRoomType, editRoomType } from "./room.handler.js";

const roomRoute = Router();


// POST /dashboard/rooms/types/create
roomRoute.post("/types/create", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), createRoomType);

// PATCH /dashboard/rooms/types/edit/:id
roomRoute.patch("/types/edit/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), editRoomType);

// DELETE /dashboard/rooms/types/delete/:id
roomRoute.delete("/types/delete/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), deleteRoomType);

export { roomRoute };