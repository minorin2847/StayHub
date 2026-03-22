"use client";
import { MenuItem } from "@/components/dashboard/DashboardSideBar";
import { createContext, useContext, useState, ReactNode } from "react";

type SidebarConfig = {
    items: MenuItem[]
};

const SidebarContext = createContext<{
  config: SidebarConfig;
  setConfig: (config: SidebarConfig) => void;
} | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SidebarConfig>({ items: [] });
  return (
    <SidebarContext.Provider value={{ config, setConfig }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};