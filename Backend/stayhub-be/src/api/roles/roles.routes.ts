import { Router } from "express";
import { getAllRoles } from "./roles.handler.js";


const roleRoutes = Router();

roleRoutes.get("/", getAllRoles);

export default roleRoutes;