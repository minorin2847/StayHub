"use client";
import Header from "@/components/dashboard/DashboardHeader";
import SideBar from "@/components/dashboard/DashboardSideBar";
import SidebarUpdater from "@/components/dashboard/DashboardSidebarUpdate";
import { DashboardAuthProvider } from "@/context/DashboardAuthContext"
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashBoardLayout({
  children,
}: {
  children : React.ReactNode
}) {

  return (
    <DashboardAuthProvider>
      <SidebarProvider>
          <SidebarUpdater />
           <div className="min-h-screen bg-gradient-to-br bg-[oklch(1 0 0)] transition-all duration-500">
                <div className="flex h-screen overflow-hidden">
                      <SideBar />
                    <div className="flex-1 flex flex-col coverflow-hidden">
                      <Header />
                      {children}  
                    </div>
                </div>
           </div>
      </SidebarProvider>
    </DashboardAuthProvider>
  )
}