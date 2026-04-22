import express, { Router } from 'express';
import cors from 'cors';
import initialize from './database/initialize.js';
import { passport, initializeUserSession, initializeEmployeeSession } from '@/utils/initializeSession.js';
/* Express */
const app = express();
const port = process.env.PORT;
/* Routes */
import userRoute from "@/api/user/user.routes.js";
import authRouter from './api/auth/auth.routes.js';
import dashboardRoute from './api/dashboard/dashboard.routes.js';
import destinationRouter from './api/destinations/destination.routes.js';
import dealsRouter from './api/deals/deals.routes.js';
import sightsRouter from './api/sights/sights.routes.js';
import thingsRouter from './api/things/things.routes.js';
import homeGuestsRouter from './api/homeGuests/homeGuests.routes.js';
import employeeRoute from './api/employee/employee.routes.js';
import hotelsRouter from './api/hotels/hotels.routes.js';
import branchRoute from './api/branch/branch.routes.js';
import roleRoutes from './api/roles/roles.routes.js';
import { employeeBedRoute, publicBedRoute } from './api/bed/bed.routes.js';
import { privateServicesRoute } from './api/services/services.routes.js';
import { roomRoute } from './api/rooms/room.routes.js';
import { guestsRoute } from './api/guests/guests.routes.js';
import { bookingsRoute } from './api/bookings/booking.routes.js';

/* Middleware */
app.use(cors({credentials: true, origin: process.env.FRONTEND_URL}));
app.use(express.json());


/*
===========
   Routes 
============*/

/* User routes */
const user = Router();
user.use(initializeUserSession());
user.use(passport.initialize());
user.use(passport.session());
user.use("/", userRoute);
user.use("/auth", authRouter);
app.use("/user", user);

/* Employee routes */
const employee = Router();
employee.use(initializeEmployeeSession());
employee.use(passport.initialize());
employee.use(passport.session());
employee.use("/", employeeRoute);
employee.use("/dashboard", dashboardRoute);
employee.use("/hotels", hotelsRouter);
employee.use("/branches", branchRoute);
employee.use("/roles", roleRoutes);
employee.use("/beds", employeeBedRoute);
employee.use("/services", privateServicesRoute);
employee.use("/rooms", roomRoute);
employee.use("/guests", guestsRoute);
employee.use("/bookings", bookingsRoute);
app.use("/employee", employee);

/* No login */
app.use("/beds", publicBedRoute);
app.use("/destinations", destinationRouter);
app.use("/deals",dealsRouter);
app.use("/sights",sightsRouter);
app.use("/things", thingsRouter);
app.use("/homeGuests",homeGuestsRouter);
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

// Create table if not exists, quit server when failed
initialize().catch(err => server.close(() => {
    console.log("Server stopped");
    console.error(err.message);
}));