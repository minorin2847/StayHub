import User from "./user.js";
import db from "@/database/db.js";

export async function findUser(id: number): Promise<User> {
    const user = await db.oneOrNone("SELECT * FROM users WHERE id=$1", [id]);
    if (!user) {
        throw Error(`Can't find user with id ${id}!`);
    }
    return new User(user);
}

export async function findUserByUsername(username: string): Promise<User> {
    const user = await db.oneOrNone("SELECT * FROM users WHERE username=$1", [username]);
    if (!user) {
        throw Error(`Can't find user with username ${username}!`);
    }
    return new User(user);
}