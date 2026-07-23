"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Badge, Button, Spinner } from "@/components/ui";
import {
  fetchMyAppointments,
  cancelAppointment,
  PatientAppointment,
} from "@/services/patientService";
import useSWR from "swr";

type Tab = "upcoming" | "past";

export default function PatientAppointmentsPage() {
  const { profile } = useAuth();
  const patientId = profile?.id;
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const { data: appointments, isLoading, mutate } = useSWR(
    patientId ? ["my-appointments", patientId] : null,
    () => fetchMyAppointments(patientId!)
  );

  const today = new Date().toISOString().split("T")[0];

  const upcomingAppointments = appointments
    ?.filter((apt) => apt.appointment_date >= today && apt.status !== "cancelada" && apt.status !== "completada")
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.start_time.localeCompare(b.start_time)) ?? [];

  const pastAppointments = appointments
    ?.filter((apt) => apt.appointment_date < today || apt.status === "completada" || apt.status === "cancelada")
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date)) ?? [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
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

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    setCancelingId(appointmentId);
    try {
      await cancelAppointment(appointmentId);
      mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cancelar cita");
    } finally {
      setCancelingId(null);
    }
  };

  const displayedAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mis Citas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tus citas médicas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "upcoming"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Próximas ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "past"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Pasadas ({pastAppointments.length})
        </button>
      </div>

      {/* Appointments list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : displayedAppointments.length === 0 ? (
        <Card>
          <CardBody>
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              {activeTab === "upcoming"
                ? "No tienes citas próximas"
                : "No tienes citas pasadas"}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedAppointments.map((apt: PatientAppointment) => (
            <Card key={apt.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                      <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                        {apt.doctor?.first_name?.[0]}{apt.doctor?.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}
                      </p>
                      {apt.doctor?.especialidad && (
                        <p className="text-sm text-primary-600 dark:text-primary-400">
                          {apt.doctor.especialidad}
                        </p>
                      )}
                      {apt.doctor?.comuna && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📍 {apt.doctor.direccion ? `${apt.doctor.direccion}, ` : ""}{apt.doctor.comuna}{apt.doctor.region ? `, ${apt.doctor.region}` : ""}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(apt.appointment_date)} · {apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(apt.status)}>
                      {apt.status}
                    </Badge>
                    {activeTab === "upcoming" && apt.status !== "cancelada" && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancelingId === apt.id}
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
