import { login, logout, signUp, isLoggedIn } from "@/auth/auth.js";
import express, { type NextFunction, type Request, type Response } from 'express';
<<<<<<< Updated upstream
=======
import User from "./user.js";
import Account from "../account/account.js";
import { findUser } from "./user.handler.js";
>>>>>>> Stashed changes

const router = express.Router();

// POST /user/login
// Body: {
//  username,
//  password
// }
router.post("/login", login);

// POST /user/dashboard/login
// router.post("/dashboard/login", checkRole(["ROLE_ADMIN"]), login);

// POST /user/logout
router.post("/logout", logout);

// POST /user/signup
// Body: {
//  username,
<<<<<<< Updated upstream
//  password
=======
//  password,
//  firstName,
//  lastName,
//  email
>>>>>>> Stashed changes
// }
router.post("/signup", signUp);

// GET /user/auth
<<<<<<< Updated upstream
router.get("/auth", isLoggedIn, (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json(req.user);
=======
router.get("/auth", isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {
    const user = await findUser(req.user.id);
    
    res.status(200).json(user);
    } catch (err) {
        res.status(500).send(`An error occured!\n${err}`);
    }
>>>>>>> Stashed changes
});


export default router;
