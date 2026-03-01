import { Router } from "express";
import { login, logout } from "./employee.handler.js";
import { createEmployeeHandler } from "./employee.handler.js";

const employeeRoute = Router()

employeeRoute.post("/login", login);

employeeRoute.post("/logout", logout);

employeeRoute.post("/", createEmployeeHandler);

export default employeeRoute;