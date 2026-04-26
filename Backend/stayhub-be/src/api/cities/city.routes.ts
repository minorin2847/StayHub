import { Router } from "express";
import { getActivities, getAllCities, getCityByAbbr } from "./city.handler.js";

const cityRoutes = Router();

// GET /cities
cityRoutes.get("/", getAllCities);

// GET /cities/:abbreviation
cityRoutes.get("/:abbreviation", getCityByAbbr);

// GET /cities/:abbreviation/activites?type
cityRoutes.get("/:abbreviation/activities", getActivities);

export { cityRoutes }

