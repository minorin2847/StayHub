"use client";

import { useState } from "react";
import { Tag, Space } from "antd";
import { MdOutlineCalendarToday, MdOutlineHotel, MdOutlinePerson } from "react-icons/md";
import GenericTableView, { TableColumn } from "@/components/ui/GenericTableView";

export type Booking = {
    id: number;
    guestid: number;
    roomid: number;
    checkin: string;
    checkout: string;
    status: string;
    total_price: number;
    guest_name?: string;
    room_type?: string;
};

export type BookingFilterData = {
    name: string | null;
    status: string | null;
    page: string | null;
};

const STATUS_COLOR: Record<string, string> = {
    confirmed: "green",
    pending: "gold",
    cancelled: "red",
    completed: "blue",
    checkedin: "cyan",
};

export default function ManageBookings() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<Booking | null>(null);

    const columns: TableColumn[] = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id: number) => <span className="text-gray-500 font-medium">#BK-{String(id).padStart(4, "0")}</span>,
        },
        {
            title: "GUEST",
            key: "guest",
            render: (_: unknown, record: Booking) => (
                <Space size="middle">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-violet-100 text-violet-600">
                        <MdOutlinePerson size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{record.guest_name || `Guest #${record.guestid}`}</span>
                        <span className="text-xs text-slate-400">ID: {record.guestid}</span>
                    </div>
                </Space>
            ),
        },
        {
            title: "ROOM",
            key: "room",
            render: (_: unknown, record: Booking) => (
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600">
                        <MdOutlineHotel size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{record.room_type || `Room #${record.roomid}`}</span>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider">ID: {record.roomid}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "CHECK-IN",
            key: "checkin",
            render: (_: unknown, record: Booking) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <MdOutlineCalendarToday size={14} className="text-slate-400" />
                    <span className="font-medium">{record.checkin ? new Date(record.checkin).toLocaleDateString() : "—"}</span>
                </div>
            ),
        },
        {
            title: "CHECK-OUT",
            key: "checkout",
            render: (_: unknown, record: Booking) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <MdOutlineCalendarToday size={14} className="text-slate-400" />
                    <span className="font-medium">{record.checkout ? new Date(record.checkout).toLocaleDateString() : "—"}</span>
                </div>
            ),
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag
                    color={STATUS_COLOR[status?.toLowerCase()] || "default"}
                    className="rounded-full px-3 py-0.5 font-semibold border-none capitalize"
                >
                    {status || "Unknown"}
                </Tag>
            ),
        },
        {
            title: "TOTAL",
            dataIndex: "total_price",
            key: "total_price",
            render: (price: number) => (
                <span className="text-emerald-600 font-semibold text-base">${price?.toLocaleString() ?? "—"}</span>
            ),
        },
    ];

    return (
        <div className="flex flex-col w-full">
            <div className="px-[30px] pt-[30px] mb-[-10px] z-10 w-full shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Bookings</h1>
                <p className="text-slate-500 font-medium">View and manage all guest reservations for this hotel.</p>
            </div>

            <GenericTableView<Booking, BookingFilterData>
                resourceName="Booking"
                searchPlaceholder="Search by guest name, room or status..."
                tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/bookings`}
                loading={loading}
                setLoading={setLoading}
                renderCreateModal={(injected) => (
                    <></> // TODO: Add CreateBookingModal
                )}
                renderFilterModal={(injected) => (
                    <></> // TODO: Add FilterBookingModal
                )}
                renderEditModal={(injected) => (
                    <></> // TODO: Add EditBookingModal
                )}
                tableColumns={columns}
                currentRecord={currentRecord}
                setCurrentRecord={setCurrentRecord}
                generatedDeletePrompt={(record: Booking) => `Do you want to cancel booking #BK-${String(record.id).padStart(4, "0")}?`}
                generatedDeleteEndpoint={(record: Booking) => `${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/${record.id}`}
            />
        </div>
    );
}
