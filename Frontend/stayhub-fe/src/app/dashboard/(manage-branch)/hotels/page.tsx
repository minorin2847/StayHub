"use client";

import { Hotel } from "@/types/Hotel";
import { Button, Modal, Table, Space, Avatar, Badge, message, Popconfirm } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdOutlineEmail, MdOutlinePhone } from "react-icons/md";
import FormCreate from "./components/FormCreate";

export default function ManageHotels() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState<string>(searchParams.get('name') ?? '');
    const [results, setResults] = useState<(Hotel & { _generatedPassword?: string })[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<Hotel | null>(null);

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);

    const showModal = (record?: Hotel) => {
        if (record) {
            setEditRecord(record);
        } else {
            setEditRecord(null);
        }
        setOpen(true);
    };

    const closeModal = () => setOpen(false);

    const showPassword = (record: any) => {
        setCurrentHotel(record);
        setCurrentPassword(record._generatedPassword);
        setPasswordModalVisible(true);
    };

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/hotels`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            setResults(data.response as Hotel[]);
        } catch (error) {
            console.error("An error occurred: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, [query]);

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                message.success("Hotel deleted successfully");
                setResults(prev => prev.filter(r => r.id !== id));
            } else {
                message.error("Failed to delete hotel");
            }
        } catch (error) {
            message.error("Error deleting hotel");
        }
    };

    const handleSuccess = (record: any, generatedPassword?: string, isEdit?: boolean) => {
        setResults(prev => {
            if (isEdit) {
                return prev.map(r => r.id === record.id ? { ...r, ...record } : r);
            }
            return [record, ...prev];
        });
    };

    const filteredResults = results.filter(h => 
        h.name.toLowerCase().includes(query.toLowerCase()) || 
        h.location.toLowerCase().includes(query.toLowerCase())
    );

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id: number) => <span className="text-gray-500 font-medium">#H-{id}</span>,
        },
        {
            title: "HOTEL NAME",
            key: "name",
            render: (_: unknown, record: Hotel) => (
                <Space size="middle">
                    {record.previewimages && record.previewimages.length > 0 ? (
                        <Avatar shape="square" src={record.previewimages[0]} size="large" className="rounded-lg shadow-sm" />
                    ) : (
                        <Avatar shape="square" size="large" className="bg-emerald-100 text-emerald-600 font-bold rounded-lg shadow-sm">
                            {record.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                    )}
                    <span className="font-semibold text-slate-800 text-base">{record.name}</span>
                </Space>
            )
        },
        {
            title: "BRANCH",
            dataIndex: "branchid",
            key: "branch",
            render: (branchid: number) => branchid ? `Branch ${branchid}` : "Independent",
            className: "text-slate-600 font-medium"
        },
        {
            title: "LOCATION",
            key: "location",
            render: (_: unknown, record: Hotel) => (
                <div className="flex flex-col">
                    <span className="text-slate-700 font-medium">{record.location.split(',')[0]}</span>
                    <span className="text-slate-400 text-xs">{record.location}</span>
                </div>
            )
        },
        {
            title: "CONTACT INFO",
            key: "contact",
            render: (_: unknown, record: Hotel) => (
                <div className="flex flex-col gap-1 text-sm text-slate-500">
                    {record.contact_email && (
                        <span className="flex items-center gap-1.5"><MdOutlineEmail size={14}/> {record.contact_email}</span>
                    )}
                    {record.contact_phone && (
                        <span className="flex items-center gap-1.5"><MdOutlinePhone size={14}/> {record.contact_phone}</span>
                    )}
                    {!record.contact_email && !record.contact_phone && <span>N/A</span>}
                </div>
            )
        },
        {
            title: "ACTIONS",
            key: "actions",
            render: (_: unknown, record: Hotel & { _generatedPassword?: string }) => (
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
                        onClick={() => showModal(record)}
                        className="text-slate-500 hover:text-blue-600 font-semibold"
                    />
                    <Popconfirm
                        title="Delete the hotel"
                        description={`Are you sure to delete ${record.name}?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            type="text" 
                            icon={<DeleteOutlined />} 
                            className="text-slate-500 hover:text-red-500"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-y-[30px] px-[30px] pt-[30px]">
            <div className="flex flex-col gap-1 mb-2">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Hotels Directory</h1>
                <p className="text-slate-500 font-medium">Manage and monitor all hotel branches and properties.</p>
            </div>

            <div className="flex justify-between items-center gap-4 w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex grow group items-center gap-x-4 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-inner transition-all">
                    <FaMagnifyingGlass 
                        className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" 
                        size={18} 
                    />
                    <input
                        className="outline-none text-sm font-medium placeholder:text-slate-400 transition-all focus:border-emerald-500 w-full" 
                        type="text" 
                        placeholder="Search by name, branch or location..."
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => showModal()} 
                        className="!flex-1 !md:flex-none !flex !items-center !justify-center !gap-2 !h-11 !px-6 !rounded-xl !bg-[#1E293B] !text-white !font-bold !text-sm !shadow-sm hover:!bg-slate-700" 
                        type="primary"
                    >
                        <FaPlus size={16} />
                        Add New Hotel
                    </Button>
                    <FormCreate open={open} onClose={closeModal} onSuccess={handleSuccess} editRecord={editRecord} />
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden mb-8">
                <Table 
                    columns={columns} 
                    dataSource={filteredResults} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: false, position: ["bottomCenter"] }}
                    className="w-full custom-table"
                />
            </div>
            
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
                        Please securely share the following auto-generated password with the hotel management account for <b>{currentHotel?.name}</b>.
                    </p>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-xl font-mono tracking-widest text-slate-800 select-all">
                            {currentPassword}
                        </span>
                    </div>
                </div>
            </Modal>
        </div>
    );
}