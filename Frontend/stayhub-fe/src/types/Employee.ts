import { Role } from "./Role";

export type Employee = {
    id: number;
    username: string;
    hotelid: number;
    branchid: number;
    firstname: string;
    lastname: string;
    email: string;
    salary: number;
    roles: Role[]
}