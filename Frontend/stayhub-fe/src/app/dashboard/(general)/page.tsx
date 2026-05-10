"use client";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";
import AdminDashboard from "../(admin)/AdminDashboard";

export default function DashboardUserDispatcher() {
  const { user, isLoading } = useDashboardAuth();

  if (!isLoading && !user) redirect("/dashboard/login");

  if (user?.roles.some((i) => i.name == "ADMINISTRATOR")) {
    return <AdminDashboard />;
  } else return <></>;
}
