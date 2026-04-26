import db from "@/database/db.js";
import type { Request, Response } from "express";
import { City, CityActivity } from "./city.js";

/**
 * 1. Get all cities
 * Route: GET /cities
 */
export async function getAllCities(req: Request, res: Response) {
    try {
        // In a real app, you would fetch this from a database
        const result = await db.manyOrNone("SELECT * FROM cities", []);
        return res.status(200).json(result ? result.map((row: any) => new City(row)) : [])
    } catch (error) {
        res.status(500).json({ message: "Error retrieving cities", error });
    }
};

/**
 * 2. Get specific city by abbreviation
 * Route: GET /cities/:abbreviation
 */
export async function getCityByAbbr(req: Request, res: Response) {
    try {
        const { abbreviation } = req.params;
        
        const city = await db.oneOrNone("SELECT * FROM cities WHERE abbreviation=$1", [abbreviation], (row: any) => new City(row));

        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }

        res.status(200).json(city);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving the city", error });
    }
};

/**
 * 3. Get city activities
 * Route: GET /cities/:abbreviation/activities
 * Note: Designed this as a nested route which is standard REST practice
 */
export async function getActivities(req: Request, res: Response) {
    try {
        const { abbreviation } = req.params;
        const { type } = req.query; // Optional: allow filtering by type (e.g., ?type=landmarks)
        const activities = await db.manyOrNone(
            `SELECT * FROM city_activities WHERE city_abbreviation=$1 ${type && "AND type=$2"}`, 
        type ? [abbreviation, type] : [abbreviation]
        )

        res.status(200).json(activities.map((row: any) => new CityActivity(row)));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving city activities", error });
    }
};