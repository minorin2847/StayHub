import { Role } from "./Role";

export type Employee = {
    id: number;
    accountid: number;
    hotelid: number;
    branchid: number;
    firstname: string;
    lastname: string;
    salary: number;
    roles: Role[]
}