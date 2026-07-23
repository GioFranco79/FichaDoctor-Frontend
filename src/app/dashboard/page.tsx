"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case "Admin":
      return "/admin/dashboard";
    case "Doctor":
      return "/doctor/dashboard";
    case "Secretaria":
      return "/secretary/dashboard";
    case "Paciente":
      return "/patient/dashboard";
    default:
      return "/login";
  }
}

export default function DashboardRedirectPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role) {
      router.replace(getRoleDashboard(role));
    }
  }, [user, role, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirigiendo al dashboard...
        </p>
      </div>
    </div>
  );
}
