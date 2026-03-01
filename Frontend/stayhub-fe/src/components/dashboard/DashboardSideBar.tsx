'use client';
import React, { useState } from "react";
import Image from "next/image";
import { 
  FaHome, FaUsers, FaRestroom, 
  FaFirstOrderAlt, FaComments, FaCog 
} from "react-icons/fa";
import { MdExitToApp, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { useRouter } from "next/navigation";

const menuItems = [
  { name: "Dashboard", icon: FaHome, path: "/dashboard" },
  { name: "Users", icon: FaUsers, path: "/users" },
  { name: "Rooms", icon: FaRestroom, path: "/rooms" },
  { name: "Bookings", icon: FaFirstOrderAlt, path: "/bookings" },
  { name: "Reviews", icon: FaComments, path: "/reviews" },
];

export default function SideBar() {
  const [expanded, setExpanded] = useState(true);
  const { logout } = useDashboardAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/dashboard/login");
  };

  return (
    <aside 
      className={`relative h-screen flex flex-col transition-all duration-300 border-r border-slate-200 bg-white ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Nút Thu gọn/Mở rộng */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="absolute -right-3 top-10 bg-white border border-slate-200 rounded-full p-1 text-slate-500 hover:text-emerald-500 shadow-sm z-50"
      >
        {expanded ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
      </button>

      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 overflow-hidden">
        <div className="flex-shrink-0">
          <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
        </div>
        {expanded && (
          <h1 className="text-xl font-bold text-slate-800 whitespace-nowrap">StayHub</h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button className="flex items-center w-full p-3 rounded-xl transition-all group hover:bg-emerald-50 text-slate-500 hover:text-emerald-600">
                <item.icon size={22} className="flex-shrink-0" />
                {expanded && (
                  <span className="ml-4 text-sm font-semibold whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section (Settings & Logout) */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button className="flex items-center w-full p-3 rounded-xl transition-all text-slate-500 hover:bg-slate-50">
          <FaCog size={22} className="flex-shrink-0" />
          {expanded && <span className="ml-4 text-sm font-semibold">Settings</span>}
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-xl transition-all text-red-500 hover:bg-red-50"
        >
          <MdExitToApp size={22} className="flex-shrink-0" />
          {expanded && <span className="ml-4 text-sm font-semibold">Log out</span>}
        </button>
      </div>
    </aside>
  );
} 