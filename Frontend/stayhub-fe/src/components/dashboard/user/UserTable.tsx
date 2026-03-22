"use client";

import { EmployeeTableData } from "@/types/Employee";
import { Table, Tag, Badge, Space, Button, Modal, Avatar } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";

type UserTableParameter = {
    tableData: (EmployeeTableData & { _generatedPassword?: string })[];
}

export default function UserTable({ tableData }: UserTableParameter) {
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [currentEmployee, setCurrentEmployee] = useState<EmployeeTableData | null>(null);

    const showPassword = (record: EmployeeTableData & { _generatedPassword?: string }) => {
        setCurrentEmployee(record);
        setCurrentPassword(record._generatedPassword || "");
        setPasswordModalVisible(true);
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
            render: (_: unknown, record: EmployeeTableData & { role?: string }) => {
                // If roles array exists and has items, show the first, else fallback
                const roleName = record.roles && record.roles.length > 0 ? record.roles[0].role : record.role || "Employee";
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
            title: "ASSIGNED HOTEL",
            dataIndex: "hotelid",
            key: "hotel",
            render: (hotelid: number) => hotelid ? `Hotel ${hotelid}` : "Unassigned",
            className: "text-slate-500",
        },
        {
            title: "ACTIONS",
            key: "actions",
            render: (_: unknown, record: EmployeeTableData & { _generatedPassword?: string }) => (
                <Space size="middle">
                    {record._generatedPassword && (
                        <Button 
                            type="text" 
                            icon={<EyeOutlined />} 
                            onClick={() => showPassword(record)}
                            className="text-slate-500 hover:text-emerald-600"
                        />
                    )}
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
            
            <Modal
                title="Generated Password"
                open={passwordModalVisible}
                onOk={() => setPasswordModalVisible(false)}
                onCancel={() => setPasswordModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setPasswordModalVisible(false)}>
                        Close
                    </Button>
                ]}
            >
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-slate-600">
                        Please securely share the following auto-generated password with the employee <b>{currentEmployee?.firstname} {currentEmployee?.lastname}</b>.
                    </p>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-xl font-mono tracking-widest text-slate-800 select-all">
                            {currentPassword}
                        </span>
                    </div>
                </div>
            </Modal>
        </>
    );
}