"use client";
import { useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Tag } from "antd";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditModal from "./components/EditModal";
import { Room, RoomType } from "@/types/Room";


export type RoomFilterData = {
    name: string | null;
    typeId: string | null;
    sort: string | null;
    order: string | null;
    page: string | null;
};

export default function RoomView() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRecord, setCurrentRecord] = useState<Room | null>(null);

    const fetchTypes = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/types`, {
            method: "GET",
            credentials: "include"
        });
        const data = await res.json();
        setRoomTypes(data);
    };

    return (
        <GenericTableView<Room, RoomFilterData>
            resourceName="Room"
            searchPlaceholder="Search rooms by name..."
            tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/rooms`}
            onDataFetched={async () => await fetchTypes()}
            loading={loading}
            setLoading={setLoading}
            renderCreateModal={(injected) => (
                <CreateModal {...injected} roomTypes={roomTypes} />
            )}
            renderFilterModal={(injected) => (
                <FilterModal {...injected} roomTypes={roomTypes} />
            )}
            renderEditModal={(injected) => (
                <EditModal {...injected} roomTypes={roomTypes} />
            )}
            tableColumns={[
                {
                    title: "ID",
                    dataIndex: "id",
                    key: "id",
                    className: "font-semibold text-slate-800",
                    render: (id: string) => `R-${id}`
                },
                {
                    title: "NAME",
                    dataIndex: "name",
                    key: "name",
                    className: "font-semibold text-slate-800",
                    render: (text: string) => text,
                },
                {
                    title: "TYPE",
                    dataIndex: "typeid",
                    key: "typeid",
                    render: (typeid: number) => {
                        const matchedType = roomTypes.find((t) => t.id === typeid);
                        return (
                            <Tag color="blue" className="rounded-full uppercase font-bold">
                                {matchedType ? matchedType.name : `Type ${typeid}`}
                            </Tag>
                        );
                    },
                },
                {
                    title: "NOTE",
                    dataIndex: "note",
                    key: "note",
                    render: (note: string | null) => {
                        if (!note) return <span className="text-gray-400 italic">No notes</span>;
                        return note.length > 100 ? `${note.substring(0, 100)}...` : note;
                    },
                },
            ]}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            generatedDeletePrompt={(record) => `Delete the room "${record.name}"?`}
            generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/delete/${record.id}`}
        />
    );
}