import db from "@/database/db.js";
import type { EmployeeDTO } from "./employee.type.js";
import crypto from "node:crypto";

export default class Employee {
    id: number;
    accountid: number;
    hotelid: number;
    firstname: string;
    lastname: string;
    salary: number;
    roles: string[]

    constructor({id, accountid, hotelid, firstname, lastname, salary, roles}: {
        id: number;
        accountid: number;
        hotelid: number;
        firstname: string;
        lastname: string;
        salary: number;
        roles: string[]
    }) {
        this.id = id;
        this.accountid = accountid;
        this.hotelid = hotelid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.salary = salary;
        this.roles = roles;
    }

    public static toDTO(emp: Employee): EmployeeDTO {
        return {
            id: emp.id,
            hotelid: emp.hotelid,
            firstname: emp.firstname,
            lastname: emp.lastname,
            salary: emp.salary,
        }
    }
}
