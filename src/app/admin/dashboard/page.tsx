"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  doctors: number;
  patients: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  // Fetch total count from the paginated users endpoint
  const result = await api.get<{ pagination: { total: number } }>(
    "/api/admin/users?limit=1"
  );
  const totalUsers = result.pagination?.total ?? 0;

  // For a simple dashboard, we return totals from the same source
  // A dedicated stats endpoint could be added to the backend for better performance
  return {
    totalUsers,
    activeUsers: totalUsers, // Approximation; backend could expose filtered counts
    doctors: 0,
    patients: 0,
  };
}

async function fetchRecentUsers(): Promise<UserRow[]> {
  const result = await api.get<{ data: UserRow[] }>(
    "/api/admin/users?page=1&limit=5"
  );
  return result.data ?? [];
}

const recentUsersColumns: Column<UserRow>[] = [
  {
    key: "name",
    header: "Nombre",
    render: (user) => `${user.first_name} ${user.last_name}`,
  },
  {
    key: "email",
    header: "Email",
  },
  {
    key: "role",
    header: "Rol",
    render: (user) => {
      const variant =
        user.role === "Admin"
          ? "error"
          : user.role === "Doctor"
            ? "info"
            : user.role === "Paciente"
              ? "success"
              : "default";
      return <Badge variant={variant}>{user.role}</Badge>;
    },
  },
  {
    key: "created_at",
    header: "Fecha Registro",
    render: (user) =>
      new Date(user.created_at).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
  } = useSWR("admin-dashboard-stats", fetchDashboardStats);

  const {
    data: recentUsers,
    isLoading: usersLoading,
  } = useSWR("admin-recent-users", fetchRecentUsers);

  const statCards = [
    {
      label: "Total Usuarios",
      value: stats?.totalUsers ?? 0,
      icon: (
        <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Usuarios Activos",
      value: stats?.activeUsers ?? 0,
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Doctores",
      value: stats?.doctors ?? 0,
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: "Pacientes",
      value: stats?.patients ?? 0,
      icon: (
        <svg className="h-8 w-8 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Panel de Administración
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Resumen general del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center gap-4">
              <div className="flex-shrink-0">{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Últimos Usuarios Registrados
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table<UserRow>
            columns={recentUsersColumns}
            data={recentUsers ?? []}
            loading={usersLoading}
            keyExtractor={(user) => user.id}
            emptyMessage="No hay usuarios registrados"
          />
        </CardBody>
      </Card>
    </div>
  );
}
