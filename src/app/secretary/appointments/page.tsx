"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Badge,
  Spinner,
} from "@/components/ui";
import {
  fetchAssignedDoctor,
  fetchDoctorAppointments,
  bookAppointmentForDoctor,
  cancelAppointment,
} from "@/services/secretaryService";
import type { Appointment, Patient } from "@/services/doctorService";
import { api } from "@/lib/api";
import useSWR, { mutate } from "swr";

export default function SecretaryAppointmentsPage() {
  const { profile } = useAuth();
  const secretaryId = profile?.id;

  // Booking form state
  const [rutInput, setRutInput] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  // Fetch assigned doctor
  const { data: doctor, isLoading: loadingDoctor } = useSWR(
    secretaryId ? ["assigned-doctor", secretaryId] : null,
    () => fetchAssignedDoctor(secretaryId!)
  );

  const doctorId = doctor?.id;

  // Fetch all appointments for the doctor
  const { data: appointments, isLoading: loadingAppointments } = useSWR(
    doctorId ? ["secretary-appointments", doctorId] : null,
    () => fetchDoctorAppointments(doctorId!)
  );

  // Fetch available slots for selected date
  const { data: availableSlots, isLoading: loadingSlots } = useSWR(
    doctorId && appointmentDate ? ["sec-available-slots", doctorId, appointmentDate] : null,
    async () => {
      const result = await api.get<Array<{ date: string; start_time: string; end_time: string }>>(
        `/api/schedule/available-slots?doctor_id=${doctorId}&startDate=${appointmentDate}&endDate=${appointmentDate}`
      );
      return Array.isArray(result) ? result : [];
    }
  );

  // Format RUT as user types
  const handleRutChange = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, "");
    if (cleaned.length <= 1) { setRutInput(cleaned); return; }
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    let formatted = "";
    for (let i = body.length - 1, count = 0; i >= 0; i--, count++) {
      if (count > 0 && count % 3 === 0) formatted = "." + formatted;
      formatted = body[i] + formatted;
    }
    setRutInput(`${formatted}-${dv}`);
  };

  // Fetch patients for booking dropdown
  const { data: patients, isLoading: loadingPatients } = useSWR(
    doctorId ? ["secretary-patients", doctorId] : null,
    () => fetchDoctorPatients(doctorId!)
  );

  const handleSearchPatient = async () => {
    if (!rutInput.trim()) return;
    setSearchingPatient(true);
    setPatientError("");
    setFoundPatient(null);
    try {
      const patients = await api.get<Patient[]>(`/api/doctors/search-patient?rut=${encodeURIComponent(rutInput.trim())}`);
      if (Array.isArray(patients) && patients.length > 0) {
        setFoundPatient(patients[0]);
      } else {
        setPatientError("No se encontró paciente con ese RUT");
      }
    } catch {
      setPatientError("Error al buscar paciente");
    } finally {
      setSearchingPatient(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !foundPatient || !appointmentDate || !selectedTime) return;

    setBooking(true);
    setBookingMessage("");
    try {
      await bookAppointmentForDoctor(
        doctorId,
        foundPatient.id,
        appointmentDate,
        selectedTime.substring(0, 5)
      );
      setBookingMessage("Cita agendada exitosamente");
      setFoundPatient(null);
      setRutInput("");
      setAppointmentDate("");
      setSelectedTime("");
      mutate(["secretary-appointments", doctorId]);
      mutate(["sec-available-slots", doctorId, appointmentDate]);
    } catch (err) {
      setBookingMessage(err instanceof Error ? err.message : "Error al agendar la cita");
    } finally {
      setBooking(false);
      setTimeout(() => setBookingMessage(""), 3000);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!doctorId) return;
    if (!confirm("¿Estás seguro de cancelar esta cita?")) return;

    try {
      await cancelAppointment(appointmentId);
      mutate(["secretary-appointments", doctorId]);
    } catch {
      alert("Error al cancelar la cita");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmada":
        return "success";
      case "cancelada":
        return "danger";
      case "completada":
        return "info";
      default:
        return "warning";
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Citas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Citas de Dr. {doctor.last_name}
        </p>
      </div>

      {/* Book new appointment */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agendar nueva cita
          </h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleBookAppointment} className="space-y-4">
            {/* RUT search */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                RUT del Paciente
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rutInput}
                  onChange={(e) => handleRutChange(e.target.value)}
                  placeholder="12.345.678-9"
                  maxLength={12}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchPatient(); } }}
                />
                <Button type="button" variant="outline" onClick={handleSearchPatient} loading={searchingPatient}>
                  Buscar
                </Button>
              </div>
              {patientError && <p className="mt-1 text-sm text-red-500">{patientError}</p>}
            </div>

            {/* Found patient info */}
            {foundPatient && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-300">
                  Paciente encontrado: <strong>{foundPatient.first_name} {foundPatient.last_name}</strong> — RUT: {foundPatient.rut}
                </p>
              </div>
            )}

            {/* Date picker */}
            {foundPatient && (
              <div>
                <Input
                  label="Fecha"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => { setAppointmentDate(e.target.value); setSelectedTime(""); }}
                  required
                />
              </div>
            )}

            {/* Available time slots */}
            {foundPatient && appointmentDate && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Horarios disponibles
                </label>
                {loadingSlots ? (
                  <div className="flex justify-center py-4"><Spinner /></div>
                ) : !availableSlots || availableSlots.length === 0 ? (
                  <p className="py-3 text-sm text-gray-500 dark:text-gray-400">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {availableSlots.map((slot, i) => {
                      const isSelected = selectedTime === slot.start_time;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedTime(slot.start_time)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-green-900/20"
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

            <div className="flex items-center gap-4">
              {foundPatient && (
                <Button type="submit" loading={booking} disabled={!appointmentDate || !selectedTime}>
                  Agendar cita
                </Button>
              )}
              {bookingMessage && (
                <p className={`text-sm ${bookingMessage.includes("Error") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {bookingMessage}
                </p>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Appointments list */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lista de citas
          </h2>
        </CardHeader>
        <CardBody>
          {loadingAppointments ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              No hay citas registradas
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt: Appointment) => (
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
                        {apt.appointment_date} • {apt.start_time?.substring(0, 5)}
                        {apt.end_time ? ` - ${apt.end_time.substring(0, 5)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(apt.status)}>
                      {apt.status}
                    </Badge>
                    {apt.status !== "cancelada" &&
                      apt.status !== "completada" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
