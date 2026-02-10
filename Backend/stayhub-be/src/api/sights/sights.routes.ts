import { Router } from "express";
import { getTopSights } from "./sights.handler.js";

const sightsRouter=Router()
sightsRouter.get("/",getTopSights)
export default sightsRouter
