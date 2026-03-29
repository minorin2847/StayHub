"use client";

import { Table, Tag, Badge, Space, Button, Modal, Avatar, message } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { useState } from "react";
import { Hotel } from "@/types/Hotel";
import { Branch } from "@/types/Branch";
import { Role } from "@/types/Role";
import { RoleTableData } from "../page";
import FormEdit from "./FormEdit";

const { confirm } = Modal;

type RoleTableParameter = {
    tableData: RoleTableData[]
    onRefresh: () => void; // Added refresh callback
}

export default function RoleTable({ tableData, onRefresh }: RoleTableParameter) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const showDeleteConfirm = (record: RoleTableData) => {
        confirm({
            title: `Do you want to delete ${record.name}?`,
            icon: <ExclamationCircleFilled />,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/roles/delete/${record.name}`, {
                        method: 'DELETE',
                        credentials: "include"
                    });
                    if (res.ok) {
                        message.success("Role deleted!");
                        onRefresh();
                    } else {
                        message.error("Failed to delete role!");
                    }
                } catch (e) {
                    message.error("Error deleting role!");
                }
            },
        });
    };

    const handleEditClick = (name: string) => {
        setSelectedRole(name);
        setIsEditModalOpen(true);
    };


    const columns = [
        {
            title: "NAME",
            dataIndex: "name",
            key: "name",
            render: (name: string) => name,
            className: "text-slate-500",
        },
        {
            title: "TIER",
            key: "tier",
            render: (_: unknown, record: RoleTableData) => {
                const tierDict: {[tier: number]: {name: string, color: string}} = {
                    1: {name: "ADMIN", color: "red"},
                    2: {name: "BRANCH", color: "blue"},
                    3: {name: "HOTEL", color: "gold"},
                    4: {name: "ROOM", color: "purple"}
                }
                // Determine a tag color based on role
                return (
                    <Tag color={tierDict[record.tier].color} className="rounded-full px-3 py-1 font-semibold border-none">
                        {tierDict[record.tier].name}
                    </Tag>
                );

                
            }
        },
        {
            title: "USER COUNT",
            dataIndex: "usercount",
            key: "usercount",
            render: (usercount: number) => usercount ?? '0',
            className: "text-slate-500",
        },
       {
            title: "ACTIONS",
            key: "actions",
            render: (_: unknown, record: RoleTableData) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        className="text-blue-500 hover:text-blue-700 font-semibold"
                        onClick={() => handleEditClick(record.name)}
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
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedRole(null);
                }}
                onSuccess={onRefresh}
                name={selectedRole}
            />
        </>
    );
}