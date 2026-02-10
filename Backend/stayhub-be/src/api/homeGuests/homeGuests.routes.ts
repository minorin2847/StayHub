import { Router } from "express";
import { getHomeGuests } from "./homeGuests.handler.js";

const homeGuestsRouter = Router()
homeGuestsRouter.get("/",getHomeGuests)
export default homeGuestsRouter