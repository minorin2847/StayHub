import type { EmployeeDTO } from "./employee.type.js";

export default class Employee {
    id: number;
    username: string;
    email: string;
    hotelid: number;
    firstname: string;
    lastname: string;
    salary: number;
    roles: string[]

    constructor({id, hotelid, firstname, lastname, salary, roles, username, email}: {
        id: number;
        hotelid: number;
        firstname: string;
        lastname: string;
        salary: number;
        roles: string[];
        username: string;
        email: string;
    }) {
        this.id = id;
        this.hotelid = hotelid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.salary = salary;
        this.roles = roles;
        this.username = username;
        this.email = email;
    }

    public static toDTO(emp: Employee): EmployeeDTO {
        return {
            id: emp.id,
            username: emp.username,
            email: emp.email,
            hotelid: emp.hotelid,
            firstname: emp.firstname,
            lastname: emp.lastname,
            salary: emp.salary,
        }
    }
}