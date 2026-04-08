'use client';
import { useState, useEffect} from "react";
import { Employee } from "@/types/Employee.js";
import { redirect } from "next/navigation.js";
import ReservationChart from '@/components/dashboard/ReservationChart';
import { useDashboardAuth } from "@/context/DashboardAuthContext";
export default function AdminDashboard() {
    const { user, isLoading } = useDashboardAuth();

    if ( !isLoading && !user) redirect("/dashboard/login")
    else {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <ReservationChart />
            </div>
        );
    }
}