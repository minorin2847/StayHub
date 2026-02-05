import express from 'express';
import cors from 'cors';
import initializeTable from './database/initializeTable.js';
import { passport, initializeSession } from '@/utils/initializeSession.js';
/* Express */
const app = express();
const port = process.env.PORT;
/* Routes */
import helloRoute from "./api/hello/hello.routes.js";
import userRoute from "@/api/user/user.routes.js";
import authRouter from './api/auth/auth.routes.js';
import destinationRouter from './api/destinations/destination.routes.js';
import dealsRouter from './api/deals/deals.routes.js';
import sightsRouter from './api/sights/sights.routes.js';

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
app.use("/destinations", destinationRouter)
app.use("/deals",dealsRouter)
app.use("sights",sightsRouter)

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

// Create table if not exists, quit server when failed
initializeTable().catch(err => server.close(() => {
    console.log("Server stopped");
    console.error(err.message);
}));