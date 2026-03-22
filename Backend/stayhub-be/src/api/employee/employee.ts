import type Role from "../roles/roles.js";

export default interface Employee {
    id: number;
    username: string;
    email: string;
    hotelid: number;
    branchid: number;
    firstname: string;
    lastname: string;
    salary: number;
    roles: Role[]
}