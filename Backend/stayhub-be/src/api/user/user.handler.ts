import User from "./user.js";
import db from "@/database/db.js";

export async function findUser(accountID: number): Promise<User> {
    const user = await db.oneOrNone("SELECT * FROM users WHERE accountid=$1", [accountID]);
    if (!user) {
        throw Error(`Can't find user with id ${accountID}!`);
    }
    return new User(user);
}