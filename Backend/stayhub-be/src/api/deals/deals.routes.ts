import { Router } from "express";
import { getDeals } from "./deals.handler.js";

const dealsRouter = Router();
dealsRouter.get("/", getDeals);

export default dealsRouter;