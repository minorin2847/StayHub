import { login, logout, signUp, isLoggedIn } from "@/api/auth/auth.handler.js";
import express, { type NextFunction, type Request, type Response } from 'express';
import User from "./user.js";
import { findUser } from "./user.handler.js";

const router = express.Router();



// POST /user/dashboard/login
// router.post("/dashboard/login", checkRole(["ROLE_ADMIN"]), login);


// GET /user/auth



export default router;
