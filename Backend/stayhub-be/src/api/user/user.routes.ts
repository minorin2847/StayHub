import { login, logout, signUp, checkRole } from "@/auth/auth.js";
import express from 'express';
import { UserRole } from "./user.enum.js";

const router = express.Router();

// POST /user/login
// Body: {
//  username,
//  password
// }
router.post("/login", login("/", "/login"));

// POST /user/dashboard/login
router.post("/dashboard/login", checkRole([UserRole.ROLE_ADMIN]), login("/dashboard", "/dashboard/login"));

// POST /user/logout
router.post("/logout", logout);

// POST /user/signup
// Body: {
//  username,
//  password
// }
router.post("/signup", signUp);


export default router;
