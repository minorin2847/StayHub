import db from "@/database/db.js";
import type { NextFunction, Request, Response } from "express";
import Bed from "./bed.js";
import rlsWrapper from "@/utils/rlsWrapper.js";

export async function findBedByName(name: string): Promise<Bed | null> {
    try {
        const bed = await db.oneOrNone("SELECT * FROM beds WHERE name=$1", [name], row => new Bed(row));
        if (!bed) throw new Error("Bed doesn't exist!");
        return bed;
    } catch (error) {
        console.error("Error while fetching bed by name!");
        return null;
    }
}

export async function getBeds(req: Request, res: Response, next: NextFunction) {
    try {
        const beds = await db.map("SELECT * FROM beds", [], row => new Bed(row));
        return res.status(200).json(beds);
    } catch (error) {
        console.log("Error while fetching beds");
        return res.status(500).send("Server error while fetching beds!");
    }
}

export async function addBeds(req: Request, res: Response, next: NextFunction) {
    const {
        name,
        count
    } = req.body;
    
    try {
        const bed = await findBedByName(name)
        if (bed) {
            return res.status(409).send("Bed already exists!")
        } else {
            const newBed = await db.one(
                "INSERT INTO beds(name, count) \
                VALUES ($(name), $(count)) \
                RETURNING name, count", {
                    name: name,
                    count: count
                }, row => new Bed(row));

            return res.status(200).send("Bed created successfully!")
        }
    } catch (error) {
        console.error("Error while creating new bed!")
        return res.status(500).send("Error while creating new bed!");
    }
}

export async function insertBedToHotel(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "insert-bed-to-hotel",
        req.user,
        async t => {
            
        }
    )
}
