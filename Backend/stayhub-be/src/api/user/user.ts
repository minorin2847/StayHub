import type { UserRole } from "./user.enum.js";

export default class User {
    id: string;
    username: string;
    salt: string;
    hash: string;
    roles: UserRole[];

    constructor({id, username, salt, hash, roles} : {
        id: string,
        username: string,
        salt: string,
        hash: string,
        roles: UserRole[]
    }) {
        this.id = id;
        this.username = username;
        this.salt = salt;
        this.hash = hash;
        this.roles = roles;
    }


}