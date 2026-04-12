"use client";

import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";
import ManageHotelBedList from "../../(manage-hotel)/beds/ManageHotelBedView";


export default function DashboardUserDispatcher() {
    const { user, isLoading } = useDashboardAuth();

    if (!isLoading && !user) redirect("/dashboard/login");

    // if (user?.roles.some(i => i.name == "ADMINISTRATOR")) {
    //     return <AdminManageUser />
    // }

    if (user?.roles.some(i => i.name == "MANAGE_HOTEL")) {
        return <ManageHotelBedList />
    }

}