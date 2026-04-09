import { Router } from "express";
import { addRole, deleteRole, editRole, getAllRoles, getRole } from "./roles.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";


const roleRoutes = Router();
roleRoutes.get("/", isLoggedIn, getAllRoles)
roleRoutes.get("/get/:name", isLoggedIn, getRole);
roleRoutes.patch("/edit/:name", isLoggedIn, hasPermission(["ADMINISTRATOR"]), editRole);
roleRoutes.delete("/delete/:name", isLoggedIn, hasPermission(["ADMINISTRATOR"]), deleteRole);
roleRoutes.post("/add", isLoggedIn, hasPermission(["ADMINISTRATOR"]), addRole)

export default roleRoutes;