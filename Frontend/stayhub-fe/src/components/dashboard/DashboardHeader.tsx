'use client';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import React from 'react';
import { IoSearchOutline, IoNotificationsOutline, IoSettingsOutline } from 'react-icons/io5';
import { LuChevronDown } from 'react-icons/lu';

export default function Header() {
    const { user } = useDashboardAuth()

    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
            <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            </div>

            <div className="flex-1 max-w-md mx-8">
                <div className="relative group">
                    <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search room, guest, book, etc" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors relative">
                        <IoNotificationsOutline size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>
                </div>

                <div className="h-8 w-[1px] bg-slate-200" />

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-none mb-1">{(user?.firstname ?? "") + " " + (user?.lastname ?? "")}</p>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{user?.roles.sort((a, b) => b.tier - a.tier)[0].role}</p>
                    </div>
                    
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-emerald-100 overflow-hidden bg-emerald-50 flex items-center justify-center">
                            <span className="text-emerald-600 font-bold text-sm">{user?.lastname ? user?.firstname[0].toUpperCase() + user?.lastname[0].toUpperCase() : user?.firstname.slice(0, 2).toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <LuChevronDown className="text-slate-400 group-hover:text-slate-600 transition-colors" size={16} />
                </div>
            </div>
        </header>
    );
}