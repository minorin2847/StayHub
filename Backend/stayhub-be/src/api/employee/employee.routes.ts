import { Router } from "express";
import { login, logout } from "./employee.handler.js";


const employeeRoute = Router()

employeeRoute.post("/login", login);

employeeRoute.post("/logout", logout);

export default employeeRoute;