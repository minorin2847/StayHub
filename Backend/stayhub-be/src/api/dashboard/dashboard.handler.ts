
import type { NextFunction, Request, Response } from "express";
import { findEmployee } from "../employee/employee.handler.js";
import db from "@/database/db.js";
import Role from "../roles/roles.js";
import { getRole } from "../roles/roles.handler.js";
import Employee from "../employee/employee.js";
import type { EmployeeDTO } from "../employee/employee.type.js";



// Prerequisite: isLoggedIn
export function hasPermission(role: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const requiredRole = await getRole(role);
            const roles = req.user.roles;
            if (roles.length===0) {
                throw new Error("Employee doesn't have any roles!");
            }
            for (const role of roles) {
                if (role.tier < requiredRole.tier || role.name == requiredRole.name) {
                    next();
                    return;
                }
            }
            res.status(401).send("Unauthorized!");
        } catch (err) {
            if (err instanceof Error) res.status(404).send(err.message);
            res.status(404).send("An unknown error occured!");
        }
    }
}

// Prerequisite: isLoggedIn
export async function getEmployee(req: Request, res: Response, next: NextFunction) {
    try {
        res.status(200).json(req.user);
    } catch (err) {
        if (err instanceof Error) res.status(404).send(err.message);
        res.status(404).send("An unknown error occured!");
    }
}


export async function getEmployeeAccounts(req: Request, res: Response, next: NextFunction) {
    let { name, page } = req.query;
    let roles = (req.user.roles || []).join(",");
    let branchid = (req.user.branchid || []).join(",");
    try {
        const response = await db.tx(async t => {
            
            await t.none("SET LOCAL app.current_username = $1", [req.user.username]);
            await t.none("SET LOCAL app.roles = $1", [roles]);
            await t.none("SET LOCAL app.hotelid = $1", [req.user.hotelid || '']);
            await t.none("SET LOCAL app.branchid = $1", [branchid]);
            return t.map("SELECT * FROM get_employees_by_page($(name), $(page))", {
                name: name ?? "",
                page: page ?? 1
            }, (row: any): Employee => {
                return row as Employee
            })
        });
        res.status(200).json(response);
    } catch (err) {
        if (err instanceof Error) {
            res.status(404).send(err.message);
        }
        else {
            res.status(404).send("An unknown error occured!");
        }
    }

}

