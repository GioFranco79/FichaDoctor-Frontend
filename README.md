# FichaDoctor - Frontend

## Descripción

FichaDoctor es una plataforma de gestión médica digital que permite a doctores, pacientes y secretarias gestionar citas médicas, fichas clínicas, recetas, solicitudes de exámenes y mensajería interna.  Esta App esta pensada para funcionar en el territorio de Chile, con RUT, Regiones y Comunas de Chile.

Dirección de proyecto deployado:
https://ficha-doctor-git-main-giovanni-franco-calfiqueos-projects.vercel.app

## Tecnologías

- **Framework:** Next.js 14 (React 18)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Gestión de datos:** SWR (stale-while-revalidate)
- **Despliegue:** Vercel
- **Autenticación:** JWT con refresh token (localStorage + cookies)

## Funcionalidades principales

### Usuario Doctor
- **Dashboard** con citas del día y pendientes
- **Agenda semanal** con grilla de celdas (verde=disponible, rojo=ocupado, gris=no habilitado, amarillo=pasado)
- **Gestión de pacientes** listado de pacientes atendidos
- **Fichas médicas** con historial clínico por paciente
- **Atención de pacientes** con formulario de síntomas e indicaciones
- **Generación de PDF** para recetas médicas y solicitudes de exámenes
- **Mensajería** con pacientes
- **Gestión de secretarias**

### Usuario Paciente
- **Búsqueda de doctores** por región, comuna y especialidad
- **Agendamiento de citas** seleccionando horarios disponibles
- **Mis citas** con historial y opción de cancelar
- **Mis atenciones** con fichas médicas propias
- **Mensajería** con doctores que lo han atendido

### Usuario Secretaria
- **Agenda del doctor** con la misma grilla semanal (habilitar/deshabilitar slots)
- **Gestión de citas** búsqueda de paciente por RUT y asignación de horarios
- **Dashboard** con resumen de citas del doctor asignado

## Árbol de directorios

```
Frontend/
├── src/
│   ├── app/                           # Páginas (App Router de Next.js)
│   │   ├── (auth)/                    # Páginas públicas de autenticación
│   │   │   ├── login/page.tsx         # Inicio de sesión
│   │   │   ├── register/page.tsx      # Registro de nuevos usuarios
│   │   │   └── forgot-password/page.tsx
│   │   ├── doctor/                    # Vistas del Doctor
│   │   │   ├── dashboard/page.tsx     # Panel principal
│   │   │   ├── schedule/page.tsx      # Gestión de agenda semanal
│   │   │   ├── patients/page.tsx      # Listado de pacientes
│   │   │   ├── medical-records/page.tsx # Fichas médicas
│   │   │   ├── attend/[id]/page.tsx   # Atención de paciente
│   │   │   ├── messages/page.tsx      # Mensajería
│   │   │   ├── secretaries/page.tsx   # Gestión de secretarias
│   │   │   └── layout.tsx             # Layout del doctor
│   │   ├── patient/                   # Vistas del Paciente
│   │   │   ├── dashboard/page.tsx     # Panel principal
│   │   │   ├── doctors/page.tsx       # Búsqueda de doctores
│   │   │   ├── doctors/[id]/book/page.tsx # Agendar cita
│   │   │   ├── appointments/page.tsx  # Mis citas
│   │   │   ├── medical-records/page.tsx # Mis atenciones
│   │   │   ├── messages/page.tsx      # Mensajería
│   │   │   └── layout.tsx             # Layout del paciente
│   │   ├── secretary/                 # Vistas de la Secretaria
│   │   │   ├── dashboard/page.tsx     # Panel principal
│   │   │   ├── schedule/page.tsx      # Agenda del doctor
│   │   │   ├── appointments/page.tsx  # Gestión de citas
│   │   │   └── layout.tsx             # Layout de secretaria
│   │   ├── layout.tsx                 # Layout raíz
│   │   ├── page.tsx                   # Landing page
│   │   └── globals.css                # Estilos globales
│   ├── components/                    # Componentes reutilizables
│   │   ├── ui/                        # Componentes UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   └── layout/                    # Componentes de layout
│   │       └── Sidebar.tsx            # Menú lateral con navegación por rol
│   ├── context/                       # Contextos de React
│   │   └── AuthContext.tsx            # Autenticación y sesión
│   ├── lib/                           # Utilidades y datos
│   │   ├── api.ts                     # Cliente HTTP centralizado
│   │   ├── auth.ts                    # Manejo de tokens (access/refresh)
│   │   ├── chileanData.ts            # Regiones y comunas de Chile
│   │   ├── especialidades.ts         # Lista de especialidades médicas
│   │   └── regiones-comunas.ts       # Datos de regiones/comunas
│   ├── services/                      # Servicios de API
│   │   ├── doctorService.ts           # Funciones para el rol Doctor
│   │   ├── patientService.ts          # Funciones para el rol Paciente
│   │   └── secretaryService.ts        # Funciones para el rol Secretaria
│   └── middleware.ts                  # Middleware de protección de rutas
├── public/                            # Archivos estáticos
├── package.json                       # Dependencias y scripts
├── next.config.js                     # Configuración de Next.js
├── tailwind.config.ts                 # Configuración de Tailwind CSS
├── tsconfig.json                      # Configuración de TypeScript
├── postcss.config.js                  # Configuración de PostCSS
├── .env.example                       # Variables de entorno requeridas
├── .gitignore                         # Archivos excluidos de Git
└── README.md                          # Este archivo
```

## Variables de entorno

Configurar en el dashboard de Vercel:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL del backend desplegado (ej: `https://fichadoctor-api.vercel.app`) |

## Instalación local

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local

# Editar .env.local con la URL del backend
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Ejecutar en modo desarrollo
npm run dev
```

## Despliegue en Vercel

1. Subir este repositorio a GitHub
2. Importar en Vercel como nuevo proyecto
3. Vercel detecta automáticamente Next.js
4. Configurar la variable `NEXT_PUBLIC_API_URL` con la URL del backend en producción
5. Desplegar

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:3000` |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta el linter de código |

## Diseño

- Tema oscuro por defecto con opción de modo claro
- Diseño responsivo (mobile-first)
- Componentes reutilizables con Tailwind CSS
- Sidebar con navegación diferenciada por rol

## Autor

Proyecto desarrollado como plataforma de gestión médica digital.
