import React from "react";
import {
  FaChartLine,
  FaUsers,
  FaUser,
  FaCog,
  FaRestroom,
  FaRegQuestionCircle,
  FaBookMedical,
  FaFirstOrderAlt,
  FaComments,
} from "react-icons/fa";
function SideBar(){
    return <div className="transition duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-vur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10">
        {/*"logo đay nhé"*/}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-300 to-purple-4    00 rounded-xl flex items-center justify-center shadow-lg">
                    <FaUser className="w-6 h-6 text-white" />
                </div>
                {/* add*/}
                <div> 
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                        Stayhub
                    </h1>
                    <p className = "text-xs text-slate-500 dark:text-slate-400">
                        Admin Panel
                    </p>
                </div>
                {/* Navigation*/}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto"></nav>
                {/*User profile*/}
                <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <img 
                        alt="user"
                        className="w-10 h-10 rounded-full ring-2 ring-blue-500" 
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                    Someone is here
                                </p>
                                <p className = "text-xs text-slate-500 dark:text-slate-400 truncate">
                                    Admin
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
}
export default SideBar;