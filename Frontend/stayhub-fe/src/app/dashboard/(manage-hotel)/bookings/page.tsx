"use client";
import { useEffect, useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Tag, Button, message, Modal } from "antd";
import { CloseCircleOutlined, CalendarOutlined, HomeOutlined } from "@ant-design/icons";
import { Booking } from "@/types/Booking";
import { Room, RoomType } from "@/types/Room";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditModal from "./components/EditModal";

export type BookingFilterData = {
    query: string | null;
    status: string | null;
    roomId: string | null;
    checkinAfter: string | null;
    checkinBefore: string | null;
    page: string | null;
};

export default function BookingView() {
    const [loading, setLoading] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Booking | null>(null);
    const [recordToCancel, setRecordToCancel] = useState<Booking | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [cancelCallback, setCancelCallback] = useState<(() => Promise<void>) | null>(null);
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/`, {
                    credentials: "include"
                });
                const data = await res.json();
                setRooms(data); // Assumes data is an array of { id, room_name, ... }
            } catch (e) {
                console.error("Failed to fetch rooms", e);
            }
        };
        fetchRooms();

        const fetchRoomTypes = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/types`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setRoomTypes(data);
                }
            } catch (e) {
                console.error("Failed to fetch room types:", e);
            }
        };
        fetchRoomTypes();
    }, []);

    const triggerCancelModal = (record: any, callback: () => Promise<void>) => {
        setRecordToCancel(record);
        setCancelCallback(() => callback); // Store the function itself
        setIsCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/edit/${recordToCancel?.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ booking_status: 'Cancelled' }),
                credentials: "include"
            });
            if (res.ok) {
                message.success("Booking cancelled successfully");
                setIsCancelModalOpen(false);
                if (cancelCallback) {
                await cancelCallback(); 
                setCancelCallback(null); // Clear it after use
            }
            }
        } catch (e) {
            message.error("Failed to cancel booking");
        }
    };
    return (
        <>
            <GenericTableView<any, BookingFilterData>
                resourceName="Booking"
                searchPlaceholder="Search by guest name..."
                tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/bookings`}
                loading={loading}
                setLoading={setLoading}

                renderCreateModal={(injected) => <CreateModal {...injected} rooms={rooms} roomTypes={roomTypes}/>}
                renderFilterModal={(injected) => <FilterModal {...injected} rooms={rooms}/>}
                renderEditModal={(injected) => <EditModal {...injected} rooms={rooms} roomTypes={roomTypes}/>}
                hasAdditionalAction
                renderAdditionalAction={(record, onSuccess) => (
                        record.booking_status === 'Checked-In' && (
                            <Button 
                                type="text" 
                                danger 
                                icon={<CloseCircleOutlined />} 
                                onClick={() => triggerCancelModal(record, onSuccess)}
                            >
                                Cancel
                            </Button>
                        )
                    )}
                tableColumns={[
                    {
                        title: "GUEST",
                        dataIndex: "guest_full_name",
                        key: "guest",
                        className: "font-semibold",
                        render: (name: string) => name
                    },
                    {
                        title: "ROOM",
                        dataIndex: "roomid",
                        key: "room",
                        render: (id: number) => <span><HomeOutlined /> Room {rooms.find(i=>i.id===id)?.name}</span>
                    },
                    {
                        title: "DATES",
                        key: "dates",
                        render: (_, record) => (
                            <div className="text-xs text-slate-500">
                                <CalendarOutlined /> {new Date(record.checkin_date).toLocaleDateString()} - {new Date(record.checkout_date).toLocaleDateString()}
                            </div>
                        )
                    },
                    {
                        title: "STATUS",
                        dataIndex: "booking_status",
                        key: "status",
                        render: (status: string) => (
                            <Tag color={status === 'Checked-In' ? 'green' : status === 'Cancelled' ? 'red' : 'blue'}>
                                {status.toUpperCase()}
                            </Tag>
                        )
                    }
                ]}
                currentRecord={currentRecord}
                setCurrentRecord={setCurrentRecord}
                generatedDeletePrompt={(record) => `Delete record for ${record.guest_full_name}?`}
                generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/delete/${record.id}`}
            />

        {/* CUSTOM CONFIRMATION MODAL */}
            <Modal
                title="Cancel Booking?"
                open={isCancelModalOpen}
                onCancel={() => setIsCancelModalOpen(false)}
                footer={[
                    // "Yes" button on the LEFT
                    <Button 
                        key="confirm" 
                        danger 
                        type="primary" 
                        onClick={confirmCancel}
                    >
                        Yes, Cancel Booking
                    </Button>,
                    // "No" button on the RIGHT
                    <Button 
                        key="back" 
                        onClick={() => setIsCancelModalOpen(false)}
                    >
                        Cancel
                    </Button>,
                ]}
            >
                <p>Are you sure you want to cancel the booking for <b>{recordToCancel?.guest_full_name}</b>?</p>
                <p className="text-slate-500 text-xs text-secondary">This will release the room and mark the stay as cancelled.</p>
            </Modal>
        </>
    );
}