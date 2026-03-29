"use client";

import Header from "@/components/dashboard/DashboardHeader"
import SideBar from "@/components/dashboard/DashboardSideBar"
import HotelChainList from "@/components/dashboard/HotelChainList";
import { DashboardAuthProvider } from "@/context/DashboardAuthContext"

export default function DashBoardLayout({
  children,
}: {
  children : React.ReactNode
}) {
  return (
    <DashboardAuthProvider>
       <div className="min-h-screen bg-gradient-to-br bg-[oklch(1 0 0)] transition-all duration-500">
            <div className="flex h-screen overflow-hidden">
                <SideBar />
                <div className="flex-1 flex flex-col coverflow-hidden">
                <Header />
                <HotelChainList />
                {children}  
                </div>
            </div>
       </div>
    </DashboardAuthProvider>
  )
}