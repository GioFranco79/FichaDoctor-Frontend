"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Spinner, Badge } from "@/components/ui";
import {
  fetchMyPatients,
  fetchMedicalRecordsByPatient,
  DoctorPatient,
  MedicalRecord,
} from "@/services/doctorService";
import { api } from "@/lib/api";
import useSWR from "swr";
import Link from "next/link";

interface Document {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id?: string;
  type: "receta" | "examen";
  file_path: string;
  content_summary: string;
  created_at: string;
}

export default function MedicalRecordsPage() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const doctorId = profile?.id;
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // Auto-select patient from URL query param
  useEffect(() => {
    const patientParam = searchParams.get("patient");
    if (patientParam) {
      setSelectedPatientId(patientParam);
    }
  }, [searchParams]);

  // Fetch patients for dropdown
  const { data: patients, isLoading: loadingPatients } = useSWR(
    doctorId ? ["my-patients-list", doctorId] : null,
    () => fetchMyPatients(doctorId!)
  );

  // Fetch records for selected patient
  const { data: records, isLoading: loadingRecords } = useSWR(
    selectedPatientId ? ["medical-records", selectedPatientId] : null,
    () => fetchMedicalRecordsByPatient(selectedPatientId)
  );

  // Fetch documents for selected patient
  const { data: documents, isLoading: loadingDocuments } = useSWR(
    selectedPatientId ? ["patient-documents", selectedPatientId] : null,
    () => api.get<Document[]>(`/api/documents?patient_id=${selectedPatientId}`)
  );

  const handleViewDocument = async (docId: string) => {
    try {
      const result = await api.get<{ url: string }>(`/api/documents/${docId}/view`);
      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (err) {
      alert("Error al abrir documento");
    }
  };

  const filteredPatients = patients?.filter((p) => {
    if (!patientSearch) return true;
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return (
      fullName.includes(patientSearch.toLowerCase()) ||
      p.rut.includes(patientSearch)
    );
  });

  const handleToggleRecord = (id: string) => {
    setExpandedRecord((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fichas Clínicas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Consulta y gestiona los registros médicos de tus pacientes
          </p>
        </div>
        <Link href="/doctor/medical-records/new">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva ficha
          </Button>
        </Link>
      </div>

      {/* Patient selector */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Seleccionar paciente
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar paciente por nombre o RUT..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>

          {loadingPatients ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              size={5}
            >
              <option value="">-- Seleccionar paciente --</option>
              {filteredPatients?.map((patient: DoctorPatient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} - {patient.rut}
                </option>
              ))}
            </select>
          )}
        </CardBody>
      </Card>

      {/* Records list */}
      {selectedPatientId && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Registros médicos
            </h2>
          </CardHeader>
          <CardBody>
            {loadingRecords ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : records && records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record: MedicalRecord) => (
                  <div
                    key={record.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleRecord(record.id)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="info">
                          {new Date(record.created_at).toLocaleDateString("es-CL")}
                        </Badge>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {record.diagnosis}
                        </span>
                      </div>
                      <svg
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedRecord === record.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expandedRecord === record.id && (
                      <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                        <div className="space-y-3">
                          {record.clinical_notes && (
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                Notas clínicas
                              </p>
                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {record.clinical_notes}
                              </p>
                            </div>
                          )}
                          {record.background && (
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                                Antecedentes
                              </p>
                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {record.background}
                              </p>
                            </div>
                          )}

                          {/* Documents emitted in this record */}
                          {documents && documents.filter((doc: Document) => {
                            // Match documents to records by appointment_id
                            if (record.appointment_id && doc.appointment_id) {
                              return doc.appointment_id === record.appointment_id;
                            }
                            // Fallback: match by same date (for old records without appointment_id)
                            const recordDate = new Date(record.created_at).toISOString().split("T")[0];
                            const docDate = new Date(doc.created_at).toISOString().split("T")[0];
                            return recordDate === docDate && !doc.appointment_id;
                          }).length > 0 && (
                            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-600">
                              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">
                                Documentos emitidos
                              </p>
                              <div className="space-y-1.5">
                                {documents.filter((doc: Document) => {
                                  if (record.appointment_id && doc.appointment_id) {
                                    return doc.appointment_id === record.appointment_id;
                                  }
                                  const recordDate = new Date(record.created_at).toISOString().split("T")[0];
                                  const docDate = new Date(doc.created_at).toISOString().split("T")[0];
                                  return recordDate === docDate && !doc.appointment_id;
                                }).map((doc: Document) => (
                                  <button
                                    key={doc.id}
                                    onClick={() => handleViewDocument(doc.id)}
                                    className="flex w-full items-center gap-2 rounded border border-gray-200 p-2 text-left text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50"
                                  >
                                    <span>{doc.type === "receta" ? "📋" : "🔬"}</span>
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {doc.type === "receta" ? "Receta Médica" : "Solicitud de Examen"}
                                      </span>
                                      {doc.content_summary && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {doc.content_summary}
                                        </p>
                                      )}
                                    </div>
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Última actualización: {new Date(record.updated_at).toLocaleString("es-CL")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                Este paciente no tiene registros médicos
              </p>
            )}
          </CardBody>
        </Card>
      )}

    </div>
  );
}
