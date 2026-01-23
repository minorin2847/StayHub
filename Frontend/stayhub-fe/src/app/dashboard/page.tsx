'use client';
import { useState, useEffect} from "react";
import Header from './_components/Header.jsx'
import SideBar from './_components/SideBar.jsx'
export default function AdminDashboard() {
    return (
       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
            <div className="flex h-screen overflow-hidden">
                <SideBar />
                <div className="flex-1 flex flex-col overflow-hidden">
                <Header /> 
                </div>
            </div>
       </div>
    );
}