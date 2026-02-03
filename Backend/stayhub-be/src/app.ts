import express from 'express';
import cors from 'cors';
import initialize from './database/initialize.js';
import { passport, initializeSession } from '@/utils/initializeSession.js';
/* Express */
const app = express();
const port = process.env.PORT;
/* Routes */
import helloRoute from "./api/hello/hello.routes.js";
import userRoute from "@/api/user/user.routes.js";
import authRouter from './api/auth/auth.routes.js';
import dashboardRoute from "@/api/dashboard/dashboard.routes.js";
/* Middleware */
app.use(cors({credentials: true, origin: process.env.FRONTEND_URL}));
app.use(express.json());

/* Auth session */
app.use(initializeSession());

app.use(passport.initialize());
app.use(passport.authenticate('session'));


/* Routes */
app.use("/hello", helloRoute);
app.use("/user", userRoute);
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRoute);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

// Create table if not exists, quit server when failed
initialize().catch(err => server.close(() => {
    console.log("Server stopped");
    console.error(err.message);
}));