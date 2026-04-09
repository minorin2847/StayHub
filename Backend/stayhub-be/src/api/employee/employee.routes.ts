import { Router } from "express";
import { createEmployee, deleteEmployee, editEmployee, getEmployee, login, logout } from "./employee.handler.js";
import { isLoggedIn } from "../auth/auth.handler.js";

const employeeRoute = Router()

employeeRoute.post("/login", login);

employeeRoute.post("/logout", logout);

employeeRoute.post("/signup", isLoggedIn, createEmployee);

employeeRoute.get("/get/:id", isLoggedIn, getEmployee);
employeeRoute.patch("/edit/:id", isLoggedIn, editEmployee);
employeeRoute.delete("/delete/:id", isLoggedIn, deleteEmployee);
export default employeeRoute;