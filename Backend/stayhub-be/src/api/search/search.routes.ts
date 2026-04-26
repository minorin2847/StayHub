import { Router } from "express";
import { searchRooms } from "./search.handler.js";

const searchRoute = Router();

// GET /search
searchRoute.get("/", searchRooms);

export default searchRoute;