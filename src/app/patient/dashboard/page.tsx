"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Badge, Button, Spinner } from "@/components/ui";
import { fetchMyAppointments, PatientAppointment } from "@/services/patientService";
import useSWR from "swr";
import Link from "next/link";

export default function PatientDashboardPage() {
  const { profile } = useAuth();
  const patientId = profile?.id;

  const { data: appointments, isLoading } = useSWR(
    patientId ? ["my-appointments", patientId] : null,
    () => fetchMyAppointments(patientId!)
  );

  const today = new Date().toISOString().split("T")[0];

  const upcomingAppointments = appointments
    ?.filter((apt) => apt.date >= today && apt.status !== "cancelada")
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time))
    .slice(0, 3) ?? [];

  const pastAppointments = appointments
    ?.filter((apt) => apt.date < today || apt.status === "completada") ?? [];

  const totalAppointments = appointments?.length ?? 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmada": return "success" as const;
      case "pendiente": return "warning" as const;
      case "cancelada": return "error" as const;
      case "completada": return "info" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mi Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido/a, {profile?.first_name} {profile?.last_name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de citas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : totalAppointments}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Citas pasadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : pastAppointments.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Upcoming appointments & Quick links */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Próximas citas
              </h2>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No tienes citas próximas
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt: PatientAppointment) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {apt.doctor?.first_name?.[0]}{apt.doctor?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(apt.date)} · {apt.start_time} - {apt.end_time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick links */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Acciones rápidas
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link href="/patient/doctors">
                <Button variant="primary" fullWidth>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Agendar cita
                </Button>
              </Link>
              <Link href="/patient/medical-records">
                <Button variant="outline" fullWidth>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ver fichas médicas
                </Button>
              </Link>
              <Link href="/patient/appointments">
                <Button variant="outline" fullWidth>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mis citas
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
