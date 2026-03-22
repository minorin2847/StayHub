"use client";
import Header from "@/components/dashboard/DashboardHeader";
import SideBar, { MenuItem } from "@/components/dashboard/DashboardSideBar";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { useSidebar } from "@/context/SidebarContext";
import getEmployeeSession from "@/utils/GetEmployeeSession";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import {
  FaCog,
  FaComments,
  FaFirstOrderAlt,
  FaHome,
  FaHotel,
  FaRestroom,
  FaUsers,
} from "react-icons/fa";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useDashboardAuth();
  if (
    !user ||
    !user.roles.some((i) => i.role == "ADMINISTRATOR")
  ) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
