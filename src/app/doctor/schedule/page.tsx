"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, Button, Input, Spinner } from "@/components/ui";
import {
  fetchScheduleConfig,
  saveScheduleConfig,
  fetchDaysOff,
  addDayOff,
  deleteDayOff,
  fetchAvailableSlots,
  enableSlot,
  disableSlot,
  fetchTodayAppointments,
  DayOff,
  Appointment,
} from "@/services/doctorService";
import { api } from "@/lib/api";
import useSWR, { mutate } from "swr";

const DAYS_OF_WEEK = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

const SLOT_DURATIONS = [
  { value: 15, label: "15 minutos" },
  { value: 20, label: "20 minutos" },
  { value: 30, label: "30 minutos" },
];

// Days shown in the weekly grid (Monday to Saturday)
const WEEK_DAYS_GRID = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

interface TimeSlot {
  startTime: string;
  endTime: string;
}

function generateTimeSlots(start: string, end: string, duration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  let current = startMinutes;
  while (current + duration <= endMinutes) {
    const slotStart = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
    const slotEnd = `${String(Math.floor((current + duration) / 60)).padStart(2, "0")}:${String((current + duration) % 60).padStart(2, "0")}`;
    slots.push({ startTime: slotStart, endTime: slotEnd });
    current += duration;
  }
  return slots;
}

