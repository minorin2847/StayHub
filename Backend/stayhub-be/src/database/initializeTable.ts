import { DatabaseError } from '@/types/DatabaseError.js';
import crypto from 'node:crypto';
import db from './db.js';

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
    `
}
export default async function initializeTable() {
    // Initialize tables
    for (const [name, table] of Object.entries(tables)) {
        try {
        await db.none(table);
        console.log(`Table ${name} initialized!`);
        } catch (err) {
            if (err instanceof Error) {
                throw new DatabaseError(`An error occured when creating table ${name}: ${err.message}`);
            } else throw new DatabaseError(`An unknown error occured when creating table ${name}`);
        }
    }
    // Initialize admin account
    const salt = Buffer.from('k:UK�\b��r�*"`��F');
    const password = "123456"
    const hash = crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hashed) => {
        if (err) throw new DatabaseError(err.message);
        db.oneOrNone("INSERT INTO users(username, salt, hash) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id, username;", ["admin", salt, hashed]).then(() => {
            console.log(`Initialized admin account!`);
        })

    });
}