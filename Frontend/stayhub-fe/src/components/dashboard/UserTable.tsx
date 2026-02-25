"use client";

import { Account } from "@/types/Account";
import { Employee, EmployeeTableData } from "@/types/Employee";


type UserTableParameter = {
    tableData: EmployeeTableData[]
}
export default function UserTable(params: UserTableParameter) {
    return (
        <table className="w-full border border-red-500 table-auto border-collapse">
            <thead>
                <tr>
                    <th className="h-fit py-[10px] border bg-gray-100">ID</th>
                    <th className="border bg-gray-100">Username</th>
                    <th className="border bg-gray-100">Full Name</th>
                    <th className="border bg-gray-100">Email</th>
                    <th className="border bg-gray-100">Hotel ID</th>
                    <th className="border bg-gray-100">Salary</th>
                    <th className="border bg-gray-100">Roles</th>
                </tr>
            </thead>
            <tbody>
                {params.tableData.map(item => (
                    <tr key={item.id} className="group hover:bg-gray-50/50">
                        <td className="h-fit py-[10px] border text-center">{item.id}</td>
                        <td className="border text-center">{item.username}</td>
                        <td className="border text-center">{item.firstname + " " + item.lastname}</td>
                        <td className="border text-center">{item.email}</td>
                        <td className="border text-center">{item.hotelid}</td>
                        <td className="border text-center">{item.salary}</td>
                        <td className="border text-center">{item.roles.map(i=>i.role).join(",")}</td>
                    </tr>
                ))}
            </tbody>

        </table>
    )
}