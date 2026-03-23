"use client";

import { Employee} from "@/types/Employee";
import { Table, Tag, Badge, Space, Button, Modal, Avatar } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Hotel } from "@/types/Hotel";
import { Branch } from "@/types/Branch";

type UserTableParameter = {
    tableData: Employee[];
    hotels: Hotel[];
    branches: Branch[]
}

export default function UserTable({ tableData, hotels, branches }: UserTableParameter) {

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
            render: () => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        className="text-slate-500 hover:text-blue-600 font-semibold"
                    >
                        Edit
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
        </>
    );
}