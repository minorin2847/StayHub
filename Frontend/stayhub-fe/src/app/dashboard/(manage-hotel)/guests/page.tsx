 "use client";

import { User } from "@/types/User";
import { Avatar, Space, Tag } from "antd";
import { useState } from "react";
import { MdOutlineEmail, MdOutlinePhone, MdOutlineLocationOn } from "react-icons/md";
import GenericTableView, { TableColumn } from "@/components/ui/GenericTableView";

export type GuestFilterData = {
    name: string | null;
    page: string | null;
};

export default function ManageGuests() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<User | null>(null);

    const columns: TableColumn[] = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id: number) => <span className="text-gray-500 font-medium">#G-{String(id).padStart(4, "0")}</span>,
        },
        {
            title: "GUEST",
            key: "name",
            render: (_: unknown, record: User) => {
                const initials = `${record.firstname?.[0] || ""}${record.lastname?.[0] || ""}`.toUpperCase();
                return (
                    <Space size="middle">
                        {record.avatar ? (
                            <Avatar src={record.avatar} size="large" className="shadow-sm" />
                        ) : (
                            <Avatar className="bg-violet-100 text-violet-700 font-bold" size="large">
                                {initials || "G"}
                            </Avatar>
                        )}
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-base">
                                {record.firstname} {record.lastname}
                            </span>
                            <span className="text-xs text-slate-400">Account #{record.accountid}</span>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: "CONTACT",
            key: "contact",
            render: (_: unknown, record: User) => (
                <div className="flex flex-col gap-1 text-sm text-slate-500">
                    {record.phonenumber && (
                        <span className="flex items-center gap-1.5">
                            <MdOutlinePhone size={14} className="text-slate-400" />
                            {record.phonenumber}
                        </span>
                    )}
                    {!record.phonenumber && <span className="text-slate-400">No contact</span>}
                </div>
            ),
        },
        {
            title: "LOCATION",
            key: "location",
            render: (_: unknown, record: User) => (
                <div className="flex items-center gap-1.5 text-slate-600">
                    <MdOutlineLocationOn size={14} className="text-slate-400" />
                    <span className="font-medium">
                        {[record.countrycode, record.address].filter(Boolean).join(", ") || "—"}
                    </span>
                </div>
            ),
        },
        {
            title: "GENDER",
            dataIndex: "gender",
            key: "gender",
            render: (gender: string) => {
                const color = gender === "male" ? "blue" : gender === "female" ? "pink" : "default";
                return (
                    <Tag color={color} className="rounded-full px-3 py-0.5 font-semibold border-none capitalize">
                        {gender || "Unknown"}
                    </Tag>
                );
            },
        },
        {
            title: "BIRTHDATE",
            dataIndex: "birthdate",
            key: "birthdate",
            render: (birthdate: string) => (
                <span className="text-slate-600 font-medium">
                    {birthdate ? new Date(birthdate).toLocaleDateString() : "—"}
                </span>
            ),
        },
    ];

    return (
        <div className="flex flex-col w-full">
            <div className="px-[30px] pt-[30px] mb-[-10px] z-10 w-full shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Guests</h1>
                <p className="text-slate-500 font-medium">View and manage all registered guests for this hotel.</p>
            </div>

            <GenericTableView<User, GuestFilterData>
                resourceName="Guest"
                searchPlaceholder="Search by name, phone or country..."
                tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/guests`}
                loading={loading}
                setLoading={setLoading}
                renderCreateModal={(injected) => (
                    <></> // TODO: Add CreateGuestModal
                )}
                renderFilterModal={(injected) => (
                    <></> // TODO: Add FilterGuestModal
                )}
                renderEditModal={(injected) => (
                    <></> // TODO: Add EditGuestModal
                )}
                tableColumns={columns}
                currentRecord={currentRecord}
                setCurrentRecord={setCurrentRecord}
                generatedDeletePrompt={(record: User) => `Do you want to remove guest ${record.firstname} ${record.lastname}?`}
                generatedDeleteEndpoint={(record: User) => `${process.env.NEXT_PUBLIC_API_URL}/employee/guests/${record.id}`}
            />
        </div>
    );
}
