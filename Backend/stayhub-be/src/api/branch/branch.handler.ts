import type { NextFunction, Request, Response } from "express";
import Branch from "./branch.js";
import rlsWrapper from "@/utils/rlsWrapper.js";
import db from "@/database/db.js";

export async function findBranchesByName(
    name: string
): Promise<Branch> {
    const branch = await db.oneOrNone(
        "SELECT * FROM get_branch_auth_context($1)",
        [name]
    );
    if (!branch) {
        throw Error(`Can't find branch with name ${name}!`)
    }
    return new Branch(branch);
}

export async function getAllBranches(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-all-branch",
        req.user,
        async t => {
            return await t.map("SELECT * FROM branch", [], row => new Branch(row))
        },
        result => {
            res.status(200).json(result);
        }
    )
}

export async function getBranchFromId(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id
    rlsWrapper(
        "find-branch-by-id",
        req.user,
        async t => {
            return await t.oneOrNone("SELECT * FROM branch WHERE id=$1", [id], (row: any) => new Branch(row));
        },
        result => {
            if (!result) res.status(404).send("Branch not found!")
            res.status(200).json(result);
        }
    )
}

export async function createBranch(req: Request, res: Response, next: NextFunction) {
    const { name, location, description } = req.body;

    if (!name || !location) {
        return res.status(400).json({ message: "Name and location are required!" });
    }

    await rlsWrapper(
        "create-branch",
        req.user,
        async t => {
            // Duplicate check inside the RLS transaction
            const existing = await t.oneOrNone(
                "SELECT id FROM branch WHERE name = $1",
                [name]
            );
            if (existing) {
                return { __conflict: true };
            }

            return await t.one(
                `INSERT INTO branch (name, location, description)
                 VALUES ($(name), $(location), $(description))
                 RETURNING id, name, location, description`,
                { name, location, description }
            );
        },
        result => {
            if (result?.__conflict) {
                return res.status(409).json({ message: "Branch already exists!" });
            }
            console.log(`Created branch ${result.name} at ${result.location}!`);
            res.status(201).json({ message: "Branch created successfully!", branch: result });
        }
    );
}