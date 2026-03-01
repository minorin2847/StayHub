import type Role from "../roles/roles.js";
import type { EmployeeDTO } from "./employee.type.js";

export default class Employee {
    id: number;
    username: string;
    email: string;
    hotelid: number;
    branchid: number[];
    firstname: string;
    lastname: string;
    salary: number;
    roles: Role[]

    constructor({id, hotelid, branchid, firstname, lastname, salary, roles, username, email}: {
        id: number;
        hotelid: number;
        branchid: number[];
        firstname: string;
        lastname: string;
        salary: number;
        roles: Role[];
        username: string;
        email: string;
    }) {
        this.id = id;
        this.hotelid = hotelid;
        this.branchid = branchid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.salary = salary;
        this.roles = roles;
        this.username = username;
        this.email = email;
    }
}