export class DatabaseError implements Error {
    name = "DatabaseError";
    message: string;

    constructor(message: string) {
        this.message = message;
    }
}