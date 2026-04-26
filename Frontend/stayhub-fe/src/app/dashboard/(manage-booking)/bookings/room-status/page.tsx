"use client";

import { useMemo, useState } from "react";
import { Button, Input, Select } from "antd";
import {
  LuBedDouble,
  LuBedSingle,
  LuCalendarClock,
  LuList,
  LuListFilter,
  LuPlus,
  LuSearch,
  LuSparkles,
  LuTimerReset,
  LuLayoutGrid,
} from "react-icons/lu";

type RoomStatusKey =
  | "available"
  | "occupied"
  | "checkoutSoon"
  | "checkinSoon"
  | "overdueCheckout"
  | "cleaning";

type HousekeepingState = "clean" | "dirty";
type RoomGroup = "single" | "double";

type MockRoom = {
  id: number;
  code: string;
  floor: string;
  group: RoomGroup;
  roomTypeLabel: string;
  price: number;
  status: RoomStatusKey;
  housekeeping: HousekeepingState;
  guestName?: string;
  note?: string;
};

const ROOM_STATUS_META: Record<
  RoomStatusKey,
  {
    label: string;
    tabClassName: string;
    cardClassName: string;
    buttonClassName: string;
    noteClassName: string;
    primaryAction: string;
  }
> = {
  available: {
    label: "Đang trống",
    tabClassName: "bg-slate-100 text-slate-500",
    cardClassName: "bg-white text-slate-800 border border-slate-200",
    buttonClassName: "bg-[#2459e8] text-white hover:bg-[#1847c6]",
    noteClassName: "bg-slate-100 text-slate-500",
    primaryAction: "Đặt phòng",
  },
  occupied: {
    label: "Đang ở",
    tabClassName: "bg-blue-50 text-[#2459e8]",
    cardClassName:
      "border border-violet-500/30 bg-[linear-gradient(135deg,#a21caf_0%,#7c3aed_48%,#4f46e5_100%)] text-white",
    buttonClassName: "bg-white/20 text-white hover:bg-white/28",
    noteClassName: "bg-[#eefc9c] text-slate-900",
    primaryAction: "Xem chi tiết",
  },
  checkoutSoon: {
    label: "Sắp trả",
    tabClassName: "bg-blue-50 text-[#2459e8]",
    cardClassName:
      "border border-blue-500/30 bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_55%,#1e40af_100%)] text-white",
    buttonClassName: "bg-white/20 text-white hover:bg-white/28",
    noteClassName: "bg-[#d9f99d] text-[#0f172a]",
    primaryAction: "Nhắc trả phòng",
  },
  checkinSoon: {
    label: "Sắp nhận phòng",
    tabClassName: "bg-fuchsia-50 text-fuchsia-600",
    cardClassName:
      "border border-fuchsia-500/30 bg-[linear-gradient(135deg,#c026d3_0%,#9333ea_45%,#6d28d9_100%)] text-white",
    buttonClassName: "bg-white/20 text-white hover:bg-white/28",
    noteClassName: "bg-[#eefc9c] text-slate-900",
    primaryAction: "Chuẩn bị phòng",
  },
  overdueCheckout: {
    label: "Quá giờ trả",
    tabClassName: "bg-blue-50 text-[#2459e8]",
    cardClassName:
      "border border-blue-500/30 bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_55%,#1e40af_100%)] text-white",
    buttonClassName: "bg-white/20 text-white hover:bg-white/28",
    noteClassName: "bg-[#fee2e2] text-[#b91c1c]",
    primaryAction: "Liên hệ khách",
  },
  cleaning: {
    label: "Cần dọn",
    tabClassName: "bg-slate-100 text-slate-700",
    cardClassName: "bg-white text-slate-800 border border-slate-200",
    buttonClassName: "bg-slate-100 text-slate-500 hover:bg-slate-200",
    noteClassName: "bg-[#fee2e2] text-[#ef4444]",
    primaryAction: "Hoàn tất dọn dẹp",
  },
};

const GROUP_META: Record<
  RoomGroup,
  {
    title: string;
    icon: typeof LuBedSingle;
  }
> = {
  single: {
    title: "Phòng đơn",
    icon: LuBedSingle,
  },
  double: {
    title: "Phòng đôi",
    icon: LuBedDouble,
  },
};

