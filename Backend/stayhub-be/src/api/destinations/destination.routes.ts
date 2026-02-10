import { Router } from "express";
import { getDestinations } from "./destination.handler.js";

const destinationRouter = Router()
destinationRouter.get('/', getDestinations)
export default destinationRouter