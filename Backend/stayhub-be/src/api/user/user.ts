import type { UserDTO } from "./user.type.js";

export default class User {
    id: string;
    username: string;
    salt: string;
    hash: string;
    roles: string[];

    name: string;
    email: string;
    avatar: string;

    constructor({id, username, salt, hash, roles, name, email, avatar} : {
        id: string,
        username: string,
        salt: string,
        hash: string,
        roles: string[],
        name: string,
        email: string,
        avatar: string
    }) {
        this.id = id;
        this.username = username;
        this.salt = salt;
        this.hash = hash;
        this.roles = roles;

        this.name = name;
        this.email = email;
        this.avatar = avatar
    }

    public static toDTO(user: User): UserDTO {
        return {
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            email: user.email,
        }
    }
}