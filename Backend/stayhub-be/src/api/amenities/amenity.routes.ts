import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { createAmenity, deleteAmenity, editAmenity, getAmenityList, getAmenityStats } from "./amenity.handler.js";

const amenityRoute = Router();

amenityRoute.get("/stats", isLoggedIn, getAmenityStats);
amenityRoute.get("/list", isLoggedIn, getAmenityList)
amenityRoute.post("/create", isLoggedIn, createAmenity);
amenityRoute.patch("/edit/:name", isLoggedIn, editAmenity);
amenityRoute.delete("/delete/:name", isLoggedIn, deleteAmenity);

export default amenityRoute;