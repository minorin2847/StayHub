"use client";

import { Employee} from "@/types/Employee";
import { Table, Tag, Badge, Space, Button, Modal, Avatar, message } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useState } from "react";
import { Hotel } from "@/types/Hotel";
import { Branch } from "@/types/Branch";
import { Role } from "@/types/Role";
import FormEdit from "@/app/dashboard/(admin)/users/components/FormEdit";

const { confirm } = Modal;

type UserTableParameter = {
    tableData: Employee[];
    hotels: Hotel[];
    branches: Branch[];
    roles: Role[]; // Added roles prop
    onRefresh: () => void; // Added refresh callback
}

export default function UserTable({ tableData, hotels, branches, roles, onRefresh }: UserTableParameter) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

    const showDeleteConfirm = (record: Employee) => {
        confirm({
            title: `Do you want to delete ${record.firstname} ${record.lastname}?`,
            icon: <ExclamationCircleFilled />,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/delete/${record.id}`, {
                        method: 'DELETE',
                        credentials: "include"
                    });
                    if (res.ok) {
                        message.success("Employee deleted");
                        onRefresh();
                    } else {
                        message.error("Failed to delete");
                    }
                } catch (e) {
                    message.error("Error deleting employee");
                }
            },
        });
    };

    const handleEditClick = (id: number) => {
        setSelectedEmployeeId(id);
        setIsEditModalOpen(true);
    };


    const columns = [
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
            render: (_: unknown, record: Employee) => {
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
            render: (_: unknown, record: Employee) => {
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
            key: "hotel",
            render: (branchid: number) => branchid && branches.some(i=>i.id==branchid) ? branches.find(i=>i.id==branchid)?.name : "Unassigned",
            className: "text-slate-500",
        },
        {
            title: "ASSIGNED HOTEL",
            dataIndex: "hotelid",
            key: "hotel",
            render: (hotelid: number) => hotelid && hotels.some(i=>i.id==hotelid) ? hotels.find(i=>i.id==hotelid)?.name : "Unassigned",
            className: "text-slate-500",
        },
       {
            title: "ACTIONS",
            key: "actions",
            render: (_: unknown, record: Employee) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        className="text-blue-500 hover:text-blue-700 font-semibold"
                        onClick={() => handleEditClick(record.id)}
                    >
                        Edit
                    </Button>
                    <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />} 
                        className="font-semibold"
                        onClick={() => showDeleteConfirm(record)}
                    >
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <>
            <Table 
                columns={columns} 
                dataSource={tableData} 
                rowKey="id"
                pagination={false}
                className="w-full"
            />
            <FormEdit 
                open={isEditModalOpen}
                employeeId={selectedEmployeeId}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEmployeeId(null);
                }}
                onSuccess={onRefresh}
                branches={branches}
                hotels={hotels}
                roles={roles}
            />
        </>
    );
}