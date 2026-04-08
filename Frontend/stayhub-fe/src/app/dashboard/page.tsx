'use client';
import { useState, useEffect} from "react";
import { Employee } from "@/types/Employee.js";
import { redirect } from "next/navigation.js";
import ReservationChart from '@/components/dashboard/ReservationChart';
export default function AdminDashboard() {
    const [user, setUser] = useState<Employee>();
    
    // useEffect(() => {
    //     const init = async () => {
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/dashboard`, {
    //             method: "GET",
    //             credentials: "include"
    //         });
    //         if (response.status===401) {
    //             redirect("/dashboard/login")
    //         } else {
    //             const data = await response.json();
    //             setUser(data);
    //         }
    //     }

    //     init()
    // }, [])
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ReservationChart />
        </div>
    );
}