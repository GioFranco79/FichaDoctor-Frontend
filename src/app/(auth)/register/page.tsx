"use client";

import { useState, FormEvent, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { REGIONES_COMUNAS } from "@/lib/regiones-comunas";
import { ESPECIALIDADES_MEDICAS } from "@/lib/especialidades";

/**
 * Validates Chilean RUT format (XX.XXX.XXX-X or XXXXXXXX-X)
 * and verifies the check digit using modulo 11 algorithm.
 */
function validateRut(rut: string): boolean {
  const cleaned = rut.replace(/\./g, "").replace(/-/g, "");
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const checkDigit = cleaned.slice(-1).toUpperCase();

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  let expectedDigit: string;

  if (remainder === 11) expectedDigit = "0";
  else if (remainder === 10) expectedDigit = "K";
  else expectedDigit = remainder.toString();

  return checkDigit === expectedDigit;
}

/**
 * Formats RUT as user types: 12.345.678-9
 */
function formatRut(value: string): string {
  const cleaned = value.replace(/[^0-9kK]/g, "");
  if (cleaned.length <= 1) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let formatted = "";
  for (let i = body.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formatted = "." + formatted;
    }
    formatted = body[i] + formatted;
  }

  return `${formatted}-${dv}`;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    rut: "",
    fecha_nacimiento: "",
    password: "",
    confirm_password: "",
    role: "" as "Doctor" | "Paciente" | "",
    direccion: "",
    region: "",
    comuna: "",
    especialidad: "",
  });
  const [error, setError] = useState("");
  const [rutError, setRutError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const comunasDisponibles = useMemo(() => {
    if (!formData.region) return [];
    return REGIONES_COMUNAS[formData.region] || [];
  }, [formData.region]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "rut") {
      const formatted = formatRut(value);
      setFormData((prev) => ({ ...prev, rut: formatted }));

      if (formatted.length > 3) {
        if (!validateRut(formatted)) {
          setRutError("RUT inválido");
        } else {
          setRutError("");
        }
      } else {
        setRutError("");
      }
      return;
    }

    if (name === "region") {
      setFormData((prev) => ({ ...prev, region: value, comuna: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.role) {
      setError("Selecciona un tipo de cuenta");
      return;
    }

    if (!validateRut(formData.rut)) {
      setError("El RUT ingresado no es válido");
      return;
    }

    if (!formData.direccion.trim()) {
      setError("Ingresa tu dirección");
      return;
    }

    if (!formData.fecha_nacimiento) {
      setError("Ingresa tu fecha de nacimiento");
      return;
    }

    if (!formData.region) {
      setError("Selecciona una región");
      return;
    }

    if (!formData.comuna) {
      setError("Selecciona una comuna");
      return;
    }

    if (formData.role === "Doctor" && !formData.especialidad) {
      setError("Selecciona una especialidad médica");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        rut: formData.rut,
        fecha_nacimiento: formData.fecha_nacimiento,
        role: formData.role as "Doctor" | "Paciente",
        direccion: formData.direccion,
        region: formData.region,
        comuna: formData.comuna,
        ...(formData.role === "Doctor" && { especialidad: formData.especialidad }),
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          ¡Registro exitoso!
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-400";
  const selectClass =
    "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <>
      <h2 className="text-center text-xl font-semibold text-gray-900 dark:text-white">
        Crear Cuenta
      </h2>
      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        Completa tus datos para registrarte
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className={labelClass}>
              Nombre
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              required
              autoComplete="given-name"
              placeholder="Juan"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="last_name" className={labelClass}>
              Apellido
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              required
              autoComplete="family-name"
              placeholder="Pérez"
              className={inputClass}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className={inputClass}
          />
        </div>

        {/* RUT */}
        <div>
          <label htmlFor="rut" className={labelClass}>
            RUT
          </label>
          <input
            id="rut"
            name="rut"
            type="text"
            value={formData.rut}
            onChange={handleChange}
            required
            placeholder="12.345.678-9"
            maxLength={12}
            className={inputClass}
          />
          {rutError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {rutError}
            </p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label htmlFor="fecha_nacimiento" className={labelClass}>
            Fecha de Nacimiento
          </label>
          <input
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        {/* Tipo de Cuenta */}
        <div>
          <label htmlFor="role" className={labelClass}>
            Tipo de Cuenta
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={selectClass}
          >
            <option value="">Seleccionar...</option>
            <option value="Doctor">Doctor</option>
            <option value="Paciente">Paciente</option>
          </select>
        </div>

        {/* Especialidad (solo para doctores) */}
        {formData.role === "Doctor" && (
          <div>
            <label htmlFor="especialidad" className={labelClass}>
              Especialidad Médica
            </label>
            <select
              id="especialidad"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleChange}
              required
              className={selectClass}
            >
              <option value="">Seleccionar especialidad...</option>
              {ESPECIALIDADES_MEDICAS.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dirección */}
        <div>
          <label htmlFor="direccion" className={labelClass}>
            Dirección
          </label>
          <input
            id="direccion"
            name="direccion"
            type="text"
            value={formData.direccion}
            onChange={handleChange}
            required
            autoComplete="street-address"
            placeholder="Av. Providencia 1234, Depto 56"
            className={inputClass}
          />
        </div>

        {/* Región y Comuna */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="region" className={labelClass}>
              Región
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
              className={selectClass}
            >
              <option value="">Seleccionar región...</option>
              {Object.keys(REGIONES_COMUNAS).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="comuna" className={labelClass}>
              Comuna
            </label>
            <select
              id="comuna"
              name="comuna"
              value={formData.comuna}
              onChange={handleChange}
              required
              disabled={!formData.region}
              className={selectClass}
            >
              <option value="">
                {formData.region ? "Seleccionar comuna..." : "Primero selecciona región"}
              </option>
              {comunasDisponibles.map((comuna) => (
                <option key={comuna} value={comuna}>
                  {comuna}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            className={inputClass}
          />
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label htmlFor="confirm_password" className={labelClass}>
            Confirmar Contraseña
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            minLength={8}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !!rutError}
          className="flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
        >
          {isLoading ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creando cuenta...
            </>
          ) : (
            "Crear Cuenta"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
