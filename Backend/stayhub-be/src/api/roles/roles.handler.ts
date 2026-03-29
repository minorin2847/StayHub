import db from "@/database/db.js";
import Role from "./roles.js";
import type { NextFunction, Request, Response } from "express";
import rlsWrapper from "@/utils/rlsWrapper.js";
import pgPromise from "pg-promise";


const roleColumns = new (pgPromise().helpers.ColumnSet)(
    [
        { name: 'name', skip: (c: any) => c.value === undefined },
        { name: 'tier', skip: (c: any) => c.value === undefined }
    ],
    {
        table: "roles"
    }
)
const employeeRoleColumns = new (pgPromise().helpers.ColumnSet)(
  [
    'employeeid', 
    'role'
  ], 
  { table: 'employee_roles' }
);

export async function findRole(name: string): Promise<Role> {
    const role = await db.oneOrNone("SELECT * FROM get_roles_auth_context($1)", [name]);
    if (!role) {
        throw new Error("Role not found!");
    }
    return new Role(role);
}

export async function getAllRoles(req: Request, res: Response, next: NextFunction){
    rlsWrapper(
        'get-all-roles',
        req.user,
        async t => {
            return await t.manyOrNone("SELECT * FROM roles", (row: any) => new Role(row));
        },
        result => {
            res.status(200).json(result)
        }
    )
}

export function addRole(req: Request, res: Response, next: NextFunction) {
    const {name, tier} = req.body;

    findRole(name)
    .then(() => res.status(409).send("Role already exists!"))
    .catch(() => {
        rlsWrapper(
            "create-role",
            req.user,
            async t => {
                return await t.one(
                    "INSERT INTO roles(name, tier) \
                    VALUES ($(name), $(tier)) \
                    RETURNING name, tier",
                    {
                        name: name,
                        tier: tier
                    }
                )
            },
            result => {
                console.log(`Created role ${result.name}!`)
                res.status(200).json(result);
            }
        )
    })
}

export function editRole(req: Request, res: Response, next: NextFunction) {
    const name = req.params.name;
    const roleData = req.body;

    if (Object.keys(req.body).length === 0) {
        return res.status(400).send("No data provided!")
    }

    rlsWrapper(
        'update-role',
        req.user,
        async t => {
            const newRoleName = roleData.name || name; 
                
            // 1. Update the core Roles table
            // (Assuming you have roleColumns setup for pg-promise helpers)
            const query = pgPromise().helpers.update(roleData, roleColumns)
                        + pgPromise().as.format(' WHERE name=$1 RETURNING *', [name]);
            
            const updatedRole = await t.oneOrNone(query);

            if (!updatedRole) return null;

            // 2. Update the junction table if the name was actually changed
            if (newRoleName !== name) {
                await t.none(
                    'UPDATE employee_roles SET role = $1 WHERE role = $2', 
                    [newRoleName, name]
                );
            }

            return updatedRole; // Return the newly updated role
        },

        result => {
            if (!result) {
                return res.status(404).send("Role not found!")
            }
            res.status(200).json(result)
        }
    )
}

export function getRole(req: Request, res: Response, next: NextFunction) {
    const name = req.params.name;
    console.log(name)
    rlsWrapper(
        'find-role',
        req.user,
        async t => {
            return t.oneOrNone("SELECT * FROM roles WHERE name=$1", [name]);
        },
        result => {
            if (!result) {
                return res.status(404).send("Role not found!")
            }
            res.status(200).json(result)
        }
    )
}

export function deleteRole(req: Request, res: Response, next: NextFunction) {
    const name = req.params.name;

    rlsWrapper(
        'delete-role',
        req.user,
        async t => {
            return await t.oneOrNone("DELETE FROM roles WHERE name=$1 RETURNING name", [name]);
        },
        result => {
            if (!result) {
                return res.status(404).send("Role not found or already deleted!")
            }
            res.status(200).send("Role deleted successfully!")
        }
    )
}