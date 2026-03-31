"use client";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";
import AdminManageUser from "../../(admin)/users/AdminUserView";
import ManageBranchManageUser from "../../(manage-branch)/users/ManageBranchUserView";

export default function DashboardUserDispatcher() {
    const { user } = useDashboardAuth();

    if (!user) redirect("/dashboard/login");

    if (user.roles.some(i => i.name == "ADMINISTRATOR")) {
        return <AdminManageUser />
    }

    if (user.roles.some(i => i.name == "MANAGE_BRANCH")) {
        return <ManageBranchManageUser />
    }

}