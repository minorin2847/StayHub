"use client";

import { Account } from "@/types/Account";

type UserTableParameter = {
    tableData: Account[]
}
export default function UserTable(params: UserTableParameter) {
    return (
        <table className="w-full border border-red-500 table-auto border-collapse">
            <thead>
                <tr>
                    <th className="h-fit py-[10px] border bg-gray-100">ID</th>
                    <th className="border bg-gray-100">Username</th>
                    <th className="border bg-gray-100">Email</th>
                </tr>
            </thead>
            <tbody>
                {params.tableData.map(i=> (
                    <tr>
                        <td className="h-fit py-[10px] border text-center">{i.id}</td>
                        <td className="border text-center">{i.username}</td>
                        <td className="border text-center">{i.email}</td>
                    </tr>
                ))}
            </tbody>

        </table>
    )
}