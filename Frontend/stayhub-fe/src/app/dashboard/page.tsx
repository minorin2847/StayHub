'use client';
import { useState, useEffect} from "react";
import Header from './_components/Header.jsx'
import SideBar from './_components/SideBar.jsx'
export default function AdminDashboard() {
    return (
       <div className="min-h-screen bg-gradient-to-br bg-[oklch(1 0 0)] transition-all duration-500">
            <div className="flex h-screen overflow-hidden">
                <SideBar />
                <div className="flex-1 flex flex-col coverflow-hidden">
                <Header />  
                </div>
            </div>
       </div>
    );
}