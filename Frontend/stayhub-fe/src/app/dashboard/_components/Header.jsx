'use client';

import React from "react";
import Sidebar from "./SideBar.jsx";
// import {FaBars} from "react-icons/fa";
function Header(){
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
                {/*Left*/}
                <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {/* <FaBars className="w-5 h-5" /> */}
                </button>
                <div className="hidden md:block">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white" >
                        DashBoard
                    </h1>
                    <p></p>
                </div>
            </div>
            {/* Center */}
            <div className="flex-1 max-w-md mx-8">

            </div>
        
        </div>
    );
}
export default Header;