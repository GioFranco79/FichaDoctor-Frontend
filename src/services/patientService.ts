import { api } from "@/lib/api";

// ============ Types ============

export interface Doctor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  specialty?: string;
  region?: string;
  comuna?: string;
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface PatientAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  doctor?: {
    id: string;
    first_name: string;
    last_name: string;
    especialidad?: string;
    direccion?: string;
    comuna?: string;
    region?: string;
  };
  created_at: string;
}

export interface PatientMedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  clinical_notes: string;
  background: string;
  created_at: string;
  updated_at: string;
  doctor?: Doctor;
}

// ============ Doctors ============

export async function fetchDoctors(search?: string, specialty?: string, region?: string, comuna?: string): Promise<Doctor[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (specialty) params.set("specialty", specialty);
  if (region) params.set("region", region);
  if (comuna) params.set("comuna", comuna);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get<Doctor[]>(`/api/doctors${query}`);
}

// ============ Availability ============

export async function fetchDoctorAvailability(
  doctorId: string,
  startDate: string,
  endDate: string
): Promise<AvailableSlot[]> {
  return api.get<AvailableSlot[]>(
    `/api/schedule/doctor/${doctorId}/availability?startDate=${startDate}&endDate=${endDate}`
  );
}

// ============ Appointments ============

export async function bookAppointment(
  doctorId: string,
  date: string,
  startTime: string
): Promise<PatientAppointment> {
  return api.post<PatientAppointment>("/api/appointments", {
    doctor_id: doctorId,
    appointment_date: date,
    start_time: startTime,
  });
}

export async function fetchMyAppointments(patientId?: string): Promise<PatientAppointment[]> {
  const result = await api.get<{ data: PatientAppointment[] }>("/api/appointments");
  return result.data ?? result as unknown as PatientAppointment[];
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await api.patch(`/api/appointments/${appointmentId}/cancel`);
}

// ============ Medical Records ============

export async function fetchMyMedicalRecords(patientId?: string): Promise<PatientMedicalRecord[]> {
  return api.get<PatientMedicalRecord[]>("/api/medical-records");
}
