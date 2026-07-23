"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, CardFooter, Button, Spinner } from "@/components/ui";
import { fetchPatients, createMedicalRecord, Patient } from "@/services/doctorService";
import useSWR from "swr";

export default function NewMedicalRecordPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const doctorId = profile?.id;

  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [background, setBackground] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: patients, isLoading: loadingPatients } = useSWR(
    doctorId ? ["patients-for-record", doctorId] : null,
    () => fetchPatients(doctorId!)
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!patientId) newErrors.patientId = "Debe seleccionar un paciente";
    if (!diagnosis.trim()) newErrors.diagnosis = "El diagnóstico es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !doctorId) return;

    setSubmitting(true);
    try {
      await createMedicalRecord(doctorId, {
        patient_id: patientId,
        diagnosis: diagnosis.trim(),
        clinical_notes: clinicalNotes.trim() || undefined,
        background: background.trim() || undefined,
      });
      router.push("/doctor/medical-records");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al crear ficha clínica";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nueva Ficha Clínica
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crea un nuevo registro médico para un paciente
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datos del registro
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Patient selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Paciente *
              </label>
              {loadingPatients ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-sm text-gray-500">Cargando pacientes...</span>
                </div>
              ) : (
                <select
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    if (errors.patientId) setErrors((prev) => ({ ...prev, patientId: "" }));
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.patientId
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/20"
                  }`}
                >
                  <option value="">-- Seleccionar paciente --</option>
                  {patients?.map((patient: Patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} - {patient.rut}
                    </option>
                  ))}
                </select>
              )}
              {errors.patientId && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.patientId}
                </p>
              )}
            </div>

            {/* Diagnosis */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diagnóstico *
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => {
                  setDiagnosis(e.target.value);
                  if (errors.diagnosis) setErrors((prev) => ({ ...prev, diagnosis: "" }));
                }}
                rows={3}
                placeholder="Ingrese el diagnóstico del paciente..."
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 ${
                  errors.diagnosis
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/20"
                }`}
              />
              {errors.diagnosis && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.diagnosis}
                </p>
              )}
            </div>

            {/* Clinical notes */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas clínicas
              </label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
                placeholder="Observaciones, síntomas, tratamiento indicado..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Background */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Antecedentes
              </label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                rows={3}
                placeholder="Antecedentes relevantes del paciente..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Crear ficha clínica
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
