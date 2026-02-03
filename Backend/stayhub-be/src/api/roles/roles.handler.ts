import db from "@/database/db.js";
import Role from "./roles.js";

export async function getRole(name: string): Promise<Role> {
    const role = await db.oneOrNone("SELECT * FROM roles WHERE name=$1", [name]);
    if (!role) {
        throw new Error("Role not found!");
    }
    return new Role(role);
}