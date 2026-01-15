import { DatabaseError } from '@/types/DatabaseError.js';
import db from './db.js';

const tables = {
    hello: `
            CREATE TABLE IF NOT EXISTS hello (
                id      INT             PRIMARY KEY     GENERATED ALWAYS AS IDENTITY,
                name    VARCHAR(100)    NOT NULL
            );
    `,
}
export default async function initializeTable() {
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
}