import db from "@/database/db.js";
import Employee from "./employee.js";

export async function findEmployee(accountID: number): Promise<Employee> {
    const employee = await db.oneOrNone("SELECT * FROM employees WHERE accountid=$1", [accountID]);
    if (!employee) {
        throw Error(`Can't find employee with account id ${accountID}!`);
    }
    return new Employee(employee);
}