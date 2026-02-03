'use client';
import { useState, useEffect} from "react";
import Header from './_components/Header.jsx'
import SideBar from './_components/SideBar.jsx'
import { Employee } from "@/types/Employee.js";
import { redirect } from "next/navigation.js";
export default function AdminDashboard() {
    const [user, setUser] = useState<Employee>();
    
    useEffect(() => {
        const init = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`, {
                method: "GET",
                credentials: "include"
            });
            if (response.status===401) {
                redirect("/dashboard/login")
            } else {
                const data = await response.json();
                setUser(data);
            }
        }

        init()
    }, [])
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