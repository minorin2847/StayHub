"use client";

import { useEffect, useMemo, useState } from "react";
import { Input, Select, Spin, message } from "antd";
import { LuBedSingle, LuLayoutGrid, LuList, LuSearch, LuSparkles } from "react-icons/lu";

type RoomStatusKey = "available" | "hold" | "occupied";

type LiveRoomStatus = {
  id: number;
  name: string;
  typeid: number;
  room_type_name: string;
  capacity: number;
  size: number;
  base_price: number;
  room_status: RoomStatusKey;
  guest_full_name?: string | null;
  checkin_date?: string | null;
  checkout_date?: string | null;
  booking_id?: number | null;
  hold_booking_id?: number | null;
  hold_reserve_id?: number | null;
  source_status?: string | null;
  source_type?: "booking" | "reserve" | null;
};

const ROOM_STATUS_META: Record<
  RoomStatusKey,
  {
    label: string;
    tabClassName: string;
    cardClassName: string;
    badgeClassName: string;
    mutedTextClassName: string;
  }
> = {
  available: {
    label: "Đang trống",
    tabClassName: "bg-slate-100 text-slate-600",
    cardClassName: "border border-slate-200 bg-white text-slate-800",
    badgeClassName: "bg-emerald-50 text-emerald-700",
    mutedTextClassName: "text-slate-500",
  },
  hold: {
    label: "Đang giữ",
    tabClassName: "bg-amber-50 text-amber-700",
    cardClassName: "border border-amber-200 bg-amber-50/70 text-slate-800",
    badgeClassName: "bg-amber-100 text-amber-700",
    mutedTextClassName: "text-amber-800",
  },
  occupied: {
    label: "Đang ở",
    tabClassName: "bg-blue-50 text-[#2459e8]",
    cardClassName:
      "border border-blue-500/20 bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_55%,#1e40af_100%)] text-white",
    badgeClassName: "bg-white/90 text-blue-700",
    mutedTextClassName: "text-blue-100",
  },
};

const STATUS_ORDER: RoomStatusKey[] = ["available", "hold", "occupied"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("vi-VN");
}

