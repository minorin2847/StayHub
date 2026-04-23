import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { createService, deleteService, editService, getAllServices, getUniqueServiceTypes } from "./services.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";

const publicServicesRoute = Router();
const privateServicesRoute = Router();

// GET /employee/services/
privateServicesRoute.get("/", isLoggedIn, getAllServices);

// GET /employee/services/types
privateServicesRoute.get("/types", isLoggedIn, getUniqueServiceTypes);4

// POST /employee/services/add
privateServicesRoute.post("/add", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), createService);

// PATCH /employee/services/edit/:id
privateServicesRoute.patch("/edit/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), editService);

// DELETE /employee/services/delete/:id
privateServicesRoute.delete("/delete/:id", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), deleteService);

export { publicServicesRoute, privateServicesRoute };