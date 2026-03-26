import type Role from "../roles/roles.js";

export default class Employee {
    id: number = 0;
    username: string = "";
    email: string = "";
    hotelid: number = 0;
    branchid: number = 0;
    firstname: string = "";
    lastname: string = "";
    salary: number = 0;
    roles: Role[] = []

    constructor(_: Partial<Employee>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}