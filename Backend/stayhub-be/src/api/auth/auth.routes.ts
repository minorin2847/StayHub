import { Router } from "express";
import { forgotPassword, resetPassword, register } from "./auth.handler.js";

const authRouter = Router();

authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/register', register);
export default authRouter;