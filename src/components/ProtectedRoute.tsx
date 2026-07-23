"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case "Admin":
      return "/admin/dashboard";
    case "Doctor":
      return "/doctor/dashboard";
    case "Paciente":
      return "/patient/dashboard";
    case "Secretaria":
      return "/secretary/dashboard";
    default:
      return "/dashboard";
  }
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace(getRoleDashboard(role));
    }
  }, [user, role, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
            role="status"
            aria-label="Cargando"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
