import crypto from 'node:crypto';
import db from './db.js';
import pgPromise from 'pg-promise';

export default async function initializeTable() {
    // Initialize tables
    try {
        const pgp = pgPromise();
        const { QueryFile } = pgp;
        const file = new QueryFile("./database/StayHub.sql");
        await db.multi(file);
        console.log(`All tables initialized!`);
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
            let user = await db.oneOrNone("INSERT INTO accounts(username, salt, hash, email) \
            VALUES ($(username), $(salt), $(hash), $(email)) \
            ON CONFLICT DO NOTHING \
            RETURNING id, username, email;", 
            {
                username: 'admin',
                salt: salt,
                hash: hashed,
                email: 'admin@stayhub.com'
            })
            if (!user) {
                user = await db.one("SELECT id FROM accounts WHERE username='admin'");
            }
            const id = user.id;
            console.log(`Initialized admin account with id ${id}!`);
            let employee = await db.oneOrNone("INSERT INTO employees(accountID, firstName, lastName, salary) \
            VALUES ($(id), $(firstName), $(lastName), $(salary)) \
            ON CONFLICT DO NOTHING \
            RETURNING id, accountID, firstName, lastName, salary;",{
                id: id,
                firstName: 'John',
                lastName: 'Admin',
                salary: 36363636
            });
            if (!employee) {
                employee = await db.one("SELECT id from employees where accountID=$1", [id]);
            }
            const employeeID = employee.id;
            console.log(`Initialized admin employee account with employeeID ${employeeID}!`);
            // Initialize admin role
            let admin_role = await db.oneOrNone("INSERT INTO roles(name, tier) \
                VALUES ($(name), $(tier)) \
                ON CONFLICT DO NOTHING \
                RETURNING name, tier", {
                    name: 'ADMINISTRATOR',
                    tier: 1
                });
            if (!admin_role) {
                admin_role = await db.one("SELECT * FROM roles WHERE name=$1", ['ADMINISTRATOR']);
            }
            console.log(`Initialize admin role with name ${admin_role.name}, tier ${admin_role.tier}!`);
            let roles = await db.oneOrNone("INSERT INTO employee_roles(employeeID, role) \
                VALUES ($(employeeID), $(role)) \
                ON CONFLICT DO NOTHING \
                RETURNING employeeID, role", {
                    employeeID: employeeID,
                    role: admin_role.name
                });
            if (!roles) {
                roles = await db.one("SELECT * FROM roles WHERE employeeID=$1", [employeeID]);
            }
            console.log(`Initialized admin role for employee ${roles.employeeid} as ${roles.role}!`);
            return roles;
        }).catch(err => console.error(`An error occured while creating admin account: ${err}`));

    });
}
