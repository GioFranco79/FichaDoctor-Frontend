"use client";

import { useState, useMemo } from "react";
import { Card, CardBody, Button, Spinner } from "@/components/ui";
import { fetchDoctors, Doctor } from "@/services/patientService";
import { REGIONES } from "@/lib/chileanData";
import { ESPECIALIDADES_MEDICAS } from "@/lib/especialidades";
import useSWR from "swr";
import Link from "next/link";

export default function PatientDoctorsPage() {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // Get comunas for the selected region
  const comunas = useMemo(() => {
    if (!selectedRegion) return [];
    const region = REGIONES.find((r) => r.name === selectedRegion);
    return region ? region.comunas : [];
  }, [selectedRegion]);

  // Determine if we should fetch doctors (at least one filter selected)
  const shouldFetch = selectedRegion || selectedComuna || selectedSpecialty;

  const { data: doctors, isLoading, error: fetchError } = useSWR(
    shouldFetch
      ? ["doctors-list", selectedRegion, selectedComuna, selectedSpecialty]
      : null,
    () =>
      fetchDoctors(
        undefined,
        selectedSpecialty || undefined,
        selectedRegion || undefined,
        selectedComuna || undefined
      )
  );

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedComuna(""); // Reset comuna when region changes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Buscar Doctor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Filtra por ubicación y especialidad para encontrar un doctor
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Region Select */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Región
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Seleccionar región...</option>
                {REGIONES.map((region) => (
                  <option key={region.name} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Comuna Select */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comuna
              </label>
              <select
                value={selectedComuna}
                onChange={(e) => setSelectedComuna(e.target.value)}
                disabled={!selectedRegion}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">
                  {selectedRegion ? "Seleccionar comuna..." : "Primero selecciona una región"}
                </option>
                {comunas.map((comuna) => (
                  <option key={comuna} value={comuna}>
                    {comuna}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty Select */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Especialidad
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Seleccionar especialidad...</option>
                {ESPECIALIDADES_MEDICAS.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      {!shouldFetch ? (
        <Card>
          <CardBody>
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Selecciona al menos un filtro para buscar doctores
            </p>
          </CardBody>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : fetchError ? (
        <Card>
          <CardBody>
            <p className="py-8 text-center text-red-500 dark:text-red-400">
              Error al buscar doctores: {fetchError.message || "Error desconocido"}
            </p>
          </CardBody>
        </Card>
      ) : !doctors || doctors.length === 0 ? (
        <Card>
          <CardBody>
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              No se encontraron doctores con los filtros seleccionados
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {doctors.length} doctor{doctors.length !== 1 ? "es" : ""} encontrado{doctors.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor: Doctor) => (
              <Card key={doctor.id}>
                <CardBody>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                      <span className="text-lg font-semibold text-primary-700 dark:text-primary-300">
                        {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </h3>
                    {doctor.specialty && (
                      <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                        {doctor.specialty}
                      </p>
                    )}
                    {doctor.comuna && (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {doctor.comuna}{doctor.region ? `, ${doctor.region}` : ""}
                      </p>
                    )}
                    <Link
                      href={`/patient/doctors/${doctor.id}/book`}
                      className="mt-4 w-full"
                    >
                      <Button variant="primary" size="sm" fullWidth>
                        Agendar cita
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
