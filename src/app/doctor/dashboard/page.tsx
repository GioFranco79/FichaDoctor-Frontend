"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Badge, Button, Spinner } from "@/components/ui";
import {
  fetchTodayAppointments,
  fetchPendingAppointments,
  fetchAppointmentsCount,
  fetchMyPatients,
  Appointment,
} from "@/services/doctorService";
import useSWR from "swr";
import Link from "next/link";

type ActiveList = "today" | "pending";

export default function DoctorDashboardPage() {
  const { profile } = useAuth();
  const doctorId = profile?.id;
  const [activeList, setActiveList] = useState<ActiveList>("today");

  const { data: todayAppointments, isLoading: loadingAppointments } = useSWR(
    doctorId ? ["today-appointments", doctorId] : null,
    () => fetchTodayAppointments(doctorId!)
  );

  const { data: myPatients, isLoading: loadingPatients } = useSWR(
    doctorId ? ["my-patients-count", doctorId] : null,
    () => fetchMyPatients(doctorId!)
  );

  const { data: pendingCount, isLoading: loadingPending } = useSWR(
    doctorId ? ["pending-appointments", doctorId] : null,
    () => fetchAppointmentsCount(doctorId!, "pendiente")
  );

  const { data: pendingAppointments, isLoading: loadingPendingList } = useSWR(
    doctorId ? ["pending-appointments-list", doctorId] : null,
    () => fetchPendingAppointments(doctorId!)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido, Dr. {profile?.last_name}
        </p>
      </div>

      {/* Stats - clickable cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className={`cursor-pointer transition-all ${activeList === "today" ? "ring-2 ring-blue-500" : ""}`}
          onClick={() => setActiveList("today")}
        >
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total pacientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loadingPatients ? "..." : myPatients?.length ?? 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${activeList === "pending" ? "ring-2 ring-yellow-500" : ""}`}
          onClick={() => setActiveList("pending")}
        >
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

      {/* Appointment list - toggled by clicking cards */}
      {activeList === "today" && (
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
            ) : !todayAppointments || todayAppointments.length === 0 ? (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                No hay citas programadas para hoy
              </p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt: Appointment) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          {apt.patient?.first_name?.[0]}{apt.patient?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {apt.patient?.first_name} {apt.patient?.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {apt.start_time?.substring(0, 5)} - {apt.end_time?.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={apt.status === "completada" ? "success" : apt.status === "confirmada" ? "info" : "warning"}>
                        {apt.status}
                      </Badge>
                      {apt.status !== "completada" && apt.status !== "cancelada" && (
                        <Link href={`/doctor/attend/${apt.id}`}>
                          <Button variant="primary" size="sm" className="!bg-green-600 hover:!bg-green-700">
                            Atender
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {activeList === "pending" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Citas pendientes
            </h2>
          </CardHeader>
          <CardBody>
            {loadingPendingList ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : !pendingAppointments || pendingAppointments.length === 0 ? (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                No hay citas pendientes
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.map((apt: Appointment) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          {apt.patient?.first_name?.[0]}{apt.patient?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {apt.patient?.first_name} {apt.patient?.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {apt.appointment_date} · {apt.start_time?.substring(0, 5)} - {apt.end_time?.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                    <Link href={`/doctor/attend/${apt.id}`}>
                      <Button variant="primary" size="sm" className="!bg-green-600 hover:!bg-green-700">
                        Atender
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Acciones rápidas
          </h2>
        </CardHeader>
        <CardBody className="flex gap-3">
          <Link href="/doctor/schedule">
            <Button variant="outline">
              Ver agenda
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
