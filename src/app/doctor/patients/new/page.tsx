"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader, CardFooter, Button, Input } from "@/components/ui";
import { createPatient } from "@/services/doctorService";

function validateRut(rut: string): boolean {
  // Remove dots and hyphens
  const clean = rut.replace(/[.\-]/g, "").toUpperCase();
  if (clean.length < 8 || clean.length > 9) return false;

  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expected: string;

  if (remainder === 11) expected = "0";
  else if (remainder === 10) expected = "K";
  else expected = remainder.toString();

  return verifier === expected;
}

export default function NewPatientPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const doctorId = profile?.id;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    rut: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    address: "",
    city: "",
    insurance: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = "El nombre es requerido";
    if (!formData.last_name.trim()) newErrors.last_name = "El apellido es requerido";
    if (!formData.rut.trim()) {
      newErrors.rut = "El RUT es requerido";
    } else if (!validateRut(formData.rut)) {
      newErrors.rut = "El RUT no es válido";
    }
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
    if (!formData.birth_date) newErrors.birth_date = "La fecha de nacimiento es requerida";
    if (!formData.gender) newErrors.gender = "El género es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !doctorId) return;

    setSubmitting(true);
    try {
      await createPatient(doctorId, formData);
      router.push("/doctor/patients");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al crear paciente";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nuevo Paciente
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Registra un nuevo paciente en el sistema
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Datos del paciente
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombre"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                placeholder="Juan"
              />
              <Input
                label="Apellido"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                placeholder="Pérez"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="RUT"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                error={errors.rut}
                placeholder="12.345.678-9"
                helperText="Formato: 12.345.678-9"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="paciente@email.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Teléfono"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+56 9 1234 5678"
              />
              <Input
                label="Fecha de nacimiento"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                error={errors.birth_date}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Género
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    errors.gender
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/20"
                  }`}
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.gender && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.gender}
                  </p>
                )}
              </div>
              <Input
                label="Previsión de salud"
                name="insurance"
                value={formData.insurance}
                onChange={handleChange}
                placeholder="Fonasa / Isapre"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle 123"
              />
              <Input
                label="Ciudad"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Santiago"
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
              Registrar paciente
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
