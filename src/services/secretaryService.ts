import { api } from "@/lib/api";
import type { Appointment, Patient } from "@/services/doctorService";

// ============ Types ============

export interface AssignedDoctor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

// ============ Assigned Doctor ============

export async function fetchAssignedDoctor(secretaryId?: string): Promise<AssignedDoctor | null> {
  try {
    // El backend identifica al doctor asignado a partir del token de la secretaria
    return await api.get<AssignedDoctor>("/api/admin/my-doctor");
  } catch {
    return null;
  }
}

// ============ Appointments ============

export async function fetchDoctorAppointments(
  doctorId: string,
  date?: string
): Promise<Appointment[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const query = params.toString() ? `?${params.toString()}` : "";
  const result = await api.get<{ data: Appointment[] }>(`/api/appointments${query}`);
  return result.data ?? result as unknown as Appointment[];
}

export async function fetchDoctorTodayAppointments(doctorId: string): Promise<Appointment[]> {
  const today = new Date().toISOString().split("T")[0];
  return fetchDoctorAppointments(doctorId, today);
}

export async function fetchDoctorPendingCount(doctorId: string): Promise<number> {
  const result = await api.get<{ pagination: { total: number } }>(
    `/api/appointments?status=pendiente&limit=1`
  );
  return result.pagination?.total ?? 0;
}

export async function bookAppointmentForDoctor(
  doctorId: string,
  patientId: string,
  date: string,
  startTime: string
): Promise<Appointment> {
  return api.post<Appointment>("/api/appointments", {
    doctor_id: doctorId,
    patient_id: patientId,
    appointment_date: date,
    start_time: startTime,
  });
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await api.patch(`/api/appointments/${appointmentId}/cancel`);
}

// ============ Patients (for booking) ============

export async function fetchDoctorPatients(doctorId?: string): Promise<Patient[]> {
  const result = await api.get<{ data: Patient[] }>("/api/patients");
  return result.data ?? result as unknown as Patient[];
}
