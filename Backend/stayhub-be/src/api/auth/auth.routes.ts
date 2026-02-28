import { Router, type NextFunction, type Request, type Response } from "express";
import {
  forgotPassword,
  resetPassword,
  signUp,
  login,
  logout,
  isLoggedIn,
} from "./auth.handler.js";

const authRouter = Router();
// POST /user/auth/forgot-password
// Body: {
//  email
//}
authRouter.post("/forgot-password", forgotPassword);

// POST /user/auth/reset-password
// Body: {
//  token,
//  newPassword
//}
authRouter.post("/reset-password", resetPassword);

// POST /user/auth/register
// Body: {
//  username,
//  password,
//  firstname,
//  lastname,
//  email
// }
authRouter.post("/register", signUp);

// POST /user/auth/login
// Body: {
//  username,
//  password
//}
authRouter.post("/login", login);

// POST /user/auth/logout
authRouter.post("/logout", logout);


authRouter.get("/", isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {
    // const user = await findUser(req.user.id);
    
    res.status(200).json(req.user);
    } catch (err) {
        res.status(500).send(`An error occured!\n${err}`);
    }
});

export default authRouter;
