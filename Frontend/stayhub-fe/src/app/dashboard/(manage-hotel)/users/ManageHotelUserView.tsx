"use client";
import { Employee } from "@/types/Employee";
import { Role } from "@/types/Role";
import { Avatar, Space, Tag } from "antd";
import { useEffect, useState } from "react";
import EditModal from "./components/EditModal";
import GenericTableView from "@/components/ui/GenericTableView";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import { useDashboardAuth } from "@/context/DashboardAuthContext";

export type EmployeeFilterData = {
    name: string | null;
    roles: string[];
    salaryMin: string | null;
    salaryMax: string | null;
    sort: string | null;
    order: string | null;
    page: string | null
};

export type EmployeeTableData = Employee;

export default function ManageHotelManageUser() {
    const [roles, setRoles] = useState<Role[]>([]);
    const { user } = useDashboardAuth();

    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<EmployeeTableData | null>(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const rolesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/roles/`, {
                method: "GET",
                credentials: "include"
            });
            const rolesData = await rolesRes.json();
            setRoles(rolesData as Role[]);
            setLoading(false);
        }

        init();
    }, []);

    // If the endpoint itself doesn't filter by user token, you might need to append ?hotelid=${user?.hotelid} here.
    // Assuming backend handles it, or you can add it if needed.
    const tableEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/user`;

    return (
        <GenericTableView<EmployeeTableData, EmployeeFilterData>
            resourceName="Employee"
            searchPlaceholder="Search by username, full name or email..."
            tableDataEndpoint={tableEndpoint}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => (
                <CreateModal
                    {...injected}
                    roles={roles}
                    hotelid={user?.hotelid}
                />
            )}
            renderFilterModal={(injected) => (
                <FilterModal
                    {...injected}
                    roles={roles}
                />
            )}
            renderEditModal={(injected) => (
                <EditModal
                    {...injected}
                    roles={roles}
                />
            )}

            tableColumns={[
                {
                    title: "ID",
                    dataIndex: "id",
                    key: "id",
                    render: (id: number) => `EMP-${id.toString().padStart(3, '0')}`,
                    className: "text-gray-500 font-medium",
                },
                {
                    title: "NAME",
                    key: "name",
                    render: (_: unknown, record: EmployeeTableData) => {
                        const initials = `${record.firstname?.[0] || ""}${record.lastname?.[0] || ""}`.toUpperCase();
                        return (
                            <Space size="middle">
                                <Avatar className="bg-slate-200 text-slate-800 font-bold">{initials}</Avatar>
                                <span className="font-semibold text-slate-800">{record.firstname} {record.lastname}</span>
                            </Space>
                        );
                    }
                },
                {
                    title: "ROLE",
                    key: "role",
                    render: (_: unknown, record: EmployeeTableData) => {
                        const roleName = record.roles && record.roles.length > 0 ? record.roles[0].name : "Employee";
                        const color = roleName.includes("HOTEL") ? "blue" : roleName.includes("ROOM") ? "green" : roleName.includes("PAYMENT") ? "gold" : "purple";
                        return (
                            <Tag color={color} className="rounded-full px-3 py-1 font-semibold border-none">
                                {roleName.replace("MANAGE_", "").replace("_", " ")}
                            </Tag>
                        );
                    }
                },
                {
                    title: "SALARY",
                    dataIndex: "salary",
                    key: "salary",
                    render: (salary: number) => `$${salary}`,
                    className: "text-slate-500",
                },
            ]}

            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}

            generatedDeletePrompt={(record: EmployeeTableData) => `Do you want to delete ${record.firstname} ${record.lastname}?`}
            generatedDeleteEndpoint={(record: EmployeeTableData) => `${process.env.NEXT_PUBLIC_API_URL}/employee/delete/${record.id}`}
        />
    )
}
