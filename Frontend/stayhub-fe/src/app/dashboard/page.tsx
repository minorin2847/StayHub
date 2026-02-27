'use client';
import { useState, useEffect} from "react";
import Header from '../../components/dashboard/DashboardHeader.js'
import SideBar from '../../components/dashboard/DashboardSideBar.js'
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
        <></>
    );
}