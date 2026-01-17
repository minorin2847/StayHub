import { login, logout, signUp, checkRole, isLoggedIn } from "@/auth/auth.js";
import express, { type NextFunction, type Request, type Response } from 'express';

const router = express.Router();

// POST /user/login
// Body: {
//  username,
//  password
// }
router.post("/login", login);

// POST /user/dashboard/login
router.post("/dashboard/login", checkRole(["ROLE_ADMIN"]), login);

// POST /user/logout
router.post("/logout", logout);

// POST /user/signup
// Body: {
//  username,
//  password
// }
router.post("/signup", signUp);

// GET /user/auth
router.get("/auth", isLoggedIn, (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json(req.user);
});


export default router;
