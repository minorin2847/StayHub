import db from '@/database/db.js'
import { DatabaseError } from '@/types/DatabaseError.js';

export default class Hello {
    /* Values */
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    public static async listName(): Promise<Hello[] | null> {
        try {
            const result = await db.each(
                "SELECT * FROM hello", 
                [], 
                row => new Hello(row.id, row.name)
            );
            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public static async addName(name: string): Promise<Hello | null> {
        try {
            const result = await db.one(
                "INSERT INTO hello(name) VALUES ($1) RETURNING id, name",
                name,
                row => new Hello(row.id, row.name)
            );
            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}