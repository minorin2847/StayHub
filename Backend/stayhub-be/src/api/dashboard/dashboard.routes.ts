import { Router } from "express";
import { dashboardLogin, getEmployee, getEmployeeAccounts, hasPermission } from "./dashboard.handler.js";
import { isLoggedIn } from "@/auth/auth.js";

const dashboardRoute = Router();

dashboardRoute.get("/", isLoggedIn, getEmployee);

// POST /dashboard/login
// Body: {username: string, password: string}
// Function: Login to dashboard
dashboardRoute.post("/login", dashboardLogin);


// GET /dashboard/non-employee
// Query: {name: string, start: number, end: number}
// Function: Search and return non-employee accounts (accounts without an employee profile)
//  with pagination [start, end)
dashboardRoute.get("/user", isLoggedIn, hasPermission('MANAGE_HOTEL'), getEmployeeAccounts);

export default dashboardRoute;