
import type { NextFunction, Request, Response } from "express";
import db from "@/database/db.js";
import Role from "../roles/roles.js";
import { getRole } from "../roles/roles.handler.js";
import Employee from "../employee/employee.js";
import type { EmployeeDTO } from "../employee/employee.type.js";



// Prerequisite: isLoggedIn
export function hasPermission(roles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRoles = req.user.roles
            if (userRoles.length===0) {
                throw new Error("Employee doesn't have any roles!");
            }
            for (const requiredRole of roles) {
                for (const userRole of userRoles) {
                    if (requiredRole == userRole.role) {
                        next();
                        return;
                    }
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
    let { name, hotelid, branchid, roles, salaryMin, salaryMax, sort, order, page } = req.query;

    const userRoles = (req.user.roles || []).join(",");;
    const rolesArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
    try {
        const response = await db.tx(async t => {
            
            await t.none("SET LOCAL app.current_username = $1", [req.user.username]);
            await t.none("SET LOCAL app.roles = $1", [userRoles]);
            await t.none("SET LOCAL app.hotelid = $1", [req.user.hotelid || '']);
            await t.none("SET LOCAL app.branchid = $1", [req.user.branchid || '']);
            return t.manyOrNone("SELECT * FROM get_employees_by_page($(name),$(hotelid),$(branchid),$(roles),$(salaryMin),$(salaryMax),$(sort),$(order),$(page))", {
                name: name ?? null,
                hotelid: hotelid ?? null,
                branchid: branchid ?? null,
                roles: rolesArray ?? [],
                salaryMin: salaryMin ?? 0,
                salaryMax: salaryMax ?? 2147483647,
                sort: sort ?? 'id',
                order: order ?? 'asc',
                page: page ?? 1
            })
        });
        res.status(200).json(response.length > 0 ? {hasNext: response[0].hasNext, response: response.map(i=>i as Employee)}: []);
    } catch (err) {
        if (err instanceof Error) {
            res.status(404).send(err.stack);
        }
        else {
            res.status(404).send("An unknown error occured!");
        }
    }

}

