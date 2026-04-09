"use client";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";
import AdminManageUser from "../../(admin)/users/AdminUserView";
import ManageBranchManageUser from "../../(manage-branch)/users/ManageBranchUserView";
import ManageHotelManageUser from "../../(manage-hotel)/users/ManageHotelUserView";

export default function DashboardUserDispatcher() {
    const { user, isLoading } = useDashboardAuth();

    if (!isLoading && !user) redirect("/dashboard/login");

    if (user?.roles.some(i => i.name == "ADMINISTRATOR")) {
        return <AdminManageUser />
    }

    if (user?.roles.some(i => i.name == "MANAGE_BRANCH")) {
        return <ManageBranchManageUser />
    }

    if (user?.roles.some(i => i.name == "MANAGE_HOTEL")) {
        return <ManageHotelManageUser />
    }

}