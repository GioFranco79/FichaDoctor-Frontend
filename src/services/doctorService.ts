import { api } from "@/lib/api";

// ============ Types ============

export interface ScheduleConfig {
  id?: string;
  doctor_id: string;
  work_days: number[];
  start_time: string;
  end_time: string;
  slot_duration: number;
}

export interface DayOff {
  id: string;
  doctor_id: string;
  date: string;
  reason?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  rut: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  address: string;
  city: string;
  insurance: string;
  created_at: string;
}

export interface PatientCreateData {
  first_name: string;
  last_name: string;
  rut: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  address: string;
  city: string;
  insurance: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  clinical_notes: string;
  background: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordCreateData {
  patient_id: string;
  diagnosis: string;
  clinical_notes?: string;
  background?: string;
}

export interface Secretary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  rut: string;
  is_active: boolean;
  created_at: string;
}

export interface SecretaryCreateData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  rut: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  patient?: Patient;
  created_at: string;
}

// ============ Schedule ============

export async function fetchScheduleConfig(doctorId: string): Promise<ScheduleConfig | null> {
  try {
    return await api.get<ScheduleConfig>(`/api/schedule/doctor/${doctorId}/config`);
  } catch {
    return null;
  }
}

export async function saveScheduleConfig(config: Omit<ScheduleConfig, "id">): Promise<ScheduleConfig> {
  // El backend maneja upsert internamente
  return api.post<ScheduleConfig>("/api/schedule", {
    doctor_id: config.doctor_id,
    workDays: config.work_days,
    startTime: config.start_time,
    endTime: config.end_time,
    slotDuration: config.slot_duration,
  });
}

export async function fetchDaysOff(doctorId: string): Promise<DayOff[]> {
  return api.get<DayOff[]>(`/api/schedule/doctor/${doctorId}/days-off`);
}

export async function addDayOff(doctorId: string, date: string, reason?: string): Promise<DayOff> {
  return api.post<DayOff>("/api/schedule/day-off", {
    doctor_id: doctorId,
    date,
    reason,
  });
}

export async function deleteDayOff(id: string): Promise<void> {
  await api.delete(`/api/schedule/day-off/${id}`);
}

// ============ Available Slots ============

export interface AvailableSlotRecord {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export async function fetchAvailableSlots(doctorId: string, startDate: string, endDate: string): Promise<AvailableSlotRecord[]> {
  return api.get<AvailableSlotRecord[]>(`/api/schedule/available-slots?doctor_id=${doctorId}&startDate=${startDate}&endDate=${endDate}`);
}

export async function enableSlot(doctorId: string, date: string, startTime: string, endTime: string): Promise<AvailableSlotRecord> {
  return api.post<AvailableSlotRecord>("/api/schedule/available-slots", {
    doctor_id: doctorId,
    date,
    start_time: startTime,
    end_time: endTime,
  });
}

export async function disableSlot(doctorId: string, date: string, startTime: string): Promise<void> {
  await api.delete(`/api/schedule/available-slots?doctor_id=${doctorId}&date=${date}&start_time=${startTime}`);
}

// ============ Weekly View ============

export interface WeeklySlot {
  startTime: string;
  endTime: string;
  status: "verde" | "rojo" | "gris";
  appointment: {
    id: string;
    paciente: string;
    paciente_id: string;
    status: string;
  } | null;
}

export interface WeekDay {
  date: string;
  dayName: string;
  dayOfWeek: number;
  isWorkDay: boolean;
  isDayOff: boolean;
  slots: WeeklySlot[];
}

export interface WeeklyView {
  doctorId: string;
  startDate: string;
  endDate: string;
  config: {
    startTime: string;
    endTime: string;
    slotDuration: number;
    workDays: number[];
  };
  weekDays: WeekDay[];
}

export async function fetchWeeklyView(startDate: string, doctorId?: string): Promise<WeeklyView> {
  const params = new URLSearchParams({ startDate });
  if (doctorId) params.set("doctor_id", doctorId);
  return api.get<WeeklyView>(`/api/schedule/weekly-view?${params.toString()}`);
}

// ============ Patients ============

export interface DoctorPatient {
  id: string;
  first_name: string;
  last_name: string;
  rut: string;
  email: string;
}

export async function fetchMyPatients(doctorId: string): Promise<DoctorPatient[]> {
  return api.get<DoctorPatient[]>(`/api/doctors/my-patients`);
}

export async function fetchPatients(doctorId?: string, search?: string): Promise<Patient[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString() ? `?${params.toString()}` : "";
  const result = await api.get<{ data: Patient[] }>(`/api/patients${query}`);
  return result.data ?? result as unknown as Patient[];
}

export async function fetchPatientById(id: string): Promise<Patient> {
  return api.get<Patient>(`/api/patients/${id}`);
}

export async function createPatient(
  doctorId: string,
  patientData: PatientCreateData
): Promise<Patient> {
  return api.post<Patient>("/api/patients", patientData);
}

export async function updatePatient(
  id: string,
  updates: Partial<PatientCreateData>
): Promise<Patient> {
  return api.put<Patient>(`/api/patients/${id}`, updates);
}

// ============ Medical Records ============

export async function fetchMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
  return api.get<MedicalRecord[]>(`/api/medical-records/patient/${patientId}`);
}

export async function createMedicalRecord(
  doctorId: string,
  recordData: MedicalRecordCreateData
): Promise<MedicalRecord> {
  return api.post<MedicalRecord>("/api/medical-records/create", recordData);
}

export async function updateMedicalRecord(
  id: string,
  updates: Partial<MedicalRecordCreateData>
): Promise<MedicalRecord> {
  return api.put<MedicalRecord>(`/api/medical-records/${id}`, updates);
}

// ============ Secretaries ============

export async function fetchSecretaries(doctorId?: string): Promise<Secretary[]> {
  return api.get<Secretary[]>("/api/admin/my-secretaries");
}

export async function registerSecretary(
  doctorId: string,
  secretaryData: SecretaryCreateData
): Promise<void> {
  await api.post("/api/auth/register-secretary", secretaryData);
}

export async function unlinkSecretary(secretaryId: string): Promise<void> {
  await api.delete(`/api/admin/secretaries/${secretaryId}`);
}

// ============ Appointments ============

export async function fetchTodayAppointments(doctorId: string): Promise<Appointment[]> {
  const today = new Date().toISOString().split("T")[0];
  const result = await api.get<{ data: Appointment[] }>(
    `/api/appointments?date=${today}`
  );
  return result.data ?? result as unknown as Appointment[];
}

export async function fetchPendingAppointments(doctorId: string): Promise<Appointment[]> {
  const result = await api.get<{ data: Appointment[] }>(
    `/api/appointments?status=pendiente`
  );
  return result.data ?? result as unknown as Appointment[];
}

export async function fetchAppointmentsCount(
  doctorId: string,
  status?: string
): Promise<number> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("limit", "1");
  const result = await api.get<{ pagination: { total: number } }>(
    `/api/appointments?${params.toString()}`
  );
  return result.pagination?.total ?? 0;
}

export async function fetchPatientsCount(doctorId: string): Promise<number> {
  const result = await api.get<{ pagination: { total: number } }>(
    `/api/patients?limit=1`
  );
  return result.pagination?.total ?? 0;
}
