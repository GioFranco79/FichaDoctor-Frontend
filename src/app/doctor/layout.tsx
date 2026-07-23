"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Doctor"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
