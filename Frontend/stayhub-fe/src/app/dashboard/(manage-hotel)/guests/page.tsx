"use client";
import { useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Tag, Tooltip } from "antd";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditModal from "./components/EditModal";
import { UserOutlined, PhoneOutlined, CalendarOutlined } from "@ant-design/icons";
import { Guest } from "@/types/Guest";

export type GuestFilterData = {
    query: string | null;
    minVisit: string | null;
    maxVisit: string | null;
    fromLastStay: string | null;
    toLastStay: string | null;
    sort: string | null;
    order: string | null;
    page: string | null;
};

export default function GuestView() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<Guest | null>(null);

    return (
        <GenericTableView<Guest, GuestFilterData>
            resourceName="Guest"
            searchPlaceholder="Search by name, phone, or email..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/guests`}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => <CreateModal {...injected} />}
            renderFilterModal={(injected) => <FilterModal {...injected} />}
            renderEditModal={(injected) => <EditModal {...injected} />}
            tableColumns={[
                {
                    title: "GUEST",
                    dataIndex: "full_name",
                    key: "full_name",
                    className: "font-semibold text-slate-800",
                    render: (name: string, record: Guest) => (
                        <div className="flex flex-col">
                            <span>{name}</span>
                            <span className="text-xs text-slate-400 font-normal">
                                <UserOutlined className="mr-1" /> G-{record.id}
                            </span>
                        </div>
                    )
                },
                {
                    title: "CONTACT",
                    dataIndex: "phone",
                    key: "phone",
                    render: (phone: string, record: Guest) => (
                        <div className="text-xs">
                            <div><PhoneOutlined className="mr-1" /> {phone}</div>
                            <div className="text-slate-400">{record.email || "No email"}</div>
                        </div>
                    ),
                },
                {
                    title: "VISITS",
                    dataIndex: "total_bookings",
                    key: "total_bookings",
                    render: (count: number) => (
                        <Tag color={count > 5 ? "gold" : "blue"} className="rounded-full px-3">
                            {count} Stays
                        </Tag>
                    ),
                },
                {
                    title: "LAST STAY",
                    dataIndex: "last_stay_date",
                    key: "last_stay_date",
                    render: (date: string) => date ? (
                        <span className="text-slate-600 text-xs">
                            <CalendarOutlined className="mr-1" />
                            {new Date(date).toLocaleDateString()}
                        </span>
                    ) : <span className="text-slate-300 italic">Never stayed</span>,
                },
            ]}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            generatedDeletePrompt={(record) => `Delete guest ${record.full_name}?`}
            generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/guests/delete/${record.id}`}
        />
    );
}