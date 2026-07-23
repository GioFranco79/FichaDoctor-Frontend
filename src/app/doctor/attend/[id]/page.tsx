"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Spinner } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import useSWR from "swr";

interface AppointmentDetail {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient_id: string;
  doctor_id: string;
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    rut?: string;
    phone?: string;
    direccion?: string;
    comuna?: string;
    region?: string;
  };
}

type ModalType = "receta" | "examen" | null;

export default function AttendPatientPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const appointmentId = params.id as string;

  const [symptoms, setSymptoms] = useState("");
  const [indications, setIndications] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalContent, setModalContent] = useState("");
  const [emitting, setEmitting] = useState(false);
  const [emitMessage, setEmitMessage] = useState("");

  // Fetch appointment details with patient info
  const { data: appointment, isLoading, error: fetchError } = useSWR(
    appointmentId ? ["appointment-detail", appointmentId] : null,
    async () => {
      const result = await api.get<AppointmentDetail>(`/api/appointments/${appointmentId}`);
      return result;
    }
  );

  const handleSave = async () => {
    if (!appointment || !symptoms.trim()) {
      setSaveMessage("Los síntomas son obligatorios");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    try {
      await api.post("/api/medical-records/create", {
        patient_id: appointment.patient_id,
        appointment_id: appointment.id,
        diagnosis: symptoms,
        clinical_notes: indications,
        background: "",
      });

      await api.patch(`/api/appointments/${appointmentId}/status`, {
        status: "completada",
      });

      setSaveMessage("Ficha guardada exitosamente");
      setTimeout(() => {
        router.push("/doctor/dashboard");
      }, 1500);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Error al guardar la ficha");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenModal = (type: "receta" | "examen") => {
    setModalType(type);
    setModalContent("");
    setEmitMessage("");
  };

  const handleCloseModal = () => {
    setModalType(null);
    setModalContent("");
    setEmitMessage("");
  };

  const handleEmit = async () => {
    if (!appointment || !modalContent.trim() || !modalType) return;

    setEmitting(true);
    setEmitMessage("");

    try {
      const result = await api.post<{ url: string }>("/api/documents/generate", {
        type: modalType,
        patient_id: appointment.patient_id,
        appointment_id: appointment.id,
        content: modalContent,
      });

      if (result.url) {
        window.open(result.url, "_blank");
      }

      setEmitMessage("Documento generado exitosamente");
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err) {
      setEmitMessage(err instanceof Error ? err.message : "Error al generar documento");
    } finally {
      setEmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {fetchError ? `Error: ${fetchError.message}` : "Cita no encontrada"}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  const patient = appointment.patient;
  const modalTitle = modalType === "receta" ? "Receta Médica" : "Solicitud de Examen";
  const contentPlaceholder = modalType === "receta"
    ? "Escriba los medicamentos recetados, dosis y frecuencia..."
    : "Escriba los exámenes solicitados...";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Atender Paciente
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cita del {appointment.appointment_date} · {appointment.start_time?.substring(0, 5)} - {appointment.end_time?.substring(0, 5)}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      {/* Patient Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Datos del Paciente
          </h2>
        </CardHeader>
        <CardBody>
          {patient ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre completo</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {patient.first_name} {patient.last_name}
                </p>
              </div>
              {patient.rut && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">RUT</p>
                  <p className="font-medium text-gray-900 dark:text-white">{patient.rut}</p>
                </div>
              )}
              {patient.email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{patient.email}</p>
                </div>
              )}
              {patient.direccion && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                  <p className="font-medium text-gray-900 dark:text-white">{patient.direccion}</p>
                </div>
              )}
              {patient.comuna && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ubicación</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {patient.comuna}{patient.region ? `, ${patient.region}` : ""}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron datos del paciente
            </p>
          )}
        </CardBody>
      </Card>

      {/* Action buttons: Generar Receta + Pedir Examen */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => handleOpenModal("receta")}
          className="!bg-blue-600 hover:!bg-blue-700"
        >
          📋 Generar Receta
        </Button>
        <Button
          variant="primary"
          onClick={() => handleOpenModal("examen")}
          className="!bg-purple-600 hover:!bg-purple-700"
        >
          🔬 Pedir Examen
        </Button>
      </div>

      {/* Medical Record Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ficha Médica
          </h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Síntomas del paciente *
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={5}
              placeholder="Describe los síntomas que presenta el paciente..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Indicaciones médicas
            </label>
            <textarea
              value={indications}
              onChange={(e) => setIndications(e.target.value)}
              rows={5}
              placeholder="Ingresa las indicaciones, tratamiento o recetas para el paciente..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!symptoms.trim()}
            >
              Guardar ficha y completar cita
            </Button>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes("Error") || saveMessage.includes("obligatorios") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Modal for Receta / Examen */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalTitle}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Doctor info */}
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Doctor</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  Dr. {profile?.first_name} {profile?.last_name}
                </p>
              </div>

              {/* Patient info */}
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">Paciente</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {patient?.first_name} {patient?.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  RUT: {patient?.rut || "No registrado"}
                </p>
              </div>

              {/* Content textarea */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {modalType === "receta" ? "Medicamentos recetados" : "Exámenes solicitados"}
                </label>
                <textarea
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  rows={6}
                  placeholder={contentPlaceholder}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>

              {/* Emit message */}
              {emitMessage && (
                <p className={`text-sm ${emitMessage.includes("Error") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {emitMessage}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleEmit}
                loading={emitting}
                disabled={!modalContent.trim()}
                className="!bg-green-600 hover:!bg-green-700"
              >
                Emitir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
