"use client";
import { Employee } from "@/types/Employee";
import { Branch } from "@/types/Branch";
import { Hotel } from "@/types/Hotel";
import { Role } from "@/types/Role";
import { Avatar, Space, Tag } from "antd";
import { useEffect, useState } from "react";
import EditModal from "@/app/dashboard/(admin)/users/components/EditModal";
import GenericTableView from "@/components/ui/GenericTableView";
import CreateModal from "./components/CreateModal";
import FilterModal from "@/app/dashboard/(admin)/users/components/FilterModal";


export type EmployeeFilterData = {
    name: string | null;
    hotelid: string | null;
    branchid: string | null;
    roles: string[];
    salaryMin: string | null;
    salaryMax: string | null;
    sort: string | null;
    order: string | null;
    page: string | null
};

export type EmployeeTableData = Employee


export default function AdminManageUser() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<EmployeeTableData | null>(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            const branchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/branches/`, {
                method: "GET",
                credentials: "include"
            });
            const branchData = await branchRes.json();
            setBranches(branchData as Branch[]);

            const hotelRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/hotels/`, {
                method: "GET",
                credentials: "include"
            });
            const hotelData = await hotelRes.json();
            setHotels(hotelData as Hotel[]);

            const rolesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/roles/`, {
                method: "GET",
                credentials: "include"
            });
            const rolesData = await rolesRes.json();
            setRoles(rolesData as Role[]);
            setLoading(false)
        }

        init()
    }, [])
    return (
        <GenericTableView<EmployeeTableData, EmployeeFilterData>
            resourceName="Employee"
            searchPlaceholder="Search by username, full name or email..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/user`}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => (
                <CreateModal
                    {...injected}
                    branches={branches}
                    hotels={hotels}
                    roles={roles}
                />
            )}
            renderFilterModal={(injected) => (
                <FilterModal
                    {...injected}
                    branches={branches}
                    hotels={hotels}
                    roles={roles}
                />
            )}
            renderEditModal={(injected) => (
                <EditModal
                    {...injected}
                    branches={branches}
                    hotels={hotels}
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
                        // If roles array exists and has items, show the first, else fallback
                        const roleName = record.roles && record.roles.length > 0 ? record.roles[0].name : "Employee";
                        // Determine a tag color based on role
                            const color = roleName.includes("HOTEL") ? "blue" : roleName.includes("ROOM") ? "green" : roleName.includes("PAYMENT") ? "gold" : "purple";
                            return (
                                <Tag color={color} className="rounded-full px-3 py-1 font-semibold border-none">
                                    {roleName.replace("MANAGE_", "").replace("_", " ")}
                                </Tag>
                            );
                    }
                },
                {
                    title: "ASSIGNED BRANCH",
                    dataIndex: "branchid",
                    key: "branch",
                    render: (branchid: number) => branchid && branches.some(i=>i.id==branchid) ? branches.find(i=>i.id==branchid)?.name : "Unassigned",
                    className: "text-slate-500",
                },
                {
                    title: "ASSIGNED HOTEL",
                    dataIndex: "hotelid",
                    key: "hotel",
                    render: (hotelid: number) => hotelid && hotels.some(i=>i.id==hotelid) ? hotels.find(i=>i.id==hotelid)?.name : "Unassigned",
                    className: "text-slate-500",
                }
            ]}

            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}

            generatedDeletePrompt={(record: EmployeeTableData) => `Do you want to delete ${record.firstname} ${record.lastname}?`}
            generatedDeleteEndpoint={(record: EmployeeTableData) => `${process.env.NEXT_PUBLIC_API_URL}/employee/delete/${record.id}`}
        />
    )
};
