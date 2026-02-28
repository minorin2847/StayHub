import db from "@/database/db.js";
import crypto from "node:crypto";
import type { CreateEmployeeInput } from "./employee.type.js";

export const EmployeeService = {
    getHostPrivilegeInfo: async (employeeID: number) => {
        return await db.oneOrNone(`
            SELECT e.id, e.hotelid, er.role, r.tier, bh.branch_id
            FROM employees e
            JOIN employee_roles er ON e.id = er.employeeid
            JOIN roles r ON er.role = r.name
            LEFT JOIN branch_hotels bh ON e.hotelid = bh.hotel_id
            WHERE e.id = $1
            ORDER BY r.tier ASC LIMIT 1
        `, [employeeID]);
    },

    getRoleTier: async (roleName: string): Promise<number | null> => {
        const role = await db.oneOrNone("SELECT tier FROM roles WHERE name = $1", [roleName]);
        return role ? role.tier : null;
    },

    isHotelInBranch: async (hotelID: number, branchID: number): Promise<boolean> => {
        const record = await db.oneOrNone("SELECT 1 FROM branch_hotels WHERE hotel_id = $1 AND branch_id = $2", [hotelID, branchID]);
        return !!record;
    },

    createNewEmployeeTransaction: async (data: CreateEmployeeInput) => {
        const salt = crypto.randomBytes(16);
        const hash = crypto.pbkdf2Sync(data.password, salt, 310000, 32, 'sha256');

        return await db.tx(async (t) => {
            const account = await t.one(`
                INSERT INTO accounts (username, salt, hash, email) 
                VALUES ($1, $2, $3, $4) RETURNING id
            `, [data.username, salt, hash, data.email]);

            const employee = await t.one(`
                INSERT INTO employees (accountid, hotelid, firstname, lastname, salary)
                VALUES ($1, $2, $3, $4, $5) RETURNING id
            `, [account.id, data.targetHotelID || null, data.firstName, data.lastName, data.salary]);

            await t.none(`
                INSERT INTO employee_roles (employeeid, role)
                VALUES ($1, $2)
            `, [employee.id, data.targetRole]);

            return employee.id;
        });
    }
};