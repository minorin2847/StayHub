import type { NextFunction, Request, Response } from "express";
import Service from "./services.js"; // Replace with your actual model import
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";

const pgp = pgPromise();

// Define which columns are allowed to be updated dynamically
const serviceColumns = new pgp.helpers.ColumnSet(
    [
        { name: 'type', skip: (c: any) => c.value === undefined },
        { name: 'name', skip: (c: any) => c.value === undefined },
        { name: 'description', skip: (c: any) => c.value === undefined },
        { name: 'coverimage', skip: (c: any) => c.value === undefined },
        { name: 'price', skip: (c: any) => c.value === undefined }
    ],
    { table: "services" }
);

export async function getAllServices(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-all-services",
        req.user,
        async t => {
            // RLS automatically filters this to only show services for the user's hotel
            return await t.map("SELECT * FROM services", [], (row: any) => new Service(row));
        },
        result => {
            res.status(200).json(result);
        }
    );
}

export async function getUniqueServiceTypes(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-service-types",
        req.user,
        async t => {
            // Fetches unique types. RLS ensures they only get types from their own hotel.
            return await t.map(
                "SELECT DISTINCT type FROM services WHERE type IS NOT NULL", 
                [], 
                (row: any) => row.type
            );
        },
        result => {
            // Returns a simple array of strings: ["Spa", "Dining", "Transport"]
            res.status(200).json(result);
        }
    );
}

export function createService(req: Request, res: Response, next: NextFunction) {
    const {
        type,
        name,
        description,
        coverimage,
        price
    } = req.body;

    rlsWrapper(
        "create-service",
        req.user,
        async t => {
            // Check for duplicate names within the same hotel using the current RLS context
            const existingService = await t.oneOrNone(
                "SELECT id FROM services WHERE name=$(name) AND hotelID=$(hotelID)",
                { name: name, hotelID: req.user.hotelid }
            );

            if (existingService) {
                throw new Error("Service already exists for this hotel!");
            }

            return await t.one(
                `INSERT INTO services(hotelID, type, name, description, coverImage, price) 
                 VALUES ($(hotelID), $(type), $(name), $(description), $(coverimage), $(price))
                 RETURNING *`,
                {
                    hotelID: req.user.hotelid, // Fallback to user's hotel if not explicitly provided
                    type,
                    name,
                    description,
                    coverimage,
                    price: price || 0
                },
                (row: any) => new Service(row)
            );
        },
        result => {
            res.status(200).json(result);
        }
    );
}

export async function editService(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const serviceData = req.body;

    // Prevent crashing if an empty body is sent to pg-promise update helper
    if (Object.keys(serviceData).length === 0) {
        return res.status(400).send("No data provided to update.");
    }

    rlsWrapper(
        "edit-service",
        req.user,
        async t => {
            // If updating the name, check that it doesn't conflict with another service in this hotel
            if (serviceData.name) {
                const existing = await t.oneOrNone(
                    "SELECT id FROM services WHERE name=$1 AND id != $2",
                    [serviceData.name, id]
                );
                if (existing) {
                    throw new Error(`Service with name ${serviceData.name} already exists in your hotel!`);
                }
            }

            // Generate dynamic SQL update string
            const query = pgp.helpers.update(serviceData, serviceColumns) 
                        + pgp.as.format(' WHERE id=$1 RETURNING *', [id]);

            return await t.oneOrNone(query, [], (row: any) => new Service(row));
        },
        result => {
            if (!result) return res.status(404).send("Service not found or you don't have permission to edit it!");
            return res.status(200).json(result);
        }
    );
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    rlsWrapper(
        "delete-service",
        req.user,
        async t => {
            return await t.oneOrNone(
                `DELETE FROM services WHERE id=$1 RETURNING *`, 
                [id],
                (row: any) => new Service(row)
            );
        },
        result => {
            if (!result) return res.status(404).send("Service not found, already deleted, or permission denied!");
            return res.status(200).json(result);
        }
    );
}