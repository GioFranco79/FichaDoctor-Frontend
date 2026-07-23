"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Secretaria"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