function getDateForWeekDay(weekStart: Date, targetDayOfWeek: number): string {
  const date = new Date(weekStart);
  const offset = targetDayOfWeek - 1;
  date.setDate(date.getDate() + offset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function SchedulePage() {
  const { profile } = useAuth();
  const doctorId = profile?.id;

  // Schedule config
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Day off form
  const [dayOffDate, setDayOffDate] = useState("");
  const [dayOffReason, setDayOffReason] = useState("");
  const [addingDayOff, setAddingDayOff] = useState(false);

  // Enabled slots: key = "date|startTime", loaded from backend
  const [enabledSlots, setEnabledSlots] = useState<Set<string>>(new Set());

  // Weekly view - current week start (Monday)
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
  };

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const weekStartStr = useMemo(() => {
    const y = weekStart.getFullYear();
    const m = String(weekStart.getMonth() + 1).padStart(2, "0");
    const d = String(weekStart.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [weekStart]);

  // Fetch schedule config
  const { isLoading: loadingConfig } = useSWR(
    doctorId ? ["schedule-config", doctorId] : null,
    async () => {
      const config = await fetchScheduleConfig(doctorId!);
      if (config) {
        setWorkDays(config.work_days);
        setStartTime(config.start_time);
        setEndTime(config.end_time);
        setSlotDuration(config.slot_duration);
      }
      return config;
    }
  );

  // Fetch days off
  const { data: daysOff, isLoading: loadingDaysOff } = useSWR(
    doctorId ? ["days-off", doctorId] : null,
    () => fetchDaysOff(doctorId!)
  );

  // Compute week end date
  const weekEndStr = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const y = end.getFullYear();
    const m = String(end.getMonth() + 1).padStart(2, "0");
    const d = String(end.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [weekStart]);

  // Fetch available slots from backend
  useSWR(
    doctorId ? ["available-slots", doctorId, weekStartStr, weekEndStr] : null,
    async () => {
      const slots = await fetchAvailableSlots(doctorId!, weekStartStr, weekEndStr);
      const newSet = new Set<string>();
      slots.forEach((s) => {
        newSet.add(`${s.date}|${s.start_time.substring(0, 5)}`);
      });
      setEnabledSlots(newSet);
      return slots;
    }
  );

  // Fetch booked appointments for this week
  const { data: weekAppointments } = useSWR(
    doctorId ? ["week-appointments", doctorId, weekStartStr, weekEndStr] : null,
    async () => {
      const result = await api.get<{ data: Appointment[] }>(
        `/api/appointments?startDate=${weekStartStr}&endDate=${weekEndStr}`
      );
      return result.data ?? result as unknown as Appointment[];
    }
  );

  // Build a set of booked slot keys "date|HH:mm" for quick lookup
  const bookedSlots = useMemo(() => {
    const set = new Map<string, Appointment>();
    (weekAppointments || []).forEach((apt: Appointment) => {
      if (apt.status !== "cancelada") {
        const key = `${apt.appointment_date}|${apt.start_time?.substring(0, 5)}`;
        set.set(key, apt);
      }
    });
    return set;
  }, [weekAppointments]);

  // Generate time slots client-side based on current config
  const timeSlots = useMemo(() => {
    return generateTimeSlots(startTime, endTime, slotDuration);
  }, [startTime, endTime, slotDuration]);

  // Get days off dates as a Set for quick lookup
  const daysOffDates = useMemo(() => {
    return new Set((daysOff || []).map((d: DayOff) => d.date));
  }, [daysOff]);

  const handlePrevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleCurrentWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  const handleToggleDay = (day: number) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveConfig = async () => {
    if (!doctorId) return;
    setSaving(true);
    setSaveMessage("");
    try {
      await saveScheduleConfig({
        doctor_id: doctorId,
        work_days: workDays,
        start_time: startTime,
        end_time: endTime,
        slot_duration: slotDuration,
      });
      setSaveMessage("Configuración guardada exitosamente");
      mutate(["schedule-config", doctorId]);
    } catch {
      setSaveMessage("Error al guardar la configuración");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleAddDayOff = async () => {
    if (!doctorId || !dayOffDate) return;
    setAddingDayOff(true);
    try {
      await addDayOff(doctorId, dayOffDate, dayOffReason || undefined);
      setDayOffDate("");
      setDayOffReason("");
      mutate(["days-off", doctorId]);
    } catch {
      alert("Error al agregar día libre");
    } finally {
      setAddingDayOff(false);
    }
  };

  const handleDeleteDayOff = async (id: string) => {
    if (!doctorId) return;
    try {
      await deleteDayOff(id);
      mutate(["days-off", doctorId]);
    } catch {
      alert("Error al eliminar día libre");
    }
  };

  // Toggle a slot between grey (disabled) and green (enabled/available)
  const handleToggleSlot = async (dateStr: string, slotStartTime: string, slotEndTime: string) => {
    if (!doctorId) return;
    const key = `${dateStr}|${slotStartTime}`;
    const isCurrentlyEnabled = enabledSlots.has(key);

    // Optimistic update
    setEnabledSlots((prev) => {
      const next = new Set(prev);
      if (isCurrentlyEnabled) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    try {
      if (isCurrentlyEnabled) {
        await disableSlot(doctorId, dateStr, slotStartTime);
      } else {
        await enableSlot(doctorId, dateStr, slotStartTime, slotEndTime);
      }
    } catch {
      // Revert on error
      setEnabledSlots((prev) => {
        const next = new Set(prev);
        if (isCurrentlyEnabled) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Agenda
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configura tus horarios de atención y días libres
        </p>
      </div>

      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración de horario
          </h2>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Work days */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Días laborales
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleToggleDay(day.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    workDays.includes(day.value)
                      ? "bg-primary-600 text-white dark:bg-primary-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Hora de inicio"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="Hora de término"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          {/* Slot duration */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Duración de cita
            </label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {SLOT_DURATIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-4">
            <Button onClick={handleSaveConfig} loading={saving}>
              Guardar configuración
            </Button>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes("Error") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Days Off */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Días libres
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Add day off form */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <Input
                label="Fecha"
                type="date"
                value={dayOffDate}
                onChange={(e) => setDayOffDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Motivo (opcional)"
                type="text"
                placeholder="Ej: Vacaciones"
                value={dayOffReason}
                onChange={(e) => setDayOffReason(e.target.value)}
              />
            </div>
            <Button onClick={handleAddDayOff} loading={addingDayOff} disabled={!dayOffDate}>
              Agregar
            </Button>
          </div>

          {/* Days off list */}
          {loadingDaysOff ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : daysOff && daysOff.length > 0 ? (
            <div className="space-y-2">
              {daysOff.map((dayOff: DayOff) => (
                <div
                  key={dayOff.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(dayOff.date + "T12:00:00").toLocaleDateString("es-CL", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {dayOff.reason && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dayOff.reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteDayOff(dayOff.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
              No hay días libres configurados
            </p>
          )}
        </CardBody>
      </Card>

      {/* Weekly Schedule Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vista Semanal
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                ← Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                Siguiente →
              </Button>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Semana del{" "}
            {new Date(weekStartStr + "T12:00:00").toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardHeader>
        <CardBody>
          {/* Color legend */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-green-500"></span>
              <span className="text-gray-700 dark:text-gray-300">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-red-500"></span>
              <span className="text-gray-700 dark:text-gray-300">Cita agendada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-yellow-400"></span>
              <span className="text-gray-700 dark:text-gray-300">Pasado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-gray-400"></span>
              <span className="text-gray-700 dark:text-gray-300">No disponible (click para habilitar)</span>
            </div>
          </div>

          {timeSlots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      Hora
                    </th>
                    {WEEK_DAYS_GRID.map((day) => {
                      const dateStr = getDateForWeekDay(weekStart, day.value);
                      return (
                        <th
                          key={day.value}
                          className="border border-gray-200 bg-gray-50 px-2 py-2 text-center font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <div>{day.label}</div>
                          <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                            {new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIndex) => (
                    <tr key={slotIndex}>
                      <td className="whitespace-nowrap border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      {WEEK_DAYS_GRID.map((day) => {
                        const dateStr = getDateForWeekDay(weekStart, day.value);
                        const slotKey = `${dateStr}|${slot.startTime}`;
                        const isEnabled = enabledSlots.has(slotKey);
                        const isDayOff = daysOffDates.has(dateStr);

                        // Check if slot is in the past
                        const now = new Date();
                        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                        const currentMinutes = now.getHours() * 60 + now.getMinutes();
                        const [slotH, slotM] = slot.startTime.split(":").map(Number);
                        const slotMinutes = slotH * 60 + slotM;

                        const isPastDay = dateStr < todayStr;
                        const isPastSlotToday = dateStr === todayStr && slotMinutes < currentMinutes;
                        const isPast = isPastDay || isPastSlotToday;

                        // If it's in the past, show yellow and non-clickable
                        if (isPast) {
                          return (
                            <td
                              key={day.value}
                              className="border border-gray-200 bg-yellow-400 px-1 py-1.5 text-center text-xs dark:border-gray-700 dark:bg-yellow-500"
                              title="Horario pasado"
                            >
                              <span className="text-yellow-800 dark:text-yellow-900 font-medium">—</span>
                            </td>
                          );
                        }

                        // If it's a day off, show as grey and non-clickable
                        if (isDayOff) {
                          return (
                            <td
                              key={day.value}
                              className="border border-gray-200 bg-gray-300 px-1 py-1.5 text-center text-xs dark:border-gray-700 dark:bg-gray-600"
                              title="Día libre"
                            >
                              <span className="text-gray-500 dark:text-gray-400">—</span>
                            </td>
                          );
                        }

                        // Check if slot has a booked appointment
                        const bookedAppointment = bookedSlots.get(slotKey);
                        if (bookedAppointment) {
                          const patientName = bookedAppointment.patient
                            ? `${bookedAppointment.patient.first_name} ${bookedAppointment.patient.last_name}`
                            : "Paciente";
                          return (
                            <td
                              key={day.value}
                              className="border border-gray-200 bg-red-500 px-1 py-1.5 text-center text-xs dark:border-gray-700 dark:bg-red-600"
                              title={`Cita: ${patientName} - ${bookedAppointment.status}`}
                            >
                              <span className="font-medium text-white truncate block">
                                {patientName.split(" ")[0]}
                              </span>
                            </td>
                          );
                        }

                        // Clickable cell: grey by default, green when enabled
                        return (
                          <td
                            key={day.value}
                            onClick={() => handleToggleSlot(dateStr, slot.startTime, slot.endTime)}
                            className={`cursor-pointer border border-gray-200 px-1 py-1.5 text-center text-xs transition-colors dark:border-gray-700 ${
                              isEnabled
                                ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                            }`}
                            title={isEnabled ? "Disponible - Click para deshabilitar" : "No disponible - Click para habilitar"}
                          >
                            {isEnabled && (
                              <span className="font-medium text-white">
                                Disponible
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
              Configura el horario de inicio, término y duración para ver la grilla semanal.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
