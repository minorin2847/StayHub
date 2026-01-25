import { Router } from "express";
import {
  forgotPassword,
  resetPassword,
  signUp,
  login,
  logout,
} from "./auth.handler.js";

const authRouter = Router();
// POST /auth/forgot-password
// Body: {
//  email
//}
authRouter.post("/forgot-password", forgotPassword);

// POST /auth/reset-password
// Body: {
//  token,
//  newPassword
//}
authRouter.post("/reset-password", resetPassword);

// POST /user/signup
// Body: {
//  username,
//  password,
//  firstname,
//  lastname,
//  email
// }
authRouter.post("/register", signUp);

// POST /auth/login
// Body: {
//  username,
//  password
//}
authRouter.post("/login", login);

// POST /user/logout
authRouter.post("/logout", logout);

export default authRouter;
