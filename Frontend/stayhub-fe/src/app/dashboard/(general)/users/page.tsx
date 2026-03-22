"use client";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";
import AdminManageUser from "../../(admin)/users/AdminUserView";

export default function DashboardUserDispatcher() {
    const { user } = useDashboardAuth();

    if (!user) redirect("/dashboard/login");

    if (user.roles.some(i => i.role == "ADMINISTRATOR")) {
        return <AdminManageUser />
    }

    if (user.roles.some(i => i.role == "MANAGE_BRANCH")) {
        return <></>
    }

}