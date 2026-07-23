"use client";

import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

export default function Home() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              FichaDoctor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Gestión médica digital,{" "}
            <span className="text-primary-600">simple y gratuita</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            FichaDoctor es la plataforma que conecta a doctores y pacientes.
            Administra tu agenda, fichas clínicas y citas médicas desde un solo lugar,
            sin complicaciones y sin costo.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-primary-700"
            >
              Comenzar gratis
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-20 dark:border-gray-800 dark:bg-gray-800/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Todo lo que necesitas para tu consulta
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600 dark:text-gray-400">
            Herramientas diseñadas para optimizar el tiempo del profesional de salud
            y mejorar la experiencia del paciente.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Agenda Inteligente
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Configura tu disponibilidad, duración de consultas y días de atención.
                Los pacientes reservan directamente en tus horarios libres.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-100 dark:bg-secondary-900/30">
                <svg className="h-6 w-6 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Fichas Clínicas Digitales
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Registra diagnósticos, notas clínicas, recetas y antecedentes
                de cada atención de forma organizada y segura.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Multi-Rol
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Doctores, pacientes y secretarias — cada uno con su panel personalizado
                y permisos específicos para un flujo de trabajo eficiente.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Reserva en Minutos
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Los pacientes buscan profesionales por especialidad, eligen un horario
                disponible y confirman su cita en pocos clics.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Recetas y Documentos
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Genera recetas médicas en PDF y mantén un registro completo
                de la documentación clínica de cada paciente.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Seguro y Privado
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Datos protegidos con Row Level Security. Solo el profesional autorizado
                puede acceder a la información clínica de sus pacientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            ¿Quién puede usar FichaDoctor?
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Doctores
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Administra tu agenda, registra fichas clínicas, genera recetas
                y gestiona a tus pacientes desde un panel centralizado.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-900/30">
                <svg className="h-8 w-8 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Pacientes
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Busca profesionales, agenda citas en horarios disponibles
                y revisa tu historial de atenciones médicas.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Secretarias
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Gestiona la agenda del doctor, habilita horarios
                y coordina las citas de los pacientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-100 bg-primary-600 px-4 py-16 dark:border-gray-800 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Comienza a digitalizar tu consulta hoy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
            Sin costos, sin tarjeta de crédito. Crea tu cuenta en segundos
            y empieza a gestionar tus citas y fichas médicas.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary-600 shadow-md transition-colors hover:bg-gray-100"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-8 dark:border-gray-700 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 FichaDoctor. Plataforma gratuita de gestión médica.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
