import db from "@/database/db.js";
import { passport } from "@/utils/initializeSession.js";
import Employee from "./employee.js";
import type { NextFunction, Request, Response } from "express";

export async function findEmployee(id: number): Promise<Employee> {
    const employee = await db.oneOrNone("SELECT * FROM employees WHERE id=$1", [id]);
    if (!employee) {
        throw Error(`Can't find employee with account id ${id}!`);
    }
    return new Employee(employee);
}

export function login(req: Request, res: Response, next: NextFunction) {
    return passport.authenticate('employee-login', (err: any, user: any, info: any, status: any) => {
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

export function logout(req: Request, res: Response, next: NextFunction) {
    req.logout(err => {
        if (err) return next(err);
        res.status(200).send("Logout successful!");
    })
}