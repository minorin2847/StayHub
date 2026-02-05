import React from "react";
import {useState} from "react";
import Image from "next/image";
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
  FaReact,
  FaHome,
} from "react-icons/fa";
import { MdExitToApp } from "react-icons/md";
import { auth } from "@/services/auth";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";
export default function SideBar(){
    const [expanded, setExpanded] = useState(true);
    const { logout } = useDashboardAuth();

    return <aside className={'relative w-1/5 flex flex-col transition-width ease-in-out backdrop-blur-xl border-r border-slate-200/50 bg-slate-900/95 dark:border-slate-700/50" + $(expanded ? "w-full" : "w-30")'}>
        <div className="p-6 w-full">
            <div className="flex items-center justify-start space-x-4">
                <div className="w-13 h-13 flex items-center">
                    <Image src="/images/logo.png" alt="" width={50} height={50} />
                </div>
                <div> 
                    <h1 className="text-xl font-bold text-white">StayHub</h1>
                </div>
            </div>
        </div>
        <div className="w-full top-0 text-4xl text-white
        flex items-center justify-center">
            <nav className="flex-1 p-x-4 space-x-2">
                <ul className="space-y-1 items-center">
                    <button className ="flex items-center p-3 w-full hover:bg-slate-100/20 rounded-lg transition-colors">
                        <FaHome className="w-6 h-6"/>
                        <span className="ml-4 text-base font-medium">DashBoard</span>
                    </button>
                    <button className ="flex items-center p-3 w-full hover:bg-slate-100/20 rounded-lg transition-colors">
                        <FaUsers className="w-6 h-6"/>
                        <span className="ml-4 text-base font-medium">Users</span>
                    </button>
                    <button className ="flex items-center p-3 w-full hover:bg-slate-100/20 rounded-lg transition-colors">
                        <FaRestroom className="w-6 h-6"/>
                        <span className="ml-4 text-base font-medium">Rooms</span>
                    </button>
                    <button className ="flex items-center p-3 w-full hover:bg-slate-100/20 rounded-lg transition-colors">
                        <FaFirstOrderAlt className="w-6 h-6"/>
                        <span className="ml-4 text-base font-medium">Bookings</span>
                    </button>
                    <button className ="flex items-center p-3 w-full hover:bg-slate-100/20 rounded-lg transition-colors">
                        <FaComments className="w-6 h-6"/>
                        <span className="ml-4 text-base font-medium">Reviews</span>
                    </button>
                    <div className="absolute bottom-0 text-4xl text-white mb-1 w-full flex flex-col items-center">
                        <button className ="flex items-center p-3 mb-1 w-full hover:bg-slate-100/20 round-lg transition-colors">
                            <FaCog className="w-6 h-6"/>
                            <span className="ml-4 text-base font-medium">Settings</span>
                         </button>
                        <button onClick={() => logout().then(redirect("/dashboard/login"))} className ="flex items-center p-3 mb-1 w-full hover:bg-slate-100/20 round-lg transition-colors cursor-pointer">
                            <MdExitToApp className="w-6 h-6"/>
                            <span className="ml-4 text-base font-medium">Log out</span>
                         </button>
                    </div>
                </ul>
            </nav>
        </div>
        
    </aside>;
}