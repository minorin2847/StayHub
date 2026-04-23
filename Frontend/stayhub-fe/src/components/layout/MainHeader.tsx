'use client';
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BiSupport } from "react-icons/bi";
import { FcGlobe } from "react-icons/fc";
import { LuChevronDown, LuLogOut, LuSearch, LuUser } from "react-icons/lu";

export default function MainHeader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [languages] = useState([
        { abbr: "en", name: "English" },
        { abbr: "vi", name: "Tiếng Việt" },
        { abbr: "jp", name: "日本語" }
    ]);
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout().then(() => window.location.reload());
    };

    const isHotelsPage = pathname === "/hotels";

    // Format display string
    const locParam = searchParams.get("location") || "Anywhere";
    const checkinParam = searchParams.get("checkin");
    const checkoutParam = searchParams.get("checkout");
    const datesStr = checkinParam && checkoutParam
        ? `${new Date(checkinParam).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(checkoutParam).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
        : "Add Dates";
    const adults = parseInt(searchParams.get("adults") || "0", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const guests = adults + children;
    const guestsStr = guests > 0 ? `${guests} Guests` : "Add Guests";

    return (
        <header className="w-full h-20 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 lg:px-24 flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 flex items-center justify-center transition-transform">
                         <Image src="/images/logo.png" alt="Stayhub" width={32} height={32} className="brightness-0 invert" />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">StayHub</span>
                </Link>
            </div>

            {isHotelsPage && (
                <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow py-1 px-2 cursor-pointer gap-2 absolute left-1/2 -translate-x-1/2">
                    <div className="px-4 text-sm font-semibold text-slate-800 border-r border-slate-200 truncate max-w-[150px]">
                        {locParam}
                    </div>
                    <div className="px-4 text-sm font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                        {datesStr}
                    </div>
                    <div className="px-4 text-sm font-semibold text-slate-600 whitespace-nowrap">
                        {guestsStr}
                    </div>
                    <button className="flex items-center justify-center bg-[#0051cb] hover:bg-blue-700 text-white w-9 h-9 rounded-full transition-colors">
                        <LuSearch size={18} />
                    </button>
                </div>
            )}

            <div className="flex flex-1 items-center justify-end gap-4 lg:gap-8">
                <div className="relative group py-2">
                    <button className="flex items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors">
                        <FcGlobe size={24} />
                        <LuChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                    
                    <ul className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full right-0 w-40 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 mt-1 transition-all duration-200 transform origin-top-right">
                        {languages.map(lang => (
                            <li key={lang.abbr} className="px-4 py-2 hover:bg-emerald-50 text-sm font-medium text-slate-600 hover:text-emerald-700 cursor-pointer transition-colors">
                                {lang.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <Link href="/support" className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
                    <BiSupport size={24} />
                </Link>

                {isAuthenticated ? (
                    <div className="relative group py-2">
                        <button className="flex items-center gap-3 p-1 pr-3 bg-slate-50 border border-slate-100 rounded-full hover:border-blue-500 transition-all">
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
                        <button className="bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gr shadow-md shadow-blue-200 transition-all active:scale-95">
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </header>
    );
}