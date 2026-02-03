'use client';
import Image from "next/image";
import React from "react";
import Sidebar from "./DashboardSideBar.js";
import { FaBars } from "react-icons/fa";
export default function Header() {
    return (
        <div className="relative flex bg-white/80 px-5 py-3 my-0.5 border-b border-grey-300/20 items-center">
            {/*Center - Search bar*/}
            <div className="flex-1 flex items-center justify-start">
                <form className="w-4/5">   
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">
                            <svg className="w-6 h-6 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 26 26"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
                        </div>
                        <input type="search" id="search" className="block w-full p-3 ps-9 bg-neutral-secondary-medium text-heading text-base font-medium rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" placeholder="Search" required />
                    <button type="button" className="absolute end-1.5 bottom-1 text-white bg-brand hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-bold leading-5 rounded text-base px-3 py-1.5 focus:outline-none">Search</button>
                    </div>
                </form>
            </div>
            <div className="absolute flex items-center justify-left right-0">
                {/*Right*/}
                <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-2">
                    <FaBars className="w-7 h-7" />
                </button >
            </div> 
        </div>
    );
}