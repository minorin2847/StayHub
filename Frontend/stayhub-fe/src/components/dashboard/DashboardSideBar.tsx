"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  FaHome,
  FaUsers,
  FaRestroom,
  FaFirstOrderAlt,
  FaComments,
  FaCog,
  FaHotel,
} from "react-icons/fa";
import { MdExitToApp, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { useRouter, usePathname } from "next/navigation";
import SideBarItem from "./SideBarItem";
import { useSidebar } from "@/context/SidebarContext";

export interface SubItem {
  name: string;
  path: string;
  role?: string[];
}

export interface MenuItem {
  name: string;
  icon: React.ElementType;
  path: string;
  subItems?: SubItem[];
  roles?: string[]; 
}



export default function SideBar() {
  const [expanded, setExpanded] = useState(true);
  const { user, logout } = useDashboardAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useSidebar().config;

  // Handle both user.roles (array) and user.role (string) gracefully
  const userAny = user as any;
  const rawRoles = userAny?.roles
    ? Array.isArray(userAny.roles)
      ? userAny.roles
      : [userAny.roles]
    : userAny?.role
      ? [userAny.role]
      : [];
  const userRoleNames = rawRoles.map((r: any) => {
    const roleStr = typeof r === "string" ? r : r.name || r.role || "";
    return roleStr.toUpperCase();
  });

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
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>
        {expanded && (
          <h1 className="text-xl font-bold text-slate-800 whitespace-nowrap">
            StayHub
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 overflow-y-auto overflow-x-hidden no-scrollbar">
        <ul className="space-y-2">
          {items
            .filter((item) => {
              if (!item.roles || item.roles.length === 0) return true;
              return item.roles.some((role) => userRoleNames.includes(role));
            })
            .map((item) => (
              <SideBarItem
                key={item.name}
                label={item.name}
                icon={item.icon}
                isSidebarExpanded={expanded}
                isActive={
                  pathname === item.path ||
                  item.subItems?.some((s) => pathname === s.path)
                }
                onClick={() => {
                  if (!item.subItems) {
                    router.push(item.path);
                  }
                }}
              >
                {item.subItems &&
                  item.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <button
                        onClick={() => router.push(subItem.path)}
                        className={`flex items-center w-full py-2 px-3 text-sm rounded-lg transition-colors ${
                          pathname === subItem.path
                            ? "bg-emerald-100 text-emerald-700 font-semibold"
                            : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                      >
                        {subItem.name}
                      </button>
                    </li>
                  ))}
              </SideBarItem>
            ))}
        </ul>
      </nav>

      {/* Footer Section (Settings & Logout) */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button className="flex items-center w-full p-3 rounded-xl transition-all text-slate-500 hover:bg-slate-50">
          <FaCog size={22} className="flex-shrink-0" />
          {expanded && (
            <span className="ml-4 text-sm font-semibold">Settings</span>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-xl transition-all text-red-500 hover:bg-red-50"
        >
          <MdExitToApp size={22} className="flex-shrink-0" />
          {expanded && (
            <span className="ml-4 text-sm font-semibold">Log out</span>
          )}
        </button>
      </div>
    </aside>
  );
}
