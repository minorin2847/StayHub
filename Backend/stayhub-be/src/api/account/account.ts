export default class Account {
    id: number;
    username: string;
    salt: string;
    hash: string;
    email: string;

    constructor({id, username, salt, hash, email}: {
        id: number,
        username: string,
        salt: string,
        hash: string,
        email: string
    }) {
        this.id = id;
        this.username = username;
        this.salt = salt;
        this.hash = hash;
        this.email = email;
    }

    public static toDTO(account: Account) {
        return {
            id: account.id,
            username: account.username,
            email: account.email
        }
    } 
}