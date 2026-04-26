"use client";
import { useEffect, useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Tag, Button, message, Modal, Table, Space } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { DashboardReserve } from "@/types/Reserve.js"; // Assume you have this type
import { Room, RoomType } from "@/types/Room";
import ReserveFilterModal from "./components/FilterModal";
import EditReservedRoomModal from "./components/EditModal";
import AddReservedRoomModal from "./components/AddRoomModal";

export type ReserveFilterData = {
    query: string | null;
    overallStatus: string | null;
    bookingStatus: string | null;
    paymentStatus: string | null;
    roomId: string | null;
    page: string | null;
};

export default function ReserveView() {
    const [loading, setLoading] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<DashboardReserve | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

    // Modals state
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [recordToCancel, setRecordToCancel] = useState<DashboardReserve | null>(null);
    const [onSuccess, setOnSuccess] = useState<(() => Promise<void>) | null>(null);

    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [recordToApprove, setRecordToApprove] = useState<DashboardReserve | null>(null);

    const [currentRoom, setCurrentRoom] = useState<any | null>(null);
    const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [targetReserveId, setTargetReserveId] = useState<number | null>(null);
    const [refreshTable, setRefreshTable] = useState<(() => Promise<void>) | null>(null);

    useEffect(() => {
        const fetchRoomsAndTypes = async () => {
            try {
                const [roomsRes, typesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/`, { credentials: "include" }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/types`, { credentials: "include" })
                ]);
                if (roomsRes.ok) setRooms(await roomsRes.json());
                if (typesRes.ok) setRoomTypes(await typesRes.json());
            } catch (e) {
                console.error("Failed to fetch room data", e);
            }
        };
        fetchRoomsAndTypes();
    }, []);

    // --- ROOM LEVEL ACTIONS ---
    const handleCancelRoom = async (room: any, onRefresh: () => Promise<void>) => {
        Modal.confirm({
            title: 'Cancel this reserved room?',
            content: `Are you sure you want to cancel Room ${room.roomID}?`,
            okText: 'Yes, Cancel',
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/rooms/edit/${room.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ booking_status: 'Cancelled' }),
                        credentials: "include"
                    });
                    if (res.ok) {
                        message.success("Room cancelled");
                        await onRefresh();
                    }
                } catch (e) {
                    message.error("Failed to cancel room");
                }
            }
        });
    };

    const handleDeleteRoom = async (room: any, onRefresh: () => Promise<void>) => {
        Modal.confirm({
            title: 'Delete Room from Cart?',
            content: 'This will permanently remove this room entry from the reservation.',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/rooms/delete/${room.id}`, {
                        method: "DELETE",
                        credentials: "include"
                    });
                    if (res.ok) {
                        message.success("Room removed");
                        await onRefresh();
                    }
                } catch (e) {
                    message.error("Failed to remove room");
                }
            }
        });
    };

    const expandedRoomColumns = (onRefresh: () => Promise<void>, onEdit: (room: any) => void) => [
        { title: "Room ID", dataIndex: "roomID", key: "roomID" },
        { title: "Conf. Code", dataIndex: "confirmation_code", key: "confirmation_code", className: "font-mono text-xs" },
        {
            title: "Booking Status",
            dataIndex: "booking_status",
            key: "booking_status",
            render: (status: string) => (
                <Tag color={status === 'Confirmed' ? 'green' : status === 'Cancelled' ? 'red' : status === 'Awaiting Confirmation' ? 'orange' : 'blue'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: "Payment",
            dataIndex: "payment_status",
            key: "payment_status",
            render: (status: string) => <Tag color={status === 'Paid' ? 'green' : 'default'}>{status}</Tag>
        },
        { title: "Price", dataIndex: "final_price", key: "final_price", render: (val: string) => `$${val}` },
        {
            title: "ACTIONS",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                    {record.booking_status !== 'Cancelled' && record.booking_status !== 'Completed' && (
                        <Button type="text" size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleCancelRoom(record, onRefresh)} />
                    )}
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRoom(record, onRefresh)} />
                </Space>
            )
        }
    ];

    // --- RESERVE LEVEL ACTIONS ---
    const confirmCancel = async () => {
        if (!recordToCancel) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/cancel/${recordToCancel.id}`, {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                message.success("Entire reserve cancelled successfully");
                setIsCancelModalOpen(false);
                if (onSuccess) { await onSuccess(); setOnSuccess(null); }
            } else {
                message.error(await res.text() || "Failed to cancel reserve.");
            }
        } catch (e) {
            message.error("Failed to cancel reserve due to network error.");
        }
    };

    const confirmApprove = async () => {
        if (!recordToApprove) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/approve/${recordToApprove.id}`, {
                method: "POST",
                credentials: "include"
            });
            if (res.ok) {
                message.success("Reservation Approved and converted to PMS Booking!");
                setIsApproveModalOpen(false);
                if (onSuccess) { await onSuccess(); setOnSuccess(null); }
            } else {
                message.error(await res.text() || "Failed to approve reserve.");
            }
        } catch (e) {
            message.error("Failed to approve reserve.");
        }
    };

    return (
        <>
            <GenericTableView<any, ReserveFilterData>
                resourceName="Online Reserve"
                searchPlaceholder="Search by guest name or conf code..."
                tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/reserves`}
                hasEdit={false} // Edit header disabled
                hasCreate={false}
                renderFilterModal={(injected) => <ReserveFilterModal {...injected} rooms={rooms} />}
                
                expandable={({ fetchData, setLoading }) => ({
                    expandedRowRender: (record) => (
                        <div className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100 m-2 shadow-inner">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] mb-4">
                                Cart Rooms for Reserve #{record.id}
                            </h4>
                            <Table
                                columns={expandedRoomColumns(async () => {
                                    setLoading(true); await fetchData(); setLoading(false);
                                }, (room: any) => {
                                    setCurrentRoom(room); setIsEditRoomOpen(true);
                                })}
                                dataSource={record.rooms}
                                pagination={false} size="small" rowKey="id" className="bg-transparent"
                            />
                        </div>
                    ),
                    rowExpandable: (record) => record.rooms?.length > 0,
                })}
                loading={loading}
                setLoading={setLoading}

                customActions={(record, { fetchData, setLoading }) => {
                    const handleRefresh = async () => { setLoading(true); await fetchData(); setLoading(false); };
                    
                    return (
                        <>
                            {/* APPROVE ACTION */}
                            {record.overall_status === 'Awaiting Confirmation' && (
                                <Button
                                    type="text"
                                    className="text-emerald-500 hover:text-emerald-700 font-semibold"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => {
                                        setRecordToApprove(record);
                                        setOnSuccess(() => handleRefresh);
                                        setIsApproveModalOpen(true);
                                    }}
                                >
                                    Approve
                                </Button>
                            )}

                            {/* ADD ROOM ACTION */}
                            <Button
                                type="text"
                                className="text-blue-500 hover:text-blue-700 font-semibold"
                                icon={<PlusCircleOutlined />}
                                onClick={() => {
                                    setTargetReserveId(record.id);
                                    setRefreshTable(() => handleRefresh);
                                    setIsAddRoomOpen(true);
                                }}
                            >
                                Add Room
                            </Button>

                            {/* CANCEL RESERVE ACTION */}
                            {record.overall_status !== 'Cancelled' && record.overall_status !== 'Completed' && (
                                <Button
                                    type="text" danger className="font-semibold"
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        setRecordToCancel(record);
                                        setOnSuccess(() => handleRefresh);
                                        setIsCancelModalOpen(true);
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </>
                    );
                }}
                tableColumns={[
                    { title: "GUEST", dataIndex: "guest_full_name", key: "guest", className: "font-semibold", render: (name: string) => name },
                    { title: "ROOMS", dataIndex: "total_rooms", key: "rooms", render: (totalRooms: number) => totalRooms },
                    { title: "TOTAL PRICE", dataIndex: "total_price", key: "price", render: (val) => `$${val}` },
                    {
                        title: "STATUS", dataIndex: "overall_status", key: "status",
                        render: (status: string) => (
                            <Tag color={status === 'Confirmed' ? 'green' : status === 'Cancelled' ? 'red' : status === 'Awaiting Confirmation' ? 'orange' : 'blue'}>
                                {status.toUpperCase()}
                            </Tag>
                        )
                    }
                ]}
                currentRecord={currentRecord}
                setCurrentRecord={setCurrentRecord}
                generatedDeletePrompt={(record) => `Delete entire reserve for ${record.guest_full_name}?`}
                generatedDeleteEndpoint={(record) => `${process.env.NEXT_PUBLIC_API_URL}/employee/reserves/delete/${record.id}`}
            />

            {/* CANCEL MODAL */}
            <Modal
                title="Cancel Entire Reserve?"
                open={isCancelModalOpen}
                onCancel={() => setIsCancelModalOpen(false)}
                footer={[
                    <Button key="confirm" danger type="primary" onClick={confirmCancel}>Yes, Cancel</Button>,
                    <Button key="back" onClick={() => setIsCancelModalOpen(false)}>Back</Button>,
                ]}
            >
                <p>Are you sure you want to cancel the reservation for <b>{recordToCancel?.guest_full_name}</b>?</p>
                <p className="text-slate-500 text-xs">This will release all rooms and mark the cart as cancelled.</p>
            </Modal>

            {/* APPROVE MODAL */}
            <Modal
                title="Approve Reservation?"
                open={isApproveModalOpen}
                onCancel={() => setIsApproveModalOpen(false)}
                footer={[
                    <Button key="confirm" type="primary" className="bg-emerald-500" onClick={confirmApprove}>Approve & Finalize</Button>,
                    <Button key="back" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>,
                ]}
            >
                <p>Approve the reservation for <b>{recordToApprove?.guest_full_name}</b>?</p>
                <p className="text-slate-500 text-xs">This will convert the online request into a finalized PMS Booking.</p>
            </Modal>

            {/* EDIT ROOM MODAL */}
            <EditReservedRoomModal
                open={isEditRoomOpen}
                onClose={() => { setIsEditRoomOpen(false); setCurrentRoom(null); }}
                current={currentRoom}
                rooms={rooms}
                roomTypes={roomTypes}
                onSuccess={async () => window.location.reload()}
            />

            {/* ADD ROOM MODAL */}
            <AddReservedRoomModal 
                open={isAddRoomOpen}
                onClose={() => { setIsAddRoomOpen(false); setTargetReserveId(null); }}
                reserveId={targetReserveId}
                rooms={rooms}
                roomTypes={roomTypes}
                onSuccess={async () => { if (refreshTable) await refreshTable(); }}
            />
        </>
    );
}