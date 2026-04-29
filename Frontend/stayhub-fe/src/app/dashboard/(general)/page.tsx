"use client";

import { redirect } from "next/navigation";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import {
  BankOutlined,
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Progress, Table, Tag } from "antd";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const summaryCards = [
  {
    title: "Hotels",
    value: "4",
    subtitle: "Across all branches",
    icon: <BankOutlined />,
    className: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Rooms",
    value: "128",
    subtitle: "Total active rooms",
    icon: <HomeOutlined />,
    className: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Guests",
    value: "846",
    subtitle: "Registered guests",
    icon: <UserOutlined />,
    className: "bg-sky-50 text-sky-600",
  },
  {
    title: "Bookings",
    value: "76",
    subtitle: "This month",
    icon: <CalendarOutlined />,
    className: "bg-violet-50 text-violet-600",
  },
  {
    title: "Revenue",
    value: "$42,850",
    subtitle: "This month",
    icon: <DollarOutlined />,
    className: "bg-green-50 text-green-600",
  },
  {
    title: "Pending",
    value: "12",
    subtitle: "Need review",
    icon: <WarningOutlined />,
    className: "bg-amber-50 text-amber-600",
  },
];

const reservationData = [
  { month: "Jan", reservations: 32, bookings: 24 },
  { month: "Feb", reservations: 41, bookings: 31 },
  { month: "Mar", reservations: 52, bookings: 40 },
  { month: "Apr", reservations: 48, bookings: 37 },
  { month: "May", reservations: 66, bookings: 51 },
  { month: "Jun", reservations: 73, bookings: 59 },
  { month: "Jul", reservations: 81, bookings: 64 },
];

const revenueData = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22600 },
  { month: "Mar", revenue: 27800 },
  { month: "Apr", revenue: 25100 },
  { month: "May", revenue: 34600 },
  { month: "Jun", revenue: 39800 },
  { month: "Jul", revenue: 42850 },
];

const recentBookings = [
  {
    id: 1001,
    guest: "Minh Nguyen",
    room: "Deluxe Room - 101",
    checkin: "2026-04-27",
    checkout: "2026-04-30",
    total: 360,
    status: "Confirmed",
  },
  {
    id: 1002,
    guest: "Sarah Johnson",
    room: "Family Suite - 204",
    checkin: "2026-04-28",
    checkout: "2026-05-02",
    total: 720,
    status: "Pending",
  },
  {
    id: 1003,
    guest: "David Lee",
    room: "Standard Room - 305",
    checkin: "2026-04-26",
    checkout: "2026-04-29",
    total: 210,
    status: "Checked In",
  },
  {
    id: 1004,
    guest: "Anna Tran",
    room: "Presidential Suite - 501",
    checkin: "2026-05-01",
    checkout: "2026-05-04",
    total: 1500,
    status: "Confirmed",
  },
];

const actionItems = [
  {
    title: "Pending Reservations",
    description: "Reservations waiting for confirmation.",
    count: 12,
    icon: <ClockCircleOutlined />,
    className: "bg-amber-50 text-amber-600",
  },
  {
    title: "Unpaid Bookings",
    description: "Bookings that still require payment.",
    count: 7,
    icon: <DollarOutlined />,
    className: "bg-rose-50 text-rose-600",
  },
  {
    title: "Rooms in Maintenance",
    description: "Rooms currently unavailable for guests.",
    count: 5,
    icon: <ToolOutlined />,
    className: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Missing Room Type Images",
    description: "Room types without preview images.",
    count: 3,
    icon: <WarningOutlined />,
    className: "bg-orange-50 text-orange-600",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Confirmed":
      return "green";
    case "Checked In":
      return "blue";
    case "Pending":
      return "gold";
    case "Cancelled":
      return "red";
    default:
      return "default";
  }
};

export default function AdminDashboard() {
  const { user, isLoading } = useDashboardAuth();

  if (!isLoading && !user) {
    redirect("/dashboard/login");
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-56 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-28 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 font-medium">
          Welcome back, {user?.firstname || user?.username || "Admin"}.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-5">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${card.className}`}
            >
              {card.icon}
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium truncate">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {card.value}
              </p>
              <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reservation + occupancy */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              Reservations Overview
            </h2>
            <p className="text-sm text-slate-500">
              Monthly reservations compared with confirmed bookings.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reservations" radius={[8, 8, 0, 0]} />
              <Bar dataKey="bookings" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              Room Occupancy
            </h2>
            <p className="text-sm text-slate-500">
              Current room usage across hotels.
            </p>
          </div>

          <div className="flex justify-center">
            <Progress type="dashboard" percent={68} size={180} strokeWidth={10} />
          </div>

          <p className="text-center text-sm text-slate-500 mt-3">
            87 of 128 rooms occupied
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-2xl p-4 bg-emerald-50 text-emerald-600">
              <p className="text-xs font-medium opacity-80">Available</p>
              <p className="text-2xl font-bold mt-1">36</p>
            </div>
            <div className="rounded-2xl p-4 bg-indigo-50 text-indigo-600">
              <p className="text-xs font-medium opacity-80">Occupied</p>
              <p className="text-2xl font-bold mt-1">87</p>
            </div>
            <div className="rounded-2xl p-4 bg-amber-50 text-amber-600">
              <p className="text-xs font-medium opacity-80">Reserved</p>
              <p className="text-2xl font-bold mt-1">18</p>
            </div>
            <div className="rounded-2xl p-4 bg-rose-50 text-rose-600">
              <p className="text-xs font-medium opacity-80">Maintenance</p>
              <p className="text-2xl font-bold mt-1">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue + action required */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              Revenue Overview
            </h2>
            <p className="text-sm text-slate-500">
              Monthly revenue from completed bookings.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [
                  `$${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Action Required
              </h2>
              <p className="text-sm text-slate-500">
                Important items that need attention.
              </p>
            </div>

            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 text-sm font-semibold">
              <CheckCircleOutlined />
              Live
            </div>
          </div>

          <div className="space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.className}`}
                >
                  {item.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <span className="text-sm font-bold text-slate-700">
                      {item.count}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Recent Bookings</h2>
          <p className="text-sm text-slate-500">
            Latest guest bookings and check-in information.
          </p>
        </div>

        <Table
          rowKey="id"
          dataSource={recentBookings}
          pagination={false}
          size="middle"
          columns={[
            {
              title: "Booking ID",
              dataIndex: "id",
              key: "id",
              render: (value) => (
                <span className="font-semibold text-slate-500">
                  #{value}
                </span>
              ),
            },
            {
              title: "Guest",
              dataIndex: "guest",
              key: "guest",
              render: (value) => (
                <span className="font-semibold text-slate-700">
                  {value}
                </span>
              ),
            },
            {
              title: "Room",
              dataIndex: "room",
              key: "room",
            },
            {
              title: "Check-in",
              dataIndex: "checkin",
              key: "checkin",
            },
            {
              title: "Check-out",
              dataIndex: "checkout",
              key: "checkout",
            },
            {
              title: "Total",
              dataIndex: "total",
              key: "total",
              render: (value) => (
                <span className="font-semibold text-emerald-600">
                  ${Number(value).toLocaleString()}
                </span>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (value) => (
                <Tag color={getStatusColor(value)}>{value}</Tag>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}