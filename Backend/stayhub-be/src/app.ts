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

/* Middleware */
app.use(cors());
app.use(express.json());

/* Auth session */
app.use(initializeSession());
app.use(passport.authenticate('session'));


/* Routes */
app.use("/hello", helloRoute);
app.use("/users", userRoute);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

// Create table if not exists, quit server when failed
initializeTable().catch(err => server.close(() => {
    console.log("Server stopped");
    console.error(err.message);
}));