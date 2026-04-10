"use client";
import { useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { MENU_CONFIG } from "@/config/EmployeeSidebarMenu";

export default function SidebarUpdater() {
  const { setConfig } = useSidebar();
  const { user } = useDashboardAuth();

  useEffect(() => {
    if (!user) return;

    // Logic to determine which menu to show
    if (user.roles.some((r) => r.name === "ADMINISTRATOR")) {
      setConfig({ items: MENU_CONFIG.ADMINISTRATOR });
    } else if (user.roles.some((r) => r.name === "MANAGE_BRANCH")) {
      setConfig({ items: MENU_CONFIG.MANAGE_BRANCH });
    } else if (user.roles.some((r) => r.name === "MANAGE_HOTEL")) {
      setConfig({ items: MENU_CONFIG.MANAGE_HOTEL });
    } else {
      //setConfig({ items: MENU_CONFIG.DEFAULT });
    }
  }, [user, setConfig]);

  return null; // This component renders nothing
}
