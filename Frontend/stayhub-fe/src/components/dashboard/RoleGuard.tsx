"use client";

import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type RoleGuardProps = {
  allowedRoles: string[];
  children: ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isLoading } = useDashboardAuth();

  if (!isLoading && !user) {
    redirect("/dashboard/login");
  }

  if (!isLoading && user) {
    const hasAccess = user.roles.some((role) =>
      allowedRoles.includes(role.name.toUpperCase())
    );

    if (!hasAccess) {
      redirect("/dashboard");
    }
  }

  return <>{children}</>;
}
