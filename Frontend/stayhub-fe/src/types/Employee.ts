import { Account } from "./Account";
import { Role } from "./Role";

export type Employee = {
    id: number;
    accountid: number;
    hotelid: number;
    branchid: number[];
    firstname: string;
    lastname: string;
    email: string;
    salary: number;
}

export type EmployeeTableData = Account & Employee & {roles: Role[]};