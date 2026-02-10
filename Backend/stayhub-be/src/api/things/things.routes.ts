import { Router } from "express";
import { getThingsToDo } from "./things.handler.js";

const thingsRouter = Router();

thingsRouter.get("/", getThingsToDo);

export default thingsRouter;
