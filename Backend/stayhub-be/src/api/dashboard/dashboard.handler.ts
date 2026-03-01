
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
            const roles = await db.map("SELECT roles.* \
                FROM employee_roles INNER JOIN roles \
                ON employee_roles.role=roles.name \
                WHERE employeeid=$1 \
                ORDER BY roles.tier", [req.user.id], row => new Role(row));
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
        const employee = await findEmployee(req.user.id);
        res.status(200).json(Employee.toDTO(employee));
    } catch (err) {
        if (err instanceof Error) res.status(404).send(err.message);
        res.status(404).send("An unknown error occured!");
    }
}

type EmployeeTableData = EmployeeDTO & {roles: Role[]};

export async function getEmployeeAccounts(req: Request, res: Response, next: NextFunction) {
    let { name, start, end } = req.query;
    try {
        const response = await db.map("SELECT * FROM get_employees_with_page_count($(name), $(start), $(end))", {
            name: name ?? "",
            start: start ?? 0,
            end: end ?? 10
        }, (row: any): EmployeeTableData => {
            return {
                id: row.id,
                username: row.username,
                email: row.email,
                hotelid: row.hotelid,
                firstname: row.firstname,
                lastname: row.lastname,
                salary: row.salary,
                roles: row.roles
            }
        });
        res.status(200).json({count: response.length, values: response});
    } catch (err) {
        if (err instanceof Error) {
            res.status(404).send(err.message);
        }
        else {
            res.status(404).send("An unknown error occured!");
        }
    }

}

