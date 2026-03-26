import db from "@/database/db.js";
import Role from "./roles.js";
import type { NextFunction, Request, Response } from "express";

export async function getRole(name: string): Promise<Role> {
    const role = await db.oneOrNone("SELECT * FROM roles WHERE name=$1", [name]);
    if (!role) {
        throw new Error("Role not found!");
    }
    return new Role(role);
}

export async function getAllRoles(req: Request, res: Response, next: NextFunction){
    const roles = await db.map("SELECT * FROM roles", [], row => new Role(row));
    res.status(200).json(roles);
}