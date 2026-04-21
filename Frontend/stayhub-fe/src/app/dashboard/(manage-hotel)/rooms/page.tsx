"use client";

import { Room } from "@/types/Room";
import { Avatar, Space, Tag } from "antd";
import { useState } from "react";
import { MdOutlineBed, MdOutlineSquareFoot, MdOutlinePeople } from "react-icons/md";
import { FaPercentage } from "react-icons/fa";
import GenericTableView, { TableColumn } from "@/components/ui/GenericTableView";

export type RoomFilterData = {
    name: string | null;
    page: string | null;
};

export default function ManageRooms() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<Room | null>(null);

    const columns: TableColumn[] = [
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
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-base">{record.type}</span>
                        <span className="text-xs text-slate-400">{record.description?.substring(0, 40) || "No description"}</span>
                    </div>
                </Space>
            ),
        },
        {
            title: "CAPACITY",
            key: "capacity",
            render: (_: unknown, record: Room) => (
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-50 text-sky-600">
                        <MdOutlinePeople size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{record.capacity}</span>
                        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Guests</span>
                    </div>
                </div>
            ),
        },
        {
            title: "PRICE / NIGHT",
            dataIndex: "price",
            key: "price",
            render: (price: number) => (
                <span className="text-emerald-600 font-semibold text-base">${price}</span>
            ),
        },
        {
            title: "SIZE",
            key: "size",
            render: (_: unknown, record: Room) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <MdOutlineSquareFoot size={15} className="text-slate-400" />
                    <span className="font-medium">{record.size} m²</span>
                </div>
            ),
        },
        {
            title: "BEDDING",
            dataIndex: "beds",
            key: "beds",
            render: (beds: Array<{ name: string; count: number }>) => (
                <div className="flex flex-col gap-1">
                    {beds && beds.length > 0 ? (
                        beds.map((bed, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <MdOutlineBed size={14} className="text-slate-400" />
                                <span className="text-slate-600 text-sm">{bed.count}× {bed.name}</span>
                            </div>
                        ))
                    ) : (
                        <span className="text-slate-400 text-sm">Not specified</span>
                    )}
                </div>
            ),
        },
        {
            title: "AMENITIES",
            dataIndex: "amenities",
            key: "amenities",
            render: (amenities: Array<{ name: string; icon: string; category: string }>) => (
                <Tag color="blue" className="rounded-full font-semibold border-none">
                    {amenities ? amenities.length : 0} items
                </Tag>
            ),
        },
        {
            title: "DISCOUNT",
            dataIndex: "discount",
            key: "discount",
            render: (discount: number) => (
                discount > 0 ? (
                    <div className="flex items-center gap-1.5">
                        <FaPercentage size={12} className="text-emerald-500" />
                        <span className="text-emerald-600 font-semibold">{discount}% OFF</span>
                    </div>
                ) : (
                    <span className="text-slate-400 text-sm font-medium">None</span>
                )
            ),
        },
    ];

    return (
        <div className="flex flex-col w-full">
            <div className="px-[30px] pt-[30px] mb-[-10px] z-10 w-full shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Rooms Directory</h1>
                <p className="text-slate-500 font-medium">Manage and monitor all hotel rooms and configurations.</p>
            </div>

            <GenericTableView<Room, RoomFilterData>
                resourceName="Room"
                searchPlaceholder="Search by room type or description..."
                tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/rooms`}
                loading={loading}
                setLoading={setLoading}
                renderCreateModal={(injected) => (
                    <></> // TODO: Add CreateRoomModal
                )}
                renderFilterModal={(injected) => (
                    <></> // TODO: Add FilterRoomModal
                )}
                renderEditModal={(injected) => (
                    <></> // TODO: Add EditRoomModal
                )}
                tableColumns={columns}
                currentRecord={currentRecord}
                setCurrentRecord={setCurrentRecord}
                generatedDeletePrompt={(record: Room) => `Do you want to delete room "${record.type}"?`}
                generatedDeleteEndpoint={(record: Room) => `${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/${record.id}`}
            />
        </div>
    );
}