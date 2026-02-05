import { login, logout, signUp, isLoggedIn } from "@/auth/auth.js";
import express, { type NextFunction, type Request, type Response } from 'express';
import User from "./user.js";
import Account from "../account/account.js";
import { findUser } from "./user.handler.js";

const router = express.Router();



// POST /user/dashboard/login
// router.post("/dashboard/login", checkRole(["ROLE_ADMIN"]), login);


// GET /user/auth

router.get("/auth", isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {
    const user = await findUser(req.user.id);
    
    res.status(200).json({...user, ...req.user});
    } catch (err) {
        res.status(500).send(`An error occured!\n${err}`);
    }
});


export default router;
