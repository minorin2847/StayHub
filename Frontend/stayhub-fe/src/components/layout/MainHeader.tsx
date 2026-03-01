'use client';
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BiSupport } from "react-icons/bi";
import { FcGlobe } from "react-icons/fc";
import { LuChevronDown, LuLogOut, LuUser } from "react-icons/lu";

export default function MainHeader() {
    const [languages] = useState([
        { abbr: "en", name: "English" },
        { abbr: "vi", name: "Tiếng Việt" },
        { abbr: "jp", name: "日本語" }
    ]);
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout().then(() => window.location.reload());
    };

    return (
        <header className="w-full h-20 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 lg:px-24 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                    <Image
                        className=""
                        src="/images/logo.png"
                        alt="Stayhub logo"
                        width={60}
                        height={60}
                    />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">StayHub</span>
                </Link>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-4 lg:gap-8">
                {/* Language Switcher */}
                <div className="relative group py-2">
                    <button className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors">
                        <FcGlobe size={24} />
                        <LuChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <ul className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full right-0 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 mt-1 transition-all duration-200 transform origin-top-right">
                        {languages.map(lang => (
                            <li key={lang.abbr} className="px-4 py-2 hover:bg-emerald-50 text-sm font-medium text-slate-600 hover:text-emerald-700 cursor-pointer transition-colors">
                                {lang.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support Link */}
                <Link href="/support" className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
                    <BiSupport size={24} />
                </Link>

                {/* User Section */}
                {isAuthenticated ? (
                    <div className="relative group py-2">
                        <button className="flex items-center gap-3 p-1 pr-3 bg-slate-50 border border-slate-100 rounded-full hover:border-emerald-200 transition-all">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                                <Image 
                                    unoptimized 
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstname}+${user?.lastname}&rounded=true&background=random`} 
                                    alt="Avatar" 
                                    width={32} 
                                    height={32} 
                                />
                            </div>
                            <LuChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 mt-1 transition-all duration-200">
                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                <p className="text-sm font-bold text-slate-800">{user?.firstname} {user?.lastname}</p>
                                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                            </div>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                <LuUser size={16} /> Hồ sơ của tôi
                            </button>
                            <button 
                                onClick={handleLogout} 
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LuLogOut size={16} /> Đăng xuất
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link href="/login">
                        <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all active:scale-95">
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
}