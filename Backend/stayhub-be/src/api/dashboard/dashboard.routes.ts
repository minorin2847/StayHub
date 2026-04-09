import { Router } from "express";
import { getBranches, getEmployee, getEmployeeAccounts, getRoles, hasPermission } from "./dashboard.handler.js";
import { isLoggedIn } from "@/api/auth/auth.handler.js";

const dashboardRoute = Router();
// GET /employee/dashboard/
dashboardRoute.get("/", isLoggedIn, getEmployee);


// GET /employee/dashboard/user
// Query: {name: string, start: number, end: number}
// Function: Search and return non-employee accounts (accounts without an employee profile)
//  with pagination [start, end)
dashboardRoute.get("/user", isLoggedIn, 
    hasPermission(['MANAGE_HOTEL', 'MANAGE_BRANCH', 'ADMINISTRATOR']), getEmployeeAccounts);

dashboardRoute.get("/branches", isLoggedIn,
    hasPermission(["ADMINISTRATOR"]), getBranches
)

dashboardRoute.get("/roles", isLoggedIn,
    hasPermission(["ADMINISTRATOR"]), getRoles
)
export default dashboardRoute;