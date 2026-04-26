"use client";

import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";

export default function ManageBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useDashboardAuth();
  if (
    isLoading &&
    user &&
    !user.roles.some((i) => i.name == "MANAGE_BOOKING")
  ) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}