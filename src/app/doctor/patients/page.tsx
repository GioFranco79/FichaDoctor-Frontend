"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Button, Input, Table, Spinner } from "@/components/ui";
import type { Column } from "@/components/ui";
import { fetchMyPatients, DoctorPatient } from "@/services/doctorService";
import useSWR from "swr";
import Link from "next/link";

export default function PatientsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const doctorId = profile?.id;
  const [search, setSearch] = useState("");

  const { data: patients, isLoading } = useSWR(
    doctorId ? ["patients", doctorId, search] : null,
    () => fetchMyPatients(doctorId!),
    { keepPreviousData: true }
  );

  const columns: Column<DoctorPatient>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (patient) => (
        <span className="font-medium">
          {patient.first_name} {patient.last_name}
        </span>
      ),
    },
    {
      key: "rut",
      header: "RUT",
    },
    {
      key: "email",
      header: "Email",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pacientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona tu listado de pacientes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Listado de pacientes
            </h2>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Buscar por nombre o RUT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading && !patients ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <Table
              columns={columns}
              data={(patients ?? []).filter((p) => {
                if (!search) return true;
                const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
                return fullName.includes(search.toLowerCase()) || (p.rut && p.rut.includes(search));
              })}
              loading={isLoading}
              keyExtractor={(p) => p.id}
              onRowClick={(patient) => router.push(`/doctor/medical-records?patient=${patient.id}`)}
              emptyMessage="No se encontraron pacientes"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
