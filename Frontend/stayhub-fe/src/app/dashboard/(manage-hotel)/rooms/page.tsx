"use client";

import { Room } from "@/types/Room";
import { Button, Table, Space, message, Popconfirm, Avatar } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function ManageRooms() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState<string>(searchParams.get('name') ?? '');
    const [results, setResults] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/rooms`, {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            setResults(data.response as Room[]);
        } catch (error) {
            console.error("An error occurred: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [query]);

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                message.success("Room deleted successfully");
                setResults(prev => prev.filter(r => r.id !== id));
            } else {
                message.error("Failed to delete room");
            }
        } catch (error) {
            message.error("Error deleting room");
        }
    };

    const filteredResults = results.filter(r => 
        r.type?.toLowerCase().includes(query.toLowerCase())
    );

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id: number) => <span className="text-gray-500 font-medium">#R-{id}</span>,
        },
        {
            title: "ROOM TYPE",
            key: "type",
            render: (_: unknown, record: Room) => (
                <Space size="middle">
                    {record.previewimages && record.previewimages.length > 0 ? (
                        <Avatar shape="square" src={record.previewimages[0]} size="large" className="rounded-lg shadow-sm" />
                    ) : (
                        <Avatar shape="square" size="large" className="bg-emerald-100 text-emerald-600 font-bold rounded-lg shadow-sm">
                            {record.type?.substring(0, 2).toUpperCase() || "RM"}
                        </Avatar>
                    )}
                    <span className="font-semibold text-slate-800 text-base">{record.type}</span>
                </Space>
            )
        },
        {
            title: "CAPACITY",
            dataIndex: "capacity",
            key: "capacity",
            render: (capacity: number) => <span className="text-slate-600 font-medium">{capacity} Guests</span>
        },
        {
            title: "PRICE / NIGHT",
            dataIndex: "price",
            key: "price",
            render: (price: number) => <span className="text-emerald-600 font-semibold">${price}</span>
        },
        {
            title: "SIZE",
            dataIndex: "size",
            key: "size",
            render: (size: number) => <span className="text-slate-600 font-medium">{size} m²</span>
        },
        {
            title: "BEDDING",
            dataIndex: "beds",
            key: "beds",
            render: (beds: Array<{name: string; count: number}>) => (
                <div className="flex flex-col gap-1">
                    {beds && beds.length > 0 ? beds.map((bed, idx) => (
                        <span key={idx} className="text-slate-600 text-sm">{bed.count}x {bed.name}</span>
                    )) : <span className="text-slate-400 text-sm">Not specified</span>}
                </div>
            )
        },
        {
            title: "AMENITIES",
            dataIndex: "amenities",
            key: "amenities",
            render: (amenities: Array<{name: string; icon: string; category: string}>) => (
                <span className="text-slate-600 font-medium">
                    {amenities ? amenities.length : 0} items
                </span>
            )
        },
        {
            title: "DISCOUNT",
            dataIndex: "discount",
            key: "discount",
            render: (discount: number) => (
                <span className={`font-semibold ${discount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    {discount > 0 ? `${discount}% OFF` : "None"}
                </span>
            )
        },
        {
            title: "ACTIONS",
            key: "actions",
            render: (_: unknown, record: Room) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => message.info("Edit function pending...")}
                        className="text-slate-500 hover:text-blue-600 font-semibold"
                    />
                    <Popconfirm
                        title="Delete the room"
                        description={`Are you sure to delete this room?`}
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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Rooms Directory</h1>
                <p className="text-slate-500 font-medium">Manage and monitor all hotel rooms.</p>
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
                        placeholder="Search by room type..."
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => router.push("/dashboard/rooms/add")} 
                        className="!flex-1 !md:flex-none !flex !items-center !justify-center !gap-2 !h-11 !px-6 !rounded-xl !bg-[#1E293B] !text-white !font-bold !text-sm !shadow-sm hover:!bg-slate-700" 
                        type="primary"
                    >
                        <FaPlus size={16} />
                        Add New Room
                    </Button>
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
        </div>
    );
}
