import { Router } from "express";
import { getBranches, getEmployee, getEmployeeAccounts, getRoles, hasPermission, getDashboardHotels, getDashboardRooms, getDashboardBeds, getDashboardHotelBeds, getDashboardServices, getDashboardRoomTypes } from "./dashboard.handler.js";
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
// get /employee/dashboard/hotels
dashboardRoute.get("/hotels", isLoggedIn,
    hasPermission(["MANAGE_BRANCH", "ADMINISTRATOR"]),
    getDashboardHotels
);


// GET /employee/dashboard/beds
dashboardRoute.get("/beds", isLoggedIn, getDashboardBeds);

// GET /employee/dashboard/hotels/beds
dashboardRoute.get("/hotels/beds", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), getDashboardHotelBeds);

// GET /employee/dashboard/services
dashboardRoute.get("/services", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), getDashboardServices);

// GET /employee/dashboard/rooms/types
dashboardRoute.get("/rooms/types", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), getDashboardRoomTypes);

// GET /employee/dashboard/rooms
dashboardRoute.get("/rooms", isLoggedIn, hasPermission(["MANAGE_HOTEL"]), getDashboardRooms);

export default dashboardRoute;