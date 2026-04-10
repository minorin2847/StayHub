import { Role } from "./Role";

export type Employee = {
    id: number;
    username: string;
    avatar: string;
    hotelid: number;
    branchid: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    salary: number;
    roles: Role[]
}