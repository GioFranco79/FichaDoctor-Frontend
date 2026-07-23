"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["Paciente"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
