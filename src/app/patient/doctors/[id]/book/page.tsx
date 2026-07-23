"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Spinner } from "@/components/ui";
import {
  fetchDoctors,
  bookAppointment,
  Doctor,
} from "@/services/patientService";
import useSWR from "swr";

type Step = 1 | 2 | 3;

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  // Fetch doctor info
  const { data: doctors } = useSWR(
    doctorId ? ["doctor-info", doctorId] : null,
    () => fetchDoctors()
  );
  const doctor = doctors?.find((d: Doctor) => d.id === doctorId);

  // Fetch availability when date selected - use available_slots table
  const { data: slots, isLoading: loadingSlots } = useSWR(
    doctorId && selectedDate
      ? ["doctor-available-slots", doctorId, selectedDate]
      : null,
    async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/schedule/available-slots?doctor_id=${doctorId}&startDate=${selectedDate}&endDate=${selectedDate}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await import("@/lib/auth")).getAccessToken()}`,
          },
        }
      );
      if (!response.ok) return [];
      const json = await response.json();
      return (json.data || []) as Array<{ date: string; start_time: string; end_time: string }>;
    }
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: { date: string; start_time: string; end_time: string }) => {
    setSelectedSlot({ date: slot.date, startTime: slot.start_time, endTime: slot.end_time });
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    setError("");

    try {
      // Ensure start_time is in HH:mm format (strip seconds if present)
      const startTime = selectedSlot.startTime.substring(0, 5);
      await bookAppointment(doctorId, selectedSlot.date, startTime);
      router.push("/patient/appointments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agendar cita");
    } finally {
      setIsBooking(false);
    }
  };

  // Get today's date as min for date picker
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Agendar Cita
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Selecciona una fecha y horario disponible
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-8 ${
                  step > s ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Doctor Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Doctor seleccionado
            </h2>
          </CardHeader>
          <CardBody>
            {!doctor ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <span className="text-xl font-semibold text-primary-700 dark:text-primary-300">
                    {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </h3>
                  {doctor.specialty && (
                    <p className="text-gray-500 dark:text-gray-400">
                      {doctor.specialty}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button variant="primary" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selecciona fecha y hora
            </h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Date picker */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha
              </label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Available slots */}
            {selectedDate && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Horarios disponibles
                </label>
                {loadingSlots ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : !slots || slots.length === 0 ? (
                  <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((slot: { date: string; start_time: string; end_time: string }, index: number) => {
                      const isSelected = selectedSlot?.startTime === slot.start_time;
                      return (
                        <button
                          key={index}
                          onClick={() => handleSlotSelect(slot)}
                          className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-green-500 bg-green-500 text-white dark:border-green-600 dark:bg-green-600"
                              : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-500 dark:hover:bg-green-900/20"
                          }`}
                        >
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button
                variant="primary"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
              >
                Continuar
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmar cita
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Doctor</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    Dr. {doctor?.first_name} {doctor?.last_name}
                  </dd>
                </div>
                {doctor?.specialty && (
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Especialidad</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {doctor.specialty}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Fecha</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {selectedSlot ? formatDate(selectedSlot.date) : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Hora</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {selectedSlot?.startTime.substring(0, 5)} - {selectedSlot?.endTime.substring(0, 5)}
                  </dd>
                </div>
              </dl>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Volver
              </Button>
              <Button
                variant="primary"
                loading={isBooking}
                onClick={handleConfirmBooking}
              >
                Confirmar cita
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