const MOCK_ROOMS: MockRoom[] = [
  {
    id: 1,
    code: "HT102",
    floor: "1",
    group: "single",
    roomTypeLabel: "Phòng đơn",
    price: 299000,
    status: "available",
    housekeeping: "clean",
  },
  {
    id: 2,
    code: "HT103",
    floor: "1",
    group: "single",
    roomTypeLabel: "Phòng đơn",
    price: 299000,
    status: "cleaning",
    housekeeping: "dirty",
  },
  {
    id: 3,
    code: "HT201",
    floor: "2",
    group: "single",
    roomTypeLabel: "Phòng đơn",
    price: 299000,
    status: "occupied",
    housekeeping: "clean",
    guestName: "Nguyễn Văn A",
    note: "03 : 12 : 04",
  },
  {
    id: 4,
    code: "HT203",
    floor: "2",
    group: "single",
    roomTypeLabel: "Phòng đơn",
    price: 299000,
    status: "overdueCheckout",
    housekeeping: "clean",
    guestName: "Trần Thị B",
    note: "23 giờ 18 phút / 22 giờ",
  },
  {
    id: 5,
    code: "HT304",
    floor: "3",
    group: "single",
    roomTypeLabel: "Phòng đơn",
    price: 299000,
    status: "available",
    housekeeping: "clean",
  },
  {
    id: 6,
    code: "HT101",
    floor: "1",
    group: "double",
    roomTypeLabel: "Phòng đôi",
    price: 399000,
    status: "checkoutSoon",
    housekeeping: "clean",
    guestName: "Cao Tiến Hải",
    note: "15 giờ 38 phút / 22 giờ",
  },
  {
    id: 7,
    code: "HT105",
    floor: "1",
    group: "double",
    roomTypeLabel: "Phòng đôi",
    price: 399000,
    status: "checkinSoon",
    housekeeping: "clean",
    guestName: "Trần Kiều Duyên",
    note: "03 : 12 : 04",
  },
  {
    id: 8,
    code: "HT304",
    floor: "3",
    group: "double",
    roomTypeLabel: "Phòng đôi",
    price: 399000,
    status: "checkoutSoon",
    housekeeping: "clean",
    guestName: "Lê Văn A",
    note: "15 giờ 38 phút / 22 giờ",
  },
  {
    id: 9,
    code: "HT305",
    floor: "3",
    group: "double",
    roomTypeLabel: "Phòng đôi",
    price: 399000,
    status: "available",
    housekeeping: "clean",
  },
];

const STATUS_ORDER: RoomStatusKey[] = [
  "available",
  "occupied",
  "checkoutSoon",
  "checkinSoon",
  "overdueCheckout",
  "cleaning",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function RoomStatusCard({ room, viewMode }: { room: MockRoom; viewMode: "grid" | "list" }) {
  const statusMeta = ROOM_STATUS_META[room.status];
  const isClean = room.housekeeping === "clean";

  return (
    <article
      className={`rounded-[20px] p-4 shadow-[0_6px_20px_rgba(15,23,42,0.08)] ${statusMeta.cardClassName} ${
        viewMode === "list" ? "flex items-center justify-between gap-5" : "flex h-full flex-col gap-4"
      }`}
    >
      <div className={viewMode === "list" ? "flex min-w-0 flex-1 items-center gap-5" : "space-y-4"}>
        <div className={viewMode === "list" ? "min-w-[120px]" : ""}>
          <div
            className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold ${
              isClean
                ? "bg-white/90 text-emerald-700"
                : "bg-red-50 text-red-500"
            }`}
          >
            {isClean ? "Sạch" : "Chưa dọn"}
          </div>
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[30px] font-extrabold leading-none">{room.code}</h3>
              {room.guestName ? (
                <p className="mt-2 text-sm font-semibold">{room.guestName}</p>
              ) : null}
            </div>
            <button className="text-lg opacity-80 transition hover:opacity-100">
              ⋮
            </button>
          </div>
        </div>

        <div className={viewMode === "list" ? "flex-1" : ""}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{room.roomTypeLabel}</p>
              <p className="text-xs opacity-80">Giá: {formatCurrency(room.price)}đ</p>
            </div>
          </div>

          <p className="mt-2 text-[11px] opacity-75">
            Check-in: 12/03/2026-03-05
          </p>

          {room.note ? (
            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.noteClassName}`}
            >
              {room.status === "checkoutSoon" ? <LuCalendarClock size={14} /> : null}
              {room.status === "occupied" || room.status === "checkinSoon" ? (
                <LuTimerReset size={14} />
              ) : null}
              {room.status === "overdueCheckout" ? <LuListFilter size={14} /> : null}
              <span>{room.note}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className={viewMode === "list" ? "min-w-[180px]" : "mt-auto"}>
        <Button
          block
          size="large"
          className={`!h-[42px] !rounded-[12px] !border-0 !text-sm !font-semibold shadow-none ${statusMeta.buttonClassName}`}
        >
          {statusMeta.primaryAction}
        </Button>
      </div>
    </article>
  );
}

