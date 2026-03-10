import { Router } from "express";
import { createEmployee, login, logout } from "./employee.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";

const employeeRoute = Router()

employeeRoute.post("/login", login);

employeeRoute.post("/logout", logout);

employeeRoute.post("/signup", isLoggedIn, createEmployee);

export default employeeRoute;