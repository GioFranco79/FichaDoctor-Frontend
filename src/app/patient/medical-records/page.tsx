"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Spinner } from "@/components/ui";
import { fetchMyMedicalRecords, PatientMedicalRecord } from "@/services/patientService";
import useSWR from "swr";

export default function PatientMedicalRecordsPage() {
  const { profile } = useAuth();
  const patientId = profile?.id;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: records, isLoading } = useSWR(
    patientId ? ["my-medical-records", patientId] : null,
    () => fetchMyMedicalRecords(patientId!)
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mis Fichas Médicas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Historial de diagnósticos y atenciones
        </p>
      </div>

      {/* Records list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !records || records.length === 0 ? (
        <Card>
          <CardBody>
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              No tienes fichas médicas registradas
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record: PatientMedicalRecord) => (
            <Card key={record.id}>
              <CardBody>
                <button
                  onClick={() => toggleExpand(record.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {record.diagnosis}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Dr. {record.doctor?.first_name} {record.doctor?.last_name} · {formatDate(record.created_at)}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedId === record.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedId === record.id && (
                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    {record.clinical_notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notas clínicas
                        </h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {record.clinical_notes}
                        </p>
                      </div>
                    )}
                    {record.background && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Antecedentes
                        </h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {record.background}
                        </p>
                      </div>
                    )}
                    {!record.clinical_notes && !record.background && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sin notas adicionales
                      </p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
