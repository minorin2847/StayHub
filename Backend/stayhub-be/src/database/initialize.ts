import crypto from 'node:crypto';
import db from './db.js';
import pgPromise from 'pg-promise';
import path from 'node:path';
import fs from 'fs/promises';
import { fileURLToPath } from 'node:url';

export default async function initialize() {
    // Initialize tables
    try {
        const pgp = pgPromise();
        const { QueryFile } = pgp;
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const folderPath = path.join(__dirname, "definitions");
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const queryFile = new QueryFile("./database/definitions/" + file);
            await db.multi(queryFile);
            console.log(`All ${file.split(".")[0]?.toLowerCase()} initialized!`);
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error(`An error occured when creating tables: ${err}`);
        } else console.error(`An unknown error occured when creating tables`);
    }
    // Initialize admin account
    const salt = Buffer.from('k:UK�\b��r�*"`��F');
    const password = "123456"
    const hash = crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashed) => {
        if (err) throw new Error(err.message);
        db.task('admin-creation', async t => {
            let user = await db.oneOrNone("INSERT INTO employees(username, salt, hash, email, firstName, lastName, salary) \
            VALUES ($(username), $(salt), $(hash), $(email), $(firstName), $(lastName), $(salary)) \
            ON CONFLICT DO NOTHING \
            RETURNING id, username, email, firstName, lastName, salary;", 
            {
                username: 'admin',
                salt: salt,
                hash: hashed,
                email: 'admin@stayhub.com',
                firstName: "John",
                lastName: "Admin",
                salary: 36363636
            })
            if (!user) {
                user = await db.one("SELECT id FROM employees WHERE username='admin'");
            }
            const id = user.id;
            console.log(`Initialized admin account with id ${id}!`);
            // Initialize roles
            let roles = await db.manyOrNone("INSERT INTO roles(name, tier) \
                VALUES ('ADMINISTRATOR', 1),\
                ('MANAGE_BRANCH', 2), \
                ('MANAGE_HOTEL', 3), \
                ('MANAGE_ROOM', 4) \
                ON CONFLICT DO NOTHING \
                RETURNING name, tier;\ ");
            if (!roles) {
                roles = await db.many("SELECT name, tier FROM roles;");
            }
            console.log(`Initialize roles with values ${roles.map(i=>"name: " + i.name + "; tier: " + i.tier).join("\n")}!`);
            let adminRole = await db.oneOrNone("INSERT INTO employee_roles(employeeID, role) \
                VALUES ($(employeeID), $(role)) \
                ON CONFLICT DO NOTHING \
                RETURNING employeeID, role", {
                    employeeID: id,
                    role: 'ADMINISTRATOR'
                });
            if (!adminRole) {
                adminRole = await db.one("SELECT * FROM employee_roles WHERE employeeID=$1", [id]);
            }
            console.log(`Initialized admin role for employee ${adminRole.employeeid} as ${adminRole.role}!`);
            return roles;
        }).catch(err => console.error(`An error occured while creating admin account: ${err}`));

    });
}
