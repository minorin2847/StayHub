import express from 'express';
import cors from 'cors';
import initializeTable from './database/initializeTable.js';
/* Express */
const app = express();
const port = process.env.PORT;
/* Routes */
import helloRoute from "./api/hello/hello.routes.js";


/* Middleware */
app.use(cors());
app.use(express.json());

/* Routes */
app.use("/hello", helloRoute);


const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

// Create table if not exists, quit server when failed
initializeTable().catch(err => server.close(() => {
    console.log("Server stopped");
    console.error(err.message);
}));