export default function BookingRoomStatusPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string | undefined>();
  const [selectedRoomType, setSelectedRoomType] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<RoomStatusKey | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.filter((room) => {
      const matchesKeyword =
        keyword.trim().length === 0 ||
        room.code.toLowerCase().includes(keyword.trim().toLowerCase()) ||
        (room.guestName ?? "").toLowerCase().includes(keyword.trim().toLowerCase());
      const matchesFloor = !selectedFloor || room.floor === selectedFloor;
      const matchesRoomType = !selectedRoomType || room.group === selectedRoomType;
      const matchesStatus = selectedStatus === "all" || room.status === selectedStatus;

      return matchesKeyword && matchesFloor && matchesRoomType && matchesStatus;
    });
  }, [keyword, selectedFloor, selectedRoomType, selectedStatus]);

  const groupedRooms = useMemo(() => {
    return (["single", "double"] as RoomGroup[]).map((groupKey) => ({
      key: groupKey,
      rooms: filteredRooms.filter((room) => room.group === groupKey),
    }));
  }, [filteredRooms]);

  const statusCounts = useMemo(() => {
    return STATUS_ORDER.reduce<Record<RoomStatusKey, number>>((acc, statusKey) => {
      acc[statusKey] = MOCK_ROOMS.filter((room) => room.status === statusKey).length;
      return acc;
    }, {} as Record<RoomStatusKey, number>);
  }, []);

  return (
    <section className="min-h-full bg-[#f3f4f6] p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-[34px] font-extrabold leading-tight text-slate-900">
              Xem tình trạng phòng
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Quản lý tình trạng toàn bộ phòng
            </p>
          </div>

          <Button
            size="large"
            className="!h-[44px] !rounded-[12px] !border-0 !bg-emerald-500 !px-5 !text-sm !font-semibold !text-white hover:!bg-emerald-600"
            icon={<LuPlus size={18} />}
          >
            Thêm đặt phòng mới
          </Button>
        </div>

        <div className="rounded-[18px] bg-white p-4 shadow-[0_8px_26px_rgba(15,23,42,0.06)]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_140px_160px]">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<LuSearch className="text-slate-400" size={16} />}
              placeholder="Tìm kiếm theo mã phòng, khách..."
              className="!rounded-[12px] !border-slate-200 !py-2"
            />

            <Select
              allowClear
              value={selectedRoomType}
              onChange={setSelectedRoomType}
              placeholder="Loại phòng"
              className="w-full"
              options={[
                { label: "Phòng đơn", value: "single" },
                { label: "Phòng đôi", value: "double" },
              ]}
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
                Tất cả ({MOCK_ROOMS.length})
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

          {groupedRooms.map(({ key, rooms }) => {
            if (rooms.length === 0) {
              return null;
            }

            const groupMeta = GROUP_META[key];
            const GroupIcon = groupMeta.icon;

            return (
              <div
                key={key}
                className="rounded-[18px] bg-[#f6f7fb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
                <div className="mb-4 flex items-center gap-2 text-slate-800">
                  <GroupIcon size={18} />
                  <h2 className="text-lg font-extrabold">
                    {groupMeta.title} ({rooms.length} phòng)
                  </h2>
                </div>

                <div
                  className={
                    viewMode === "grid"
                      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                      : "space-y-4"
                  }
                >
                  {rooms.map((room) => (
                    <RoomStatusCard key={room.id} room={room} viewMode={viewMode} />
                  ))}
                </div>
              </div>
            );
          })}

          {filteredRooms.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <LuSparkles size={22} />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-700">
                Không có phòng phù hợp
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Thử đổi bộ lọc hoặc tìm theo mã phòng khác.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
