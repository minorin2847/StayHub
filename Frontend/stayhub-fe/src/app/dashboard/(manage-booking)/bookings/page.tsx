"use client";
import { useEffect, useState } from "react";
import GenericTableView from "@/components/ui/GenericTableView";
import { Tag, Button, message, Modal, Table, Space } from "antd";
import {
  CloseCircleOutlined,
  CalendarOutlined,
  HomeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Booking } from "@/types/Booking";
import { Room, RoomType } from "@/types/Room";
import CreateModal from "./components/CreateModal";
import FilterModal from "./components/FilterModal";
import EditRoomModal from "./components/EditRoomModal";
import AddRoomModal from "./components/AddRoomModal";

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
  const [onSuccess, setOnSuccess] = useState<(() => Promise<void>) | null>(
    null,
  );

  const [currentRoom, setCurrentRoom] = useState<any | null>(null);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<number | null>(null);
  const [refreshTable, setRefreshTable] = useState<
    (() => Promise<void>) | null
  >(null);
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/`,
          {
            credentials: "include",
          },
        );
        const data = await res.json();
        setRooms(data); // Assumes data is an array of { id, room_name, ... }
      } catch (e) {
        console.error("Failed to fetch rooms", e);
      }
    };
    fetchRooms();

    const fetchRoomTypes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/employee/rooms/types`,
          {
            credentials: "include",
          },
        );
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
  const handleCancelRoom = async (
    room: any,
    onSuccess: () => Promise<void>,
  ) => {
    Modal.confirm({
      title: "Cancel this room?",
      content: `Are you sure you want to cancel Room ${room.roomid}?`,
      okText: "Yes, Cancel",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/rooms/edit/${room.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ room_status: "Cancelled" }),
              credentials: "include",
            },
          );
          if (res.ok) {
            message.success("Room cancelled");
            await onSuccess(); // Refresh the main table
          }
        } catch (e) {
          message.error("Failed to cancel room");
        }
      },
    });
  };

  const handleDeleteRoom = async (
    room: any,
    onSuccess: () => Promise<void>,
  ) => {
    Modal.confirm({
      title: "Remove Room from Booking?",
      content: "This will permanently remove this room entry.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/rooms/delete/${room.id}`,
            {
              method: "DELETE",
              credentials: "include",
            },
          );
          if (res.ok) {
            message.success("Room removed");
            await onSuccess();
          }
        } catch (e) {
          message.error("Failed to remove room");
        }
      },
    });
  };
  const expandedRoomColumns = (
    onSuccess: () => Promise<void>,
    onEdit: (room: any) => void,
  ) => [
    { title: "Room ID", dataIndex: "roomid", key: "roomid" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Checked-In"
              ? "green"
              : status === "Cancelled"
                ? "red"
                : "blue"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Check-in",
      dataIndex: "checkin",
      key: "checkin",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Check-out",
      dataIndex: "checkout",
      key: "checkout",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="small">
          {/* 1. Edit Room - You'll need a specific Room Edit Modal */}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />

          {/* 2. Quick Cancel - Specialized status update */}
          {record.status !== "Cancelled" && record.status !== "Checked-Out" && (
            <Button
              type="text"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelRoom(record, onSuccess)}
            >
              Cancel
            </Button>
          )}

          {/* 3. Hard Delete - Removes the row from booked_room */}
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRoom(record, onSuccess)}
          />
        </Space>
      ),
    },
  ];
  const triggerCancelModal = (record: any, callback: () => Promise<void>) => {
    setRecordToCancel(record);
    setOnSuccess(() => callback); // Store the function itself
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!recordToCancel) return;

    try {
      // Just call the new single endpoint with the parent booking ID
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/cancel/${recordToCancel.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (res.ok) {
        message.success("Entire booking cancelled successfully");
        setIsCancelModalOpen(false);

        // Refresh the table
        if (onSuccess) {
          await onSuccess();
          setOnSuccess(null);
        }
      } else {
        const errText = await res.text();
        message.error(errText || "Failed to cancel booking.");
      }
    } catch (e) {
      console.error(e);
      message.error("Failed to cancel booking due to network error.");
    }
  };
  return (
    <>
      <GenericTableView<any, BookingFilterData>
        resourceName="Booking"
        searchPlaceholder="Search by guest name..."
        tableDataEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard/bookings`}
        expandable={({ fetchData, setLoading }) => ({
          expandedRowRender: (record) => (
            <div className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100 m-2 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
                  Room Details for Booking #{record.id}
                </h4>
              </div>
              <Table
                columns={expandedRoomColumns(
                  async () => {
                    setLoading(true);
                    await fetchData();
                    setLoading(false);
                  },
                  (room: any) => {
                    setCurrentRoom(room); // Set the specific room to edit
                    setIsEditRoomOpen(true);
                  },
                )}
                dataSource={record.rooms}
                pagination={false}
                size="small"
                rowKey="id"
                className="bg-transparent"
              />
            </div>
          ),
          rowExpandable: (record) => record.rooms?.length > 0,
        })}
        loading={loading}
        setLoading={setLoading}
        renderCreateModal={(injected) => (
          <CreateModal {...injected} rooms={rooms} roomTypes={roomTypes} />
        )}
        renderFilterModal={(injected) => (
          <FilterModal {...injected} rooms={rooms} />
        )}
        hasEdit={false}
        customActions={(record, { fetchData, setLoading }) => (
          <>
            {/* Action 1: Add a Room */}
            <Button
              type="text"
              className="text-emerald-500 hover:text-emerald-700 font-semibold"
              icon={<PlusCircleOutlined />}
              onClick={() => {
                setTargetBookingId(record.id);
                setRefreshTable(() => fetchData); // Save the context's fetchData so the modal can trigger it
                setIsAddRoomOpen(true);
              }}
            >
              Add Room
            </Button>

            {/* Action 2: Cancel Entire Booking */}
            {record.booking_status !== "Cancelled" && (
              <Button
                type="text"
                danger
                className="font-semibold"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  // Pass the context's fetchData into your triggerCancelModal function
                  triggerCancelModal(record, async () => {
                    setLoading(true);
                    await fetchData();
                    setLoading(false);
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </>
        )}
        tableColumns={[
          {
            title: "GUEST",
            dataIndex: "guest_full_name",
            key: "guest",
            className: "font-semibold",
            render: (name: string) => name,
          },
          {
            title: "ROOM",
            dataIndex: "roomid",
            key: "room",
            render: (id: number) => (
              <span>
                <HomeOutlined /> Room {rooms.find((i) => i.id === id)?.name}
              </span>
            ),
          },
          {
            title: "DATES",
            key: "dates",
            render: (_, record) => (
              <div className="text-xs text-slate-500">
                <CalendarOutlined />{" "}
                {new Date(record.checkin_date).toLocaleDateString()} -{" "}
                {new Date(record.checkout_date).toLocaleDateString()}
              </div>
            ),
          },
          {
            title: "STATUS",
            dataIndex: "booking_status",
            key: "status",
            render: (status: string) => {
              let color = "blue"; // Mặc định cho 'Confirmed Booking', 'Reserved'

              if (
                status === "Checked-In" ||
                status === "Stayed" ||
                status === "Confirmed"
              ) {
                color = "green";
              } else if (status === "Cancelled" || status === "Empty") {
                color = "red";
              } else if (
                status.includes("Partial") ||
                status === "Awaiting Confirmation"
              ) {
                color = "orange";
              }

              return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
          },
        ]}
        currentRecord={currentRecord}
        setCurrentRecord={setCurrentRecord}
        generatedDeletePrompt={(record) =>
          `Delete record for ${record.guest_full_name}?`
        }
        generatedDeleteEndpoint={(record) =>
          `${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/delete/${record.id}`
        }
      />

      {/* CUSTOM CONFIRMATION MODAL */}
      <Modal
        title="Cancel Booking?"
        open={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        footer={[
          // "Yes" button on the LEFT
          <Button key="confirm" danger type="primary" onClick={confirmCancel}>
            Yes, Cancel Booking
          </Button>,
          // "No" button on the RIGHT
          <Button key="back" onClick={() => setIsCancelModalOpen(false)}>
            Cancel
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to cancel the booking for{" "}
          <b>{recordToCancel?.guest_full_name}</b>?
        </p>
        <p className="text-slate-500 text-xs text-secondary">
          This will release the room and mark the stay as cancelled.
        </p>
      </Modal>

      {/* ADD THE MODAL HERE */}
      <EditRoomModal
        open={isEditRoomOpen}
        onClose={() => {
          setIsEditRoomOpen(false);
          setCurrentRoom(null);
        }}
        current={currentRoom}
        rooms={rooms}
        roomTypes={roomTypes}
        onSuccess={async () => {
          // Since EditRoomModal is outside GenericTable context,
          // you might need a ref to fetchData or trigger a page refresh
          window.location.reload();
        }}
      />

      {/* <-- 4. ADD THE NEW ADD ROOM MODAL HERE */}
      <AddRoomModal
        open={isAddRoomOpen}
        onClose={() => {
          setIsAddRoomOpen(false);
          setTargetBookingId(null);
        }}
        bookingId={targetBookingId}
        rooms={rooms}
        roomTypes={roomTypes}
        onSuccess={async () => {
          // Trigger the generic table's fetch data to update UI immediately
          if (refreshTable) await refreshTable();
        }}
      />
    </>
  );
}
