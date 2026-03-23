import type { NextFunction, Request, Response } from "express";
import type Branch from "./branch.js";
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
    return branch as Branch;
}

export async function getAllBranches(req: Request, res: Response, next: NextFunction) {
    rlsWrapper(
        "get-all-branch",
        req.user,
        async t => {
            return await t.map("SELECT * FROM branch", [], row => row as Branch)
        },
        result => {
            res.status(200).json(result);
        }
    )
}

export function createBranch(req: Request, res: Response, next: NextFunction) {
    const {
        name,
        location,
        description
    } = req.body;

    findBranchesByName(name)
    .then(() => res.status(409).send("Branch already exists!"))
    .catch(() => {
        rlsWrapper(
            "create-branch",
            req.user,
            async t => {
                return await t.one(
                    "INSERT INTO branch(name, location, description) \
                    VALUES ($(name), $(location), $(description))\
                    RETURNING id, name, location, description",
                    {
                        name: name,
                        location: location,
                        description: description
                    }
                )
            },
            result => {
                console.log(`Created branch ${result.name} at ${result.location}!`)
                res.status(200).json(result);
            }
        )
    })
}