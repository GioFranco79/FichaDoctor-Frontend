"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, Column } from "@/components/ui/Table";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import {
  fetchUsers,
  disableUser,
  enableUser,
  User,
} from "@/services/adminService";

const USERS_PER_PAGE = 10;

function getRoleBadgeVariant(rol: string): BadgeVariant {
  switch (rol) {
    case "Admin":
      return "error";
    case "Doctor":
      return "info";
    case "Paciente":
      return "success";
    case "Secretaria":
      return "warning";
    default:
      return "default";
  }
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, isLoading, error } = useSWR(
    ["admin-users", page, USERS_PER_PAGE],
    () => fetchUsers(page, USERS_PER_PAGE)
  );

  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];
    if (!search.trim()) return data.data;

    const query = search.toLowerCase();
    return data.data.filter(
      (user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [data, search]);

  const totalPages = data?.pagination?.totalPages ?? Math.ceil((data?.data?.length ?? 0) / USERS_PER_PAGE);

  async function handleToggleStatus(user: User) {
    setActionLoading(user.id);
    try {
      if (user.is_active) {
        await disableUser(user.id);
      } else {
        await enableUser(user.id);
      }
      await mutate(["admin-users", page, USERS_PER_PAGE]);
    } catch (err) {
      console.error("Error al cambiar estado del usuario:", err);
    } finally {
      setActionLoading(null);
    }
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (user) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {user.first_name} {user.last_name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "role",
      header: "Rol",
      render: (user) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      render: (user) => (
        <Badge variant={user.is_active ? "success" : "error"}>
          {user.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Fecha Creación",
      render: (user) =>
        new Date(user.created_at).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={user.is_active ? "danger" : "primary"}
            loading={actionLoading === user.id}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user);
            }}
          >
            {user.is_active ? "Deshabilitar" : "Habilitar"}
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-600 dark:text-red-400">
          Error al cargar los usuarios
        </p>
        <Button
          variant="outline"
          onClick={() => mutate(["admin-users", page, USERS_PER_PAGE])}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Administra los usuarios del sistema
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <div className="max-w-md">
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Usuarios ({data?.pagination?.total ?? 0})
            </h2>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Table<User>
            columns={columns}
            data={filteredUsers}
            loading={isLoading}
            keyExtractor={(user) => user.id}
            onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
            emptyMessage="No se encontraron usuarios"
          />
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
