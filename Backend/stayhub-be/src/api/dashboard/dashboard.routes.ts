import { Router } from "express";
import { dashboardLogin, getEmployee } from "./dashboard.handler.js";
import { isLoggedIn } from "@/auth/auth.js";

const dashboardRoute = Router();

dashboardRoute.get("/", isLoggedIn, getEmployee);

dashboardRoute.post("/login", dashboardLogin);
export default dashboardRoute;