import { Router } from "express";
import { createEmployeeHandler } from "./employee.handler.js";

const employeeRouter = Router();

employeeRouter.post("/", createEmployeeHandler);

export default employeeRouter;