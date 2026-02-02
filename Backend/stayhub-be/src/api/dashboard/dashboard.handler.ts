import { passport } from "@/utils/initializeSession.js";
import type { NextFunction, Request, Response } from "express";
import { findEmployee } from "../employee/employee.handler.js";
import db from "@/database/db.js";
import Role from "../roles/roles.js";
import { getRole } from "../roles/roles.handler.js";
import Employee from "../employee/employee.js";

export function dashboardLogin(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate('local', (err: any, user: any, info: any, status: any) => {
        if (err) return next(err);
        if (!user) res.status(404).send("Incorrect username or password!");
        findEmployee(user.id).then(() => {
            req.login(user, err => {
                if (err) return next(err);
                res.status(200).send("Login successful!");
            });
        }).catch(() => res.status(404).send("Incorrect username or password!"))

    })(req, res, next)
}

// Prerequisite: isLoggedIn
export function hasPermission(role: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const requiredRole = await getRole(role);
            const roles = await db.map("SELECT roles.* \
                FROM employees_roles INNER JOIN roles \
                ON employees_roles.role=roles.name \
                WHERE employeeid=$1 \
                ORDER BY roles.tier", [req.user.id], row => new Role(row));
            if (roles.length===0) {
                throw new Error("Employee doesn't have any roles!");
            }
            for (const role of roles) {
                if (role.tier > requiredRole.tier || role.name == requiredRole.name) {
                    next()
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