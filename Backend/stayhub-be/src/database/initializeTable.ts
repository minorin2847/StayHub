import crypto from 'node:crypto';
import db from './db.js';
<<<<<<< Updated upstream

const tables = {
    hello: `
        CREATE TABLE IF NOT EXISTS hello (
            id      INT             PRIMARY KEY     GENERATED ALWAYS AS IDENTITY,
            name    VARCHAR(100)    NOT NULL
        );
    `,
    user: `
        CREATE TABLE IF NOT EXISTS users (
            id          INT             PRIMARY KEY     GENERATED ALWAYS AS IDENTITY,
            username    VARCHAR(100)    UNIQUE NOT NULL,
            salt        BYTEA     NOT NULL,
            hash        BYTEA        NOT NULL,
            roles       VARCHAR(100)[]  NOT NULL    DEFAULT '{ROLE_USER}'
        );
    `,
    session: `
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
)
WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" USING BTREE ("expire");
    `
}
=======
import toRoleString from '@/utils/toRoleString.js';
import pgPromise from 'pg-promise';

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        if (err) throw new DatabaseError(err.message);
        db.oneOrNone("INSERT INTO users(username, salt, hash, roles) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id, username;", ["admin", salt, hashed, "{" + ["ROLE_USER", "ROLE_ADMIN"].join(",") + "}"]).then(() => {
            console.log(`Initialized admin account!`);
        })
=======
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
            let roles = await db.oneOrNone("INSERT INTO roles(employeeID, role) \
                VALUES ($(employeeID), $(role)) \
                ON CONFLICT DO NOTHING \
                RETURNING employeeID, role", {
                    employeeID: employeeID,
                    role: 'ROLE_ADMIN'
                });
            if (!roles) {
                roles = await db.one("SELECT * FROM roles WHERE employeeID=$1", [employeeID]);
            }
            console.log(`Initialized admin role for employee ${roles.employeeid} as ${roles.role}!`);
            return roles;
        }).catch(err => console.error(`An error occured while creating admin account: ${err}`));
>>>>>>> Stashed changes

    });
}