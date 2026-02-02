import { Router } from "express";
import { dashboardLogin } from "./dashboard.handler.js";

const dashboardRoute = Router();

// dashboardRoute.get("/", );

dashboardRoute.post("/login", dashboardLogin);
export default dashboardRoute;