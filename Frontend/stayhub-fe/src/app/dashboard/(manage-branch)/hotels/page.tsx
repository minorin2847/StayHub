"use client";

import { Hotel } from "@/types/Hotel";
import { Button, Modal, Space, Avatar, Badge, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { MdOutlineEmail, MdOutlinePhone, MdOutlineMeetingRoom } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import CreateModal from "./components/CreateModal";
import EditModal from "./components/EditModal";
import FilterModal from "./components/FilterModal";
import GenericTableView, { TableColumn } from "@/components/ui/GenericTableView";

export type HotelFilterData = {
    name: string | null;
    page: string | null;
}

export default function ManageHotels() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<Hotel | null>(null);

    const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);

    const columns: TableColumn[] = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id: number) => <span className="text-gray-500 font-medium">#H-{id}</span>,
        },
        {
            title: "HOTEL INFO",
            key: "name",
            render: (_: unknown, record: any) => (
                <Space size="middle">
                    {record.previewimages && record.previewimages.length > 0 ? (
                        <Avatar shape="square" src={record.previewimages[0]} size="large" className="rounded-lg shadow-sm" />
                    ) : (
                        <Avatar shape="square" size="large" className="bg-emerald-100 text-emerald-600 font-bold rounded-lg shadow-sm">
                            {record.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                    )}
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-base">{record.name}</span>
                        {record.classification && record.classification > 0 ? (
                            <div className="flex items-center gap-[2px] mt-0.5">
                                {[...Array(record.classification)].map((_, i) => (
                                    <FaStar key={i} className="text-amber-400" size={12} />
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400">No rating</span>
                        )}
                    </div>
                </Space>
            )
        },
        {
            title: "BRANCH",
            dataIndex: "branchid",
            key: "branch",
            render: (branchid: number) => (
                <Badge 
                    status={branchid ? "success" : "default"} 
                    text={branchid ? `Branch ${branchid}` : "Independent"} 
                    className="font-medium text-slate-600"
                />
            ),
        },
        {
            title: "CAPACITY",
            key: "capacity",
            render: (_: unknown, record: any) => (
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-50 text-sky-600">
                        <MdOutlineMeetingRoom size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{record.room_count || 0}</span>
                        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Rooms</span>
                    </div>
                </div>
            )
        },
        {
            title: "LOCATION",
            key: "location",
            render: (_: unknown, record: any) => (
                <div className="flex flex-col">
                    <span className="text-slate-700 font-medium">{record.location.split(',')[0]}</span>
                    <span className="text-slate-400 text-xs">{record.location}</span>
                </div>
            )
        },
        {
            title: "CONTACT INFO",
            key: "contact",
            render: (_: unknown, record: any) => (
                <div className="flex flex-col gap-1 text-sm text-slate-500">
                    {record.contact_email && (
                        <span className="flex items-center gap-1.5"><MdOutlineEmail size={14} className="text-slate-400"/> {record.contact_email}</span>
                    )}
                    {record.contact_phone && (
                        <span className="flex items-center gap-1.5"><MdOutlinePhone size={14} className="text-slate-400"/> {record.contact_phone}</span>
                    )}
                    {!record.contact_email && !record.contact_phone && <span>N/A</span>}
                </div>
            )
        },
    ];

    return (
        <div className="flex flex-col w-full">
            <div className="px-[30px] pt-[30px] mb-[-10px] z-10 w-full shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Hotels Directory</h1>
                <p className="text-slate-500 font-medium">Manage and monitor all hotel branches and properties.</p>
            </div>
            
            <GenericTableView<Hotel, HotelFilterData>
                resourceName="Hotel"
                searchPlaceholder="Search by name, branch or location..."
                tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/hotels`}
                loading={loading}
                setLoading={setLoading}
                renderCreateModal={(injected) => (
                    <CreateModal
                        {...injected}
                    />
                )}
                renderFilterModal={(injected) => (
                    <FilterModal
                        {...injected}
                    />
                )}
                renderEditModal={(injected) => (
                    <EditModal
                        {...injected}
                    />
                )}
                tableColumns={columns}
                currentRecord={currentRecord}
                setCurrentRecord={setCurrentRecord}
                generatedDeletePrompt={(record: Hotel) => `Do you want to delete ${record.name}?`}
                generatedDeleteEndpoint={(record: Hotel) => `${process.env.NEXT_PUBLIC_API_URL}/employee/hotels/delete/${record.id}`}
            />

        </div>
    );
}