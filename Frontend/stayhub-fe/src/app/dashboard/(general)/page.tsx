"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { Table, Tag, Tabs, Card, Button } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const getStatusColor = (status: string) => {
  if (!status) return "default";
  switch (status) {
    case "Confirmed":
    case "Accepted":
    case "Completed":
      return "green";
    case "Checked In":
      return "blue";
    case "Pending":
      return "gold";
    case "Cancelled":
    case "Rejected":
      return "red";
    default:
      return "default";
  }
};

export default function AdminDashboard() {
  const { user, isLoading } = useDashboardAuth();
  
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reserves, setReserves] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  
  const [loadingData, setLoadingData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = () => {
    setLoadingData(true);
    const fetchOpts = { credentials: "include" as RequestCredentials };
    const base = `${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard`;

    let pending = 11;
    const checkDone = () => {
      pending--;
      if (pending === 0) {
        setLoadingData(false);
        setLastUpdated(new Date());
      }
    };

    fetch(`${base}/roles`, fetchOpts).then(r => r.json()).then(d => setRoles(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/branches`, fetchOpts).then(r => r.json()).then(d => setBranches(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/hotels`, fetchOpts).then(r => r.json()).then(d => setHotels(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/beds`, fetchOpts).then(r => r.json()).then(d => setBeds(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/bookings`, fetchOpts).then(r => r.json()).then(d => setBookings(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/reserves`, fetchOpts).then(r => r.json()).then(d => setReserves(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/guests`, fetchOpts).then(r => r.json()).then(d => setGuests(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/rooms`, fetchOpts).then(r => r.json()).then(d => setRooms(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/user`, fetchOpts).then(r => r.json()).then(d => setUsers(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/services`, fetchOpts).then(r => r.json()).then(d => setServices(d.response || [])).catch(console.error).finally(checkDone);
    fetch(`${base}/rooms/types`, fetchOpts).then(r => r.json()).then(d => setRoomTypes(d.response || [])).catch(console.error).finally(checkDone);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (!isLoading && !user) {
    redirect("/dashboard/login");
  }

  if (isLoading || (loadingData && !lastUpdated)) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-56 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const overviewTabContent = (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              <ProjectOutlined />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Branches</p>
              <h3 className="text-2xl font-bold text-slate-800">{branches.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <BankOutlined />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Hotels Network</p>
              <h3 className="text-2xl font-bold text-slate-800">{hotels.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl">
              <UserOutlined />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Recent Guests</p>
              <h3 className="text-2xl font-bold text-slate-800">{guests.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
              <CalendarOutlined />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Recent Bookings</p>
              <h3 className="text-2xl font-bold text-slate-800">{bookings.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Roles Distribution - Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Organizational Roles</h2>
            <p className="text-sm text-slate-500">Distribution of employee roles across the system</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roles} dataKey="usercount" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                {roles.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Hotels - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Branch Infrastructure</h2>
            <p className="text-sm text-slate-500">Number of operational hotels per branch</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branches}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="hotel_count" name="Hotels" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bookings - Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Bookings</h2>
              <p className="text-sm text-slate-500">Latest confirmed or pending bookings</p>
            </div>
            <Tag color="blue" className="rounded-full px-3 py-1 border-0 bg-blue-50 text-blue-600 font-semibold">Live</Tag>
          </div>
          <Table
            rowKey="id"
            dataSource={bookings}
            pagination={{ pageSize: 5 }}
            size="small"
            className="custom-table"
            columns={[
              { title: "ID", dataIndex: "id", key: "id", render: (val) => <span className="font-semibold text-slate-500">#{val}</span> },
              { title: "Guest", dataIndex: "guest_full_name", key: "guest_full_name", render: (val) => <span className="font-medium text-slate-700">{val}</span> },
              { title: "Total", dataIndex: "actual_total_price", key: "actual_total_price", render: (val) => <span className="font-semibold text-emerald-600">${Number(val || 0).toLocaleString()}</span> },
              { title: "Status", dataIndex: "booking_status", key: "booking_status", render: (val) => <Tag color={getStatusColor(val)} className="border-0 font-medium">{val}</Tag> },
            ]}
          />
        </div>

        {/* Reserves - Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Reserves</h2>
              <p className="text-sm text-slate-500">Latest guest reservations</p>
            </div>
            <Tag color="blue" className="rounded-full px-3 py-1 border-0 bg-blue-50 text-blue-600 font-semibold">Live</Tag>
          </div>
          <Table
            rowKey="id"
            dataSource={reserves}
            pagination={{ pageSize: 5 }}
            size="small"
            className="custom-table"
            columns={[
              { title: "ID", dataIndex: "id", key: "id", render: (val) => <span className="font-semibold text-slate-500">#{val}</span> },
              { title: "Guest", dataIndex: "guest_full_name", key: "guest_full_name", render: (val) => <span className="font-medium text-slate-700">{val}</span> },
              { title: "Price", dataIndex: "total_price", key: "total_price", render: (val) => <span className="font-semibold text-emerald-600">${Number(val || 0).toLocaleString()}</span> },
              { title: "Status", dataIndex: "overall_status", key: "overall_status", render: (val) => <Tag color={getStatusColor(val)} className="border-0 font-medium">{val}</Tag> },
            ]}
          />
        </div>
      </div>
    </div>
  );

  const propertiesTabContent = (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Hotel Rooms - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Hotel Capacities</h2>
            <p className="text-sm text-slate-500">Rooms available per hotel</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hotels}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="room_count" name="Rooms" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Beds Popularity - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px]">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Bed Offerings</h2>
            <p className="text-sm text-slate-500">Popularity of bed types across hotels</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={beds}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="bed_name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="hotel_count" name="Hotels Offering" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Types - Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Room Types Configuration</h2>
            <p className="text-sm text-slate-500">Master list of all configured room types</p>
        </div>
        <Table
          rowKey="id"
          dataSource={roomTypes}
          pagination={{ pageSize: 8 }}
          size="middle"
          columns={[
            { title: "Room Type", dataIndex: "name", key: "name", render: (val) => <span className="font-semibold text-slate-700">{val}</span> },
            { title: "Size", dataIndex: "size", key: "size", render: (val) => `${val} m²` },
            { title: "Capacity", dataIndex: "capacity", key: "capacity" },
            { title: "Total Beds", dataIndex: "total_beds", key: "total_beds" },
            { title: "Base Price", dataIndex: "base_price", key: "base_price", render: (val) => <span className="font-semibold text-emerald-600">${Number(val || 0).toLocaleString()}</span> },
          ]}
        />
      </div>

      {/* Rooms - Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Rooms Database</h2>
          <p className="text-sm text-slate-500">Master list of all physical rooms</p>
        </div>
        <Table
          rowKey="id"
          dataSource={rooms}
          pagination={{ pageSize: 8 }}
          size="middle"
          columns={[
            { title: "Room Number", dataIndex: "name", key: "name", render: (val) => <span className="font-bold text-indigo-600">{val}</span> },
            { title: "Type", dataIndex: "room_type_name", key: "room_type_name", render: (val) => <Tag className="border-0 bg-slate-100">{val}</Tag> },
            { title: "Capacity", dataIndex: "capacity", key: "capacity", render: (val) => <span className="text-slate-500">{val} Persons</span> },
            { title: "Base Price", dataIndex: "base_price", key: "base_price", render: (val) => <span className="font-semibold text-emerald-600">${Number(val || 0).toLocaleString()}</span> },
          ]}
        />
      </div>
    </div>
  );

  const peopleTabContent = (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Employees/Users - Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Staff Directory</h2>
            <p className="text-sm text-slate-500">System user accounts and employees</p>
          </div>
          <Table
            rowKey="id"
            dataSource={users}
            pagination={{ pageSize: 8 }}
            size="middle"
            columns={[
              { title: "Username", dataIndex: "username", key: "username", render: (val) => <span className="font-semibold text-slate-700">{val}</span> },
              { title: "Email", dataIndex: "email", key: "email", render: (val) => <span className="text-slate-500">{val}</span> },
              { title: "Salary", dataIndex: "salary", key: "salary", render: (val) => <span className="font-semibold text-emerald-600">${Number(val || 0).toLocaleString()}</span> },
            ]}
          />
        </div>

        {/* Guests - Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Guest Directory</h2>
            <p className="text-sm text-slate-500">Registered guests and booking history</p>
          </div>
          <Table
            rowKey="id"
            dataSource={guests}
            pagination={{ pageSize: 8 }}
            size="middle"
            columns={[
              { title: "Name", dataIndex: "full_name", key: "full_name", render: (val) => <span className="font-semibold text-slate-700">{val}</span> },
              { title: "Email", dataIndex: "email", key: "email", render: (val) => <span className="text-slate-500">{val}</span> },
              { title: "Total Bookings", dataIndex: "total_bookings", key: "total_bookings", render: (val) => <Tag color="blue" className="border-0 font-medium">{val} Stays</Tag> },
            ]}
          />
        </div>
      </div>

      {/* Services - Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Available Services</h2>
          <p className="text-sm text-slate-500">Services offered across the network</p>
        </div>
        <Table
          rowKey="id"
          dataSource={services}
          pagination={{ pageSize: 8 }}
          size="middle"
          columns={[
            { title: "Service", dataIndex: "name", key: "name", render: (val) => <span className="font-semibold text-slate-700">{val}</span> },
            { title: "Type", dataIndex: "type", key: "type", render: (val) => <Tag className="border-0 bg-slate-100">{val}</Tag> },
            { title: "Price", dataIndex: "price", key: "price", render: (val) => <span className="font-semibold text-emerald-600">${Number(val || 0).toLocaleString()}</span> },
          ]}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            Admin Control Center
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Welcome back, <span className="text-indigo-600 font-semibold">{user?.firstname || user?.username || "Admin"}</span>. Here's what's happening across the StayHub network.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-3">
          
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={fetchData} 
            loading={loadingData}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-full px-5 h-10 font-medium flex items-center"
          >
            Refresh Data
          </Button>
          {lastUpdated && (
            <span className="text-sm text-slate-500 font-medium bg-white px-4 py-2 flex items-center">
              <ClockCircleOutlined className="mr-2 text-indigo-500" /> 
              Updated at {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Tabs
        defaultActiveKey="1"
        size="large"
        className="custom-admin-tabs"
        items={[
          {
            key: '1',
            label: <span className="font-semibold tracking-wide px-2"><DashboardOutlined /> Overview</span>,
            children: overviewTabContent,
          },
          {
            key: '2',
            label: <span className="font-semibold tracking-wide px-2"><BankOutlined /> Properties & Rooms</span>,
            children: propertiesTabContent,
          },
          {
            key: '3',
            label: <span className="font-semibold tracking-wide px-2"><IdcardOutlined /> People & Services</span>,
            children: peopleTabContent,
          },
        ]}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-admin-tabs .ant-tabs-nav::before { border-bottom-color: #e2e8f0; }
        .custom-admin-tabs .ant-tabs-tab { padding-bottom: 16px; margin-right: 32px; }
        .custom-admin-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #4f46e5 !important; }
        .custom-admin-tabs .ant-tabs-ink-bar { background: #4f46e5; height: 3px; border-radius: 3px; }
        .custom-table .ant-table-thead > tr > th { background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; padding: 12px 16px; }
        .custom-table .ant-table-tbody > tr > td { border-bottom: 1px solid #f1f5f9; padding: 16px; }
      `}} />
    </div>
  );
}