function RoomStatusCard({
  room,
  viewMode,
}: {
  room: LiveRoomStatus;
  viewMode: "grid" | "list";
}) {
  const statusMeta = ROOM_STATUS_META[room.room_status];

  return (
    <article
      className={`rounded-[20px] p-4 shadow-[0_6px_20px_rgba(15,23,42,0.08)] ${statusMeta.cardClassName} ${
        viewMode === "list" ? "flex items-center justify-between gap-5" : "flex h-full flex-col gap-4"
      }`}
    >
      <div className={viewMode === "list" ? "flex min-w-0 flex-1 items-center gap-5" : "space-y-4"}>
        <div className={viewMode === "list" ? "min-w-[150px]" : ""}>
          <div className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold ${statusMeta.badgeClassName}`}>
            {ROOM_STATUS_META[room.room_status].label}
          </div>
          <div className="mt-4">
            <h3 className="text-[30px] font-extrabold leading-none">{room.name}</h3>
            {room.guest_full_name ? (
              <p className="mt-2 text-sm font-semibold">{room.guest_full_name}</p>
            ) : (
              <p className={`mt-2 text-sm ${statusMeta.mutedTextClassName}`}>Chưa có khách đang gắn với phòng này</p>
            )}
          </div>
        </div>

        <div className={viewMode === "list" ? "flex-1" : ""}>
          <p className="text-sm font-semibold">{room.room_type_name}</p>
          <p className={`text-xs ${statusMeta.mutedTextClassName}`}>
            Giá: {formatCurrency(room.base_price)}đ · {room.capacity} khách · {room.size}m²
          </p>

          {room.checkin_date || room.checkout_date ? (
            <p className={`mt-2 text-[12px] ${statusMeta.mutedTextClassName}`}>
              {formatDate(room.checkin_date)} - {formatDate(room.checkout_date)}
            </p>
          ) : null}

          {room.source_status ? (
            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                room.room_status === "occupied" ? "bg-white/15 text-white" : "bg-white text-slate-600"
              }`}
            >
              <span>{room.source_type === "reserve" ? "Reserve" : "Booking"}</span>
              <span>·</span>
              <span>{room.source_status}</span>
            </div>
          ) : null}

          {room.room_status === "hold" ? (
            <p className="mt-3 text-xs text-amber-800">
              {room.hold_reserve_id
                ? `Reserve #${room.hold_reserve_id}`
                : room.hold_booking_id
                  ? `Booking #${room.hold_booking_id}`
                  : "Đang được giữ"}
            </p>
          ) : null}

          {room.room_status === "occupied" && room.booking_id ? (
            <p className="mt-3 text-xs text-blue-100">Booking #{room.booking_id}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function BookingRoomStatusPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [rooms, setRooms] = useState<LiveRoomStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<RoomStatusKey | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const loadRoomStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/bookings/room-status`, {
          credentials: "include",
        });
        const result = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load room status.");
        }

        setRooms(Array.isArray(result) ? result : []);
      } catch (error) {
        setRooms([]);
        messageApi.error(error instanceof Error ? error.message : "Failed to load room status.");
      } finally {
        setLoading(false);
      }
    };

    loadRoomStatus();
  }, [messageApi]);

  const roomTypeOptions = useMemo(() => {
    const map = new Map<number, string>();
    rooms.forEach((room) => {
      if (!map.has(room.typeid)) {
        map.set(room.typeid, room.room_type_name);
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const normalizedKeyword = keyword.trim().toLowerCase();
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        room.name.toLowerCase().includes(normalizedKeyword) ||
        (room.guest_full_name ?? "").toLowerCase().includes(normalizedKeyword);
      const matchesRoomType = selectedRoomType === undefined || room.typeid === selectedRoomType;
      const matchesStatus = selectedStatus === "all" || room.room_status === selectedStatus;

      return matchesKeyword && matchesRoomType && matchesStatus;
    });
  }, [keyword, rooms, selectedRoomType, selectedStatus]);

  const groupedRooms = useMemo(() => {
    const groups = new Map<string, LiveRoomStatus[]>();

    filteredRooms.forEach((room) => {
      const currentGroup = groups.get(room.room_type_name) ?? [];
      currentGroup.push(room);
      groups.set(room.room_type_name, currentGroup);
    });

    return Array.from(groups.entries()).map(([roomTypeName, groupRooms]) => ({
      roomTypeName,
      rooms: groupRooms,
    }));
  }, [filteredRooms]);

  const statusCounts = useMemo(() => {
    return STATUS_ORDER.reduce<Record<RoomStatusKey, number>>((acc, statusKey) => {
      acc[statusKey] = rooms.filter((room) => room.room_status === statusKey).length;
      return acc;
    }, {} as Record<RoomStatusKey, number>);
  }, [rooms]);

  return (
    <section className="min-h-full bg-[#f3f4f6] p-6">
      {contextHolder}
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div>
          <h1 className="text-[34px] font-extrabold leading-tight text-slate-900">
            Xem tình trạng phòng
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Chỉ hiển thị phòng thật đã được tạo trong quản lý phòng và trạng thái đang dùng từ booking/reserve.
          </p>
        </div>

        <div className="rounded-[18px] bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.06)]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_220px]">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<LuSearch className="text-slate-400" size={16} />}
              placeholder="Tìm kiếm theo mã phòng hoặc tên khách..."
              className="!rounded-[12px] !border-slate-200 !py-2"
            />

            <Select
              allowClear
              value={selectedRoomType}
              onChange={setSelectedRoomType}
              placeholder="Loại phòng"
              className="w-full"
              options={roomTypeOptions}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[18px] bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedStatus === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                Tất cả ({rooms.length})
              </button>

              {STATUS_ORDER.map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedStatus === statusKey
                      ? "bg-slate-900 text-white"
                      : ROOM_STATUS_META[statusKey].tabClassName
                  }`}
                >
                  {ROOM_STATUS_META[statusKey].label} ({statusCounts[statusKey]})
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 self-end rounded-[14px] bg-slate-100 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-10 w-10 items-center justify-center rounded-[10px] transition ${
                  viewMode === "list"
                    ? "bg-white text-[#2459e8] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LuList size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-10 w-10 items-center justify-center rounded-[10px] transition ${
                  viewMode === "grid"
                    ? "bg-white text-[#2459e8] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LuLayoutGrid size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-[18px] bg-slate-50">
              <Spin size="large" />
            </div>
          ) : null}

          {!loading &&
            groupedRooms.map(({ roomTypeName, rooms: groupRooms }) => (
              <div
                key={roomTypeName}
                className="rounded-[18px] bg-[#f6f7fb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
                <div className="mb-4 flex items-center gap-2 text-slate-800">
                  <LuBedSingle size={18} />
                  <h2 className="text-lg font-extrabold">
                    {roomTypeName} ({groupRooms.length} phòng)
                  </h2>
                </div>

                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                      : "space-y-4"
                  }
                >
                  {groupRooms.map((room) => (
                    <RoomStatusCard key={room.id} room={room} viewMode={viewMode} />
                  ))}
                </div>
              </div>
            ))}

          {!loading && filteredRooms.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <LuSparkles size={22} />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-700">
                Không có phòng phù hợp
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Thử đổi bộ lọc hoặc kiểm tra lại dữ liệu phòng đã tạo.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
