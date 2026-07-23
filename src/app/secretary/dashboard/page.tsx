"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Badge, Button, Spinner } from "@/components/ui";
import {
  fetchAssignedDoctor,
  fetchDoctorTodayAppointments,
  fetchDoctorPendingCount,
} from "@/services/secretaryService";
import type { Appointment } from "@/services/doctorService";
import useSWR from "swr";
import Link from "next/link";

export default function SecretaryDashboardPage() {
  const { profile } = useAuth();
  const secretaryId = profile?.id;

  // Fetch assigned doctor
  const { data: doctor, isLoading: loadingDoctor } = useSWR(
    secretaryId ? ["assigned-doctor", secretaryId] : null,
    () => fetchAssignedDoctor(secretaryId!)
  );

  const doctorId = doctor?.id;

  // Fetch today's appointments for the assigned doctor
  const { data: todayAppointments, isLoading: loadingAppointments } = useSWR(
    doctorId ? ["secretary-today-appointments", doctorId] : null,
    () => fetchDoctorTodayAppointments(doctorId!)
  );

  // Fetch pending count
  const { data: pendingCount, isLoading: loadingPending } = useSWR(
    doctorId ? ["secretary-pending-count", doctorId] : null,
    () => fetchDoctorPendingCount(doctorId!)
  );

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const upcomingAppointments =
    todayAppointments?.filter((apt) => apt.start_time >= currentTime) ?? [];

  if (loadingDoctor) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No tienes un doctor asignado. Contacta al administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Panel de Secretaria
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestionando agenda de Dr. {doctor.last_name}
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Citas hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loadingAppointments ? "..." : todayAppointments?.length ?? 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Citas pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loadingPending ? "..." : pendingCount ?? 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Today's appointments & Quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Citas de hoy
              </h2>
            </CardHeader>
            <CardBody>
              {loadingAppointments ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay más citas programadas para hoy
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt: Appointment) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {apt.patient?.first_name?.[0]}
                            {apt.patient?.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {apt.patient?.first_name} {apt.patient?.last_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {apt.start_time} - {apt.end_time}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          apt.status === "confirmada" ? "success" : "warning"
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Acciones rápidas
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link href="/secretary/appointments">
                <Button variant="primary" fullWidth>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agendar cita
                </Button>
              </Link>
              <Link href="/secretary/schedule">
                <Button variant="outline" fullWidth>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Gestionar agenda
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
