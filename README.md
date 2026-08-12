# SportMetric Academic

Plataforma web full stack para la consulta, captura y administracion de protocolos de medicion fisica y antropometrica en contextos academicos. Incluye vista publica para visitantes y evaluadores, sistema de autenticacion con recuperacion de contrasena, panel administrativo con CRUDs completos y analiticas con graficos.

Este README es la guia oficial del proyecto. Cubre: que es, como instalarlo, como usarlo, como esta construido y como extenderlo. Si vienes del codigo, empieza por la [Tabla de contenidos](#tabla-de-contenidos).

---

## Tabla de contenidos

1. [Vision general](#vision-general)
2. [Estado del proyecto](#estado-del-proyecto)
3. [Caracteristicas principales](#caracteristicas-principales)
4. [Stack tecnologico](#stack-tecnologico)
5. [Arquitectura del sistema](#arquitectura-del-sistema)
6. [Estructura del repositorio](#estructura-del-repositorio)
7. [Requisitos previos](#requisitos-previos)
8. [Instalacion paso a paso](#instalacion-paso-a-paso)
9. [Configuracion](#configuracion)
10. [Guia de uso](#guia-de-uso)
11. [Referencia tecnica](#referencia-tecnica)
12. [Modelo de datos](#modelo-de-datos)
13. [API REST](#api-rest)
14. [Seguridad](#seguridad)
15. [Calidad y pruebas](#calidad-y-pruebas)
16. [Despliegue](#despliegue)
17. [Troubleshooting](#troubleshooting)
18. [Convenciones del proyecto](#convenciones-del-proyecto)
19. [Documentacion relacionada](#documentacion-relacionada)

---

## Vision general

### Problema que resuelve

En las instituciones academicas que imparten programas de educacion fisica, deporte o ciencias del movimiento, los protocolos de medicion antropometrica (peso, talla, pliegues cutaneos, fuerza, resistencia, etc.) suelen:

- vivir en documentos PDF o hojas de calculo dispersas;
- cambiar de version con frecuencia segun el docente o la cohorte;
- requerir transcripcion manual a formatos estadisticos;
- no contar con trazabilidad de quien midio a quien y cuando.

### Solucion

SportMetric Academic centraliza todo eso en una plataforma web que:

- ofrece un catalogo navegable de protocolos por categoria;
- estandariza la captura con una Ficha Tecnica base obligatoria y campos personalizables;
- persiste todas las evaluaciones en una base de datos relacional;
- permite al administrador crear, editar y versionar los protocolos desde una interfaz web;
- expone analiticas para tomar decisiones academicas.

### Tipo de usuarios

| Rol | Acceso | Capacidades |
| --- | --- | --- |
| Visitante | Publico | Consultar categorias, protocolos y capturar evaluaciones. |
| Evaluador | Publico + login opcional | Igual que visitante, pero puede guardar evaluaciones a su nombre. |
| Administrador | `/admin` con login | CRUD completo de usuarios, categorias, protocolos, evaluaciones y estadisticas. |

---

## Estado del proyecto

| Area | Estado |
| --- | --- |
| Frontend React 19 + Vite | Listo |
| Backend Node.js 22 + Express 5 + TypeScript | Listo |
| Base de datos PostgreSQL 16 con Prisma 7 | Listo |
| Autenticacion JWT + Argon2 + refresh tokens | Listo |
| Recuperacion de contrasena con SHA-256 | Listo |
| Panel administrativo completo | Listo |
| Editor de Protocolos de 7 pestanas | Listo |
| Formularios dinamicos persistidos en JSONB | Listo |
| Persistencia de evaluaciones | Listo |
| Analiticas con Recharts | Listo |
| Modo `local` (sin backend) y modo `api` | Listo |
| Cobertura de pruebas 227/227 | Listo |
| CI con GitHub Actions | Listo |
| Internacionalizacion | Pendiente |
| Versionado del API | Pendiente |

---

## Caracteristicas principales

### Para visitantes y evaluadores

- Catalogo publico de categorias y protocolos.
- Vista detallada de cada protocolo con 7 secciones navegables:
  1. Objetivo.
  2. Materiales.
  3. Descripcion.
  4. Checklist.
  5. Pasos (con video).
  6. Criterios de interrupcion.
  7. Registro de datos (con formulario dinamico).
- Ficha Tecnica base obligatoria en todo registro: `id_estudiante`, `evaluado`, `evaluador`.
- Campos personalizables configurados por el administrador.
- Validacion de campos obligatorios antes de guardar.
- Persistencia de la evaluacion en la base de datos.
- Mensaje de confirmacion tras guardar exitosamente.

### Para administradores

- Login seguro con Argon2.
- Menu de usuario con logout, panel admin y perfil.
- Dashboard con resumen general (usuarios, protocolos, evaluaciones, actividad reciente).
- CRUD de Usuarios con busqueda y filtro por rol.
- CRUD de Categorias con color picker libre (cualquier valor hex).
- CRUD de Protocolos con editor de 7 pestanas.
- Editor dinamico de campos personalizados con 6 tipos:
  - text, number, date, textarea, select, checkbox.
- Validacion de nombres reservados (`id_estudiante`, `evaluado`, `evaluador`) para evitar colisiones con la Ficha Tecnica base.
- CRUD de Evaluaciones con vista de detalle, edicion, eliminacion y exportacion PDF/CSV.
- Pagina de Estadisticas con graficos:
  - Tarjetas de resumen.
  - Evaluaciones por dia (linea).
  - Top 5 protocolos mas evaluados (barras).
  - Distribucion por categoria (pie).
  - Exportacion a CSV y PDF.
- Pagina de Configuracion del sistema.

### Para desarrolladores

- Arquitectura por capas limpia.
- Inyeccion de dependencias (`xhrFactory.js`).
- Cliente HTTP basado en `XMLHttpRequest` para evitar bloqueos de extensiones.
- Proxy de Vite para evitar problemas de CORS en desarrollo.
- Headers anti-cache en endpoints dinamicos.
- Codigo documentado en espanol, sin emojis.
- Tests con cobertura verificada.
- CI automatica.

---

## Stack tecnologico

### Frontend

| Tecnologia | Version | Rol |
| --- | --- | --- |
| React | 19 | UI declarativa y componentes. |
| Vite | 8 | Bundler y dev server con HMR + SWC. |
| React Router | 7 | Ruteo con `<Outlet />`, `lazy` y `ProtectedRoute`. |
| Tailwind CSS | 3 | Sistema de diseno utility-first. |
| Framer Motion | 12 | Animaciones y transiciones. |
| Lucide React | 1 | Iconografia consistente. |
| Recharts | 3 | Graficos para el panel admin. |
| jsPDF + jsPDF-AutoTable | 4 / 5 | Exportacion a PDF de evaluaciones. |
| clsx + tailwind-merge | 2 / 3 | Utilidades para composicion de clases. |
| Vitest | 4 | Test runner compatible con Vite. |
| Testing Library | 16 | Renderizado y queries semanticas. |
| jsdom | 29 | DOM emulado para tests. |
| ESLint | 9 | Linter con plugin `react-hooks`. |

### Backend

| Tecnologia | Version | Rol |
| --- | --- | --- |
| Node.js | 22 LTS | Runtime del servidor. |
| Express | 5 | Framework HTTP. |
| TypeScript | 5 | Tipado estricto. |
| Prisma | 7 | ORM con soporte JSONB + adapter PG. |
| PostgreSQL | 16 | Base de datos relacional. |
| Argon2 | 0.44 | Hashing de contrasenas. |
| jsonwebtoken | 9 | Emision y verificacion de JWT. |
| Helmet | 8 | Headers de seguridad (CSP, XSS, etc.). |
| cors | 2 | Configuracion de origenes cruzados. |
| express-rate-limit | 8 | Limitacion de peticiones por IP. |
| cookie-parser | 1 | Parser de cookies para refresh tokens. |
| Pino + pino-http | 10 / 11 | Logger estructurado + logger HTTP. |
| Zod | 4 | Validacion de payloads. |
| Swagger (swagger-jsdoc + swagger-ui-express) | 6 / 5 | Documentacion interactiva del API. |
| Vitest + Supertest | 4 / 7 | Tests de integracion. |

### Justificacion de elecciones

- **PostgreSQL + Prisma**: el uso academico exige integridad referencial (categorias-protocolos, protocolos-evaluaciones) y la posibilidad de campos flexibles (JSONB para `FormSchema`).
- **Express 5**: API REST madura, ecosistema amplio y compatibilidad con middleware estandar.
- **React 19**: modelo de componentes maduro, server components disponibles para futuro, ecosistema amplio.
- **Vite**: arranque en frio casi instantaneo, HMR muy rapido, integracion natural con Vitest.
- **Argon2 en lugar de bcrypt**: ganador del Password Hashing Competition, parametros configurables, mejor resistencia a GPU y ataques side-channel.
- **JWT separados (access + refresh)**: el access de corta duracion reduce el riesgo de exposicion; el refresh rotativo permite cerrar sesion de verdad.
- **JSONB para `FormSchema`**: permite al administrador agregar campos sin refactorizar el backend.

---

## Arquitectura del sistema

### Diagrama general

```mermaid
flowchart LR
    V[Visitante] --> F[Frontend React 19]
    A[Administrador] --> F
    F -->|modo local| J[JSON locales en frontend/src/data]
    F -->|modo api| B[Backend Express 5 + TypeScript]
    B --> P[Prisma ORM]
    P --> DB[(PostgreSQL 16)]
    F -->|HTTPS| CDN[Vercel CDN]
    B -->|HTTPS| Render[Render Web Service]
    DB -->|TLS| RenderDB[Render PostgreSQL]
```

### Capas del backend

```mermaid
flowchart TD
    Cliente[Cliente HTTP] --> Helmet
    Helmet --> CORS
    CORS --> RateLimit
    RateLimit --> Route[Route]
    Route --> AuthMW[authenticate]
    AuthMW --> AuthzMW[authorize]
    AuthzMW --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Prisma
    Prisma --> DB[(PostgreSQL)]
    Controller --> ApiResponse
    Service --> ApiError
    ApiError --> ErrorFilter
    ErrorFilter --> ApiResponse
```

### Capas del frontend

```mermaid
flowchart TD
    Browser[Navegador] --> Router[React Router 6]
    Router --> PublicLayout[MainLayout]
    Router --> AuthLayout[AuthLayout]
    Router --> AdminLayout[AdminLayout]
    PublicLayout --> PublicPages[Paginas publicas]
    AuthLayout --> AuthPages[Login / Forgot / Reset]
    AdminLayout --> AdminPages[Dashboard / CRUDs / Analytics]
    PublicPages --> Services[Servicios]
    AuthPages --> Services
    AdminPages --> Services
    Services --> XhrFactory[xhrFactory.js]
    XhrFactory --> XHR[XMLHttpRequest]
    XHR --> Backend[Backend API]
```

### Pipeline de datos

#### Modo `local` (sin backend)

- `frontend/src/data/categories.js` y `frontend/src/data/protocols/*.json` son la fuente de verdad.
- Util para revision academica, diseno visual y trabajo offline.
- No permite escritura.

#### Modo `api` (con backend)

- El frontend hace peticiones HTTP al backend.
- El backend aplica reglas de negocio y persiste en PostgreSQL.
- El seed inicial (`backend/prisma/seed.ts`) toma los JSON del frontend y los persiste en la BD para arrancar.
- A partir de ahi, todas las operaciones CRUD pasan por la API.

---

## Estructura del repositorio

```text
SportMetric Academic/
|-- .github/
|   `-- workflows/ci.yml           (CI: install, lint, test, build)
|-- backend/
|   |-- prisma/
|   |   |-- schema.prisma          (modelo de datos)
|   |   |-- migrations/            (migraciones generadas)
|   |   `-- seed.ts                (carga inicial desde JSON)
|   |-- scripts/                   (utilidades de operacion)
|   |-- src/
|   |   |-- app.ts                 (bootstrap de Express)
|   |   |-- server.ts              (arranque del servidor)
|   |   |-- config/
|   |   |   |-- env.ts             (carga y validacion de variables)
|   |   |   |-- database.ts        (instancia de Prisma)
|   |   |   |-- helmet.ts          (CSP, headers de seguridad)
|   |   |   |-- cors.ts            (CORS configurable)
|   |   |   `-- rateLimit.ts       (limites por IP)
|   |   |-- modules/
|   |   |   |-- auth/              (login, refresh, forgot, reset, me)
|   |   |   |   |-- auth.routes.ts
|   |   |   |   |-- controllers/auth.controller.ts
|   |   |   |   |-- services/auth.service.ts
|   |   |   |   `-- dto/auth.dto.ts
|   |   |   |-- users/             (CRUD de usuarios)
|   |   |   |   |-- users.routes.ts
|   |   |   |   |-- controllers/user.controller.ts
|   |   |   |   |-- services/user.service.ts
|   |   |   |   `-- repositories/user.repository.ts
|   |   |   |-- categories/        (CRUD de categorias)
|   |   |   |   |-- category.routes.ts
|   |   |   |   |-- controllers/category.controller.ts
|   |   |   |   |-- services/category.service.ts
|   |   |   |   |-- repositories/category.repository.ts
|   |   |   |   `-- dto/category.dto.ts
|   |   |   |-- protocols/         (CRUD de protocolos con relaciones)
|   |   |   |   |-- protocol.routes.ts
|   |   |   |   |-- controllers/protocol.controller.ts
|   |   |   |   |-- services/protocol.service.ts
|   |   |   |   |-- repositories/protocol.repository.ts
|   |   |   |   `-- dto/protocol.dto.ts
|   |   |   |-- forms/             (esquemas de formulario)
|   |   |   |   |-- form.routes.ts
|   |   |   |   |-- controllers/form.controller.ts
|   |   |   |   |-- services/form.service.ts
|   |   |   |   |-- repositories/form.repository.ts
|   |   |   |   `-- utils/generic-schema.ts
|   |   |   |-- evaluations/       (CRUD de evaluaciones)
|   |   |   |   |-- evaluation.routes.ts
|   |   |   |   |-- controllers/evaluation.controller.ts
|   |   |   |   |-- services/evaluation.service.ts
|   |   |   |   `-- repositories/evaluation.repository.ts
|   |   |   `-- analytics/         (resumenes para dashboard)
|   |   |       |-- analytics.routes.ts
|   |   |       |-- controllers/analytics.controller.ts
|   |   |       `-- services/analytics.service.ts
|   |   `-- shared/
|   |       |-- middlewares/       (auth.middleware, rate-limiter)
|   |       |-- filters/           (error.filter global)
|   |       |-- services/          (email.service)
|   |       `-- utils/             (ApiResponse, ApiError, asyncHandler, logger)
|   |-- .env.example               (plantilla de variables)
|   `-- package.json
|-- frontend/
|   |-- public/                    (assets estaticos)
|   |-- src/
|   |   |-- main.jsx               (entry point)
|   |   |-- App.jsx                (definicion de rutas)
|   |   |-- components/            (componentes reutilizables)
|   |   |   |-- DynamicForm.jsx    (formulario generado desde esquema)
|   |   |   |-- ProtectedRoute.jsx (guard de autenticacion)
|   |   |   |-- ErrorBoundary.jsx  (captura de errores React)
|   |   |   |-- Modal.jsx          (modal reutilizable)
|   |   |   |-- Toast.jsx          (notificaciones efimeras)
|   |   |   `-- navigation/
|   |   |       |-- Header.jsx     (cabecera global)
|   |   |       `-- BottomNav.jsx  (navegacion inferior movil)
|   |   |-- layout/
|   |   |   |-- MainLayout.jsx     (layout publico + autenticado)
|   |   |   `-- AdminLayout.jsx    (layout del panel admin con sidebar)
|   |   |-- pages/
|   |   |   |-- Welcome.jsx              (bienvenida publica)
|   |   |   |-- Login.jsx                (inicio de sesion)
|   |   |   |-- Categories.jsx           (catalogo de categorias)
|   |   |   |-- ProtocolList.jsx         (protocolos por categoria)
|   |   |   |-- ProtocolDetail.jsx       (detalle con secciones internas)
|   |   |   |-- EvaluationHistory.jsx    (historial de un estudiante)
|   |   |   |-- protocol/                (secciones internas del detalle)
|   |   |   |   |-- ProtocolObjective.jsx
|   |   |   |   |-- ProtocolDescription.jsx
|   |   |   |   |-- ProtocolMaterials.jsx
|   |   |   |   |-- ProtocolChecklist.jsx
|   |   |   |   |-- ProtocolSteps.jsx
|   |   |   |   |-- ProtocolInterruption.jsx
|   |   |   |   `-- ProtocolDataRegistry.jsx
|   |   |   `-- admin/
|   |   |       |-- AdminDashboard.jsx       (resumen + KPIs)
|   |   |       |-- UserManagement.jsx       (CRUD de usuarios)
|   |   |       |-- CategoryManagement.jsx   (CRUD de categorias)
|   |   |       |-- ProtocolManagement.jsx    (CRUD de protocolos con editor 7 pestanas)
|   |   |       |-- EvaluationManagement.jsx  (CRUD de evaluaciones)
|   |   |       |-- Statistics.jsx            (graficos + exportacion CSV/PDF)
|   |   |       `-- Settings.jsx              (configuracion del sistema)
|   |   |-- services/              (capa de acceso a datos)
|   |   |   |-- apiClient.js       (cliente HTTP con XMLHttpRequest)
|   |   |   |-- xhrFactory.js      (factor inyectable)
|   |   |   |-- authService.js
|   |   |   |-- categoryService.js
|   |   |   |-- protocolService.js
|   |   |   |-- formService.js
|   |   |   |-- evaluationService.js
|   |   |   `-- analyticsService.js
|   |   |-- shared/
|   |   |   `-- utils/
|   |   |       `-- exportUtils.js (helpers de exportacion PDF/CSV)
|   |   |-- styles/
|   |   |   `-- index.css          (Tailwind + estilos globales)
|   |   |-- data/                  (modo local: JSON/JS)
|   |   |   |-- categories.js
|   |   |   |-- categories.json
|   |   |   |   `-- protocols/         (11 JSON de protocolos academicos)
|   |   `-- test/
|   |       |-- setup.js           (configuracion de Vitest + jsdom)
|   |       |-- fixtures.js        (datos de prueba compartidos)
|   |       |-- App.test.jsx       (smoke test de la aplicacion)
|   |       |-- services/          (tests de servicios)
|   |       |-- pages/             (tests de paginas)
|   |       |-- components/        (tests de componentes)
|   |       `-- layout/            (tests de layouts)
|   |-- .env.example               (plantilla de variables)
|   |-- vite.config.js             (config de Vite con proxy /api y alias @)
|   |-- tailwind.config.js         (tema, colores, fuentes)
|   |-- postcss.config.js
|   |-- eslint.config.mjs          (ESLint flat config)
|   |-- vitest.config.js           (config de Vitest)
|   `-- package.json
|-- docs/                          (documentacion funcional)
|   |-- PROJECT_CONTEXT.md
|   |-- DESIGN.md
|   |-- PROTOCOL_STRUCTURE.md
|   `-- APP_FLOW.md
|-- docs-engineering/              (documentacion tecnica)
|   |-- adr/                       (Architecture Decision Records)
|   |-- api/estado-api.md
|   |-- architecture/arquitectura-general.md
|   |-- database/operacion-postgresql-prisma.md
|   |-- deployment/render-vercel.md
|   |-- diagrams/indice-diagramas.md
|   `-- testing/auditoria-y-pruebas.md
|-- docker/                        (configuracion Docker)
|   |-- docker-compose.yml         (stack completo: backend + frontend + postgres)
|   |-- backend.Dockerfile
|   `-- frontend.Dockerfile
|-- shared/                        (codigo compartido entre paquetes)
|   `-- constants/roles.ts         (constantes de roles: ADMIN, EVALUATOR)
|-- README.md                      (este archivo)
|-- README-backend.md              (guia especifica del backend)
|-- README-frontend.md             (guia especifica del frontend)
|-- vercel.json                    (config de despliegue en Vercel)
`-- CHANGELOG.md                   (registro de cambios)
```

---

## Requisitos previos

Para desarrollar localmente necesitas:

- **Node.js 22.x LTS** (recomendado via `nvm` o `fnm`).
- **npm 10+ o 11+** (incluido con Node 22).
- **PostgreSQL 16** (local, en Docker, o como servicio gestionado).
- **Git 2.30+**.
- Un editor con soporte para TypeScript y JSX (recomendado: VSCode con extensiones ESLint, Prettier y Prisma).

Para despliegue en produccion:

- Una cuenta en Vercel (o alternativa compatible) para el frontend.
- Una cuenta en Render (o alternativa compatible) para el backend y PostgreSQL.
- Un proveedor de SMTP para envio de correos de recuperacion de contrasena (opcional pero recomendado).

---

## Instalacion paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/<organizacion>/sportmetric-academic.git
cd sportmetric-academic
```

### 2. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `backend/.env` con tus valores (ver seccion [Configuracion](#configuracion)).

### 3. Crear la base de datos y aplicar migraciones

```bash
npm run db:migrate:dev
npm run db:seed
```

El seed carga las categorias y protocolos desde los JSON del frontend en PostgreSQL.

### 4. Levantar el backend en modo desarrollo

```bash
npm run dev
```

Por defecto escucha en `http://localhost:3001`.

Verifica que responde:

```bash
curl http://localhost:3001/api/health
```

Deberias ver un JSON con `{ "status": "ok" }`.

### 5. Configurar el frontend

En otra terminal:

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edita `frontend/.env` (ver seccion [Configuracion](#configuracion)).

### 6. Levantar el frontend

```bash
npm run dev
```

Por defecto escucha en `http://127.0.0.1:5173`.

> Importante: usa `127.0.0.1` y no `localhost` para evitar problemas de resolucion IPv4/IPv6 en Windows. El proxy de Vite ya esta configurado para apuntar al backend en `http://localhost:3001`.

### 7. Acceder a la aplicacion

- Frontend: <http://127.0.0.1:5173>
- API: <http://localhost:3001/api>
- Swagger (si esta habilitado): <http://localhost:3001/api/docs>
- Admin: <http://127.0.0.1:5173/admin> (requiere login con usuario administrador)

Usuario administrador inicial (creado por el seed):

- email: `admin@sportmetric.com`
- contrasena: `admin1234`

---

## Configuracion

### Variables del backend (`backend/.env`)

```env
# Entorno
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://usuario:contrasena@localhost:5432/sportmetric

# URLs publicas
BACKEND_PUBLIC_URL=http://localhost:3001
FRONTEND_URL=http://127.0.0.1:5173

# CORS: lista separada por comas de origenes permitidos
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT
JWT_SECRET=cambia-esto-por-una-clave-aleatoria-de-32-bytes
JWT_REFRESH_SECRET=cambia-esto-por-otra-clave-aleatoria-de-32-bytes
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Recuperacion de contrasena
PASSWORD_RESET_TOKEN_TTL_MINUTES=60

# Proxy de confianza (0 en local, 1+ detras de un balanceador)
TRUST_PROXY_HOPS=0

# Rate limit
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=1000
```

### Variables del frontend (`frontend/.env`)

```env
# Fuente de datos: 'local' (JSON) o 'api' (backend)
VITE_DATA_SOURCE=api

# URL base del backend. Dejar VACIO en desarrollo local para usar el proxy de Vite.
# En produccion, poner la URL publica del backend.
VITE_API_BASE_URL=
```

> **Por que dejar vacio `VITE_API_BASE_URL` en desarrollo?** El proxy de Vite redirige todas las peticiones a `/api/*` hacia `http://localhost:3001`. Esto evita problemas de CORS y de bloqueo por extensiones como Grammarly que sobrescriben `fetch`.

---

## Guia de uso

### Como visitante

1. Abre `http://127.0.0.1:5173` en tu navegador.
2. Explora las categorias desde la pantalla principal.
3. Selecciona una categoria para ver los protocolos disponibles.
4. Selecciona un protocolo para ver sus detalles (objetivo, materiales, descripcion, checklist, pasos, criterios de interrupcion).
5. En la seccion "Registro" completa el formulario con los datos del evaluado y envia.
6. Veras una pantalla de confirmacion con un boton para realizar otra medicion.

### Como administrador

1. Abre `http://127.0.0.1:5173/login`.
2. Ingresa con el usuario administrador (`admin@sportmetric.com` / `admin1234`).
3. En el menu superior selecciona "Panel admin" o navega a `http://127.0.0.1:5173/admin`.
4. Desde el dashboard accede a:
   - **Usuarios** (`/admin/users`): crear, editar, eliminar y buscar usuarios.
   - **Categorias** (`/admin/categories`): CRUD con color picker libre.
   - **Protocolos** (`/admin/protocols`): crear nuevo o editar uno existente.
   - **Evaluaciones** (`/admin/evaluations`): ver, buscar, filtrar, editar y eliminar registros.
   - **Estadisticas** (`/admin/statistics`): visualizar graficos y exportar a CSV/PDF.
   - **Configuracion** (`/admin/settings`): ajustes del sistema.

### Rutas publicas disponibles

| Ruta | Descripcion | Auth |
| --- | --- | --- |
| `/` | Pantalla de bienvenida | No |
| `/categories` | Catalogo de categorias | No |
| `/category/:categoryId` | Protocolos de una categoria (`all` para ver todos) | No |
| `/protocol/:protocolId/*` | Detalle del protocolo con secciones internas | No |
| `/history/:studentId` | Historial de evaluaciones de un estudiante | No |
| `/login` | Inicio de sesion | No |
| `/forgot-password` | Solicitar recuperacion de contrasena | No |
| `/reset-password?token=...` | Definir nueva contrasena | No (token) |

### Como crear un protocolo nuevo

1. En el panel admin, ve a "Protocolos" -> "Crear nuevo".
2. Completa la pestana "General": id (slug), titulo y categoria.
3. Completa la pestana "Descripcion" con el texto academico.
4. Agrega materiales (nombre y opcionalmente imagen).
5. Define el checklist de verificacion.
6. Define los pasos con titulo, descripcion y video (opcional).
7. Define los criterios de interrupcion.
8. En la pestana "Registro" agrega los campos personalizados (6 tipos disponibles).
9. Guarda. La transaccion Prisma asegura que todo se persiste de forma atomica.

### Como personalizar un formulario existente

1. En el panel admin, abre un protocolo.
2. Ve a la pestana "Registro".
3. Agrega, edita o elimina campos personalizados.
4. Los nombres `id_estudiante`, `evaluado` y `evaluador` estan reservados (los agrega el backend automaticamente).
5. Guarda. La Ficha Tecnica base se mantiene y se concatenan los campos nuevos al final con un separador visual.

### Como recuperar la contrasena

1. En la pantalla de login, haz clic en "Olvide mi contrasena".
2. Ingresa tu email y envia.
3. Si el email existe en el sistema, recibiras un enlace con un token de un solo uso.
4. Abre el enlace y define una nueva contrasena (minimo 8 caracteres, recomendado 12+).
5. El sistema actualiza el hash con Argon2 y notifica el cambio.

---

## Referencia tecnica

### Cliente HTTP (`frontend/src/services/apiClient.js`)

Centraliza todas las peticiones HTTP. Caracteristicas:

- Usa `XMLHttpRequest` (no `fetch`) para evitar bloqueos de extensiones del navegador.
- Inyecta el token Bearer automaticamente desde `authService`.
- Soporta `AbortSignal` para cancelar peticiones en limpieza de `useEffect`.
- Devuelve `payload.data` cuando la respuesta viene envuelta en `{ data: ... }`.
- Devuelve `Error` con el mensaje del backend cuando la respuesta es un error.

### Factor XHR (`frontend/src/services/xhrFactory.js`)

Encapsula la creacion de la instancia XHR. Esto permite:

- Inyectar un mock en tests sin tocar el global `XMLHttpRequest`.
- Cambiar la implementacion del transporte HTTP en el futuro (por ejemplo, a `fetch` con polyfill).

### Servicios de frontend

| Servicio | Responsabilidad |
| --- | --- |
| `authService` | Login, logout, refresh, recuperacion de contrasena. |
| `categoryService` | CRUD de categorias. |
| `protocolService` | CRUD de protocolos. |
| `formService` | Obtener y guardar esquemas de formulario (con cache busting). |
| `evaluationService` | CRUD de evaluaciones con filtros. |
| `analyticsService` | Resumenes para el dashboard. |

### DynamicForm (`frontend/src/components/DynamicForm.jsx`)

Componente que renderiza un formulario a partir de un esquema JSON. Caracteristicas:

- Se remonta con un `key` derivado del esquema, lo que reinicia su estado al cambiar la configuracion.
- Soporta 6 tipos: text, number, date, textarea, select, checkbox.
- Validacion de campos obligatorios en el cliente.
- Mensaje contextual: muestra cuantos campos personalizados hay o si es el formulario base.
- Separador visual "Campos personalizados" cuando hay campos custom.

### Modulo de formularios (`backend/src/modules/forms/`)

- `form.service.ts` concatena los campos base (`id_estudiante`, `evaluado`, `evaluador`) con los campos personalizados del admin.
- `form.controller.ts` envia headers anti-cache en `GET`.
- `GET /api/forms/:protocolId` es publico a proposito: cualquier usuario (incluso sin login) puede consultar el esquema.

### Modulo de protocolos (`backend/src/modules/protocols/`)

- `protocol.repository.ts` usa `prisma.$transaction` para atomicidad.
- Helpers `buildRelations`, `syncDataRegistry`, `syncFormSchema` para reusar la logica de upsert.
- `protocol.service.ts` valida el payload (slug, categoria existente, titulo obligatorio).
- `formSchema` se incluye en el `findUnique` para que la respuesta del GET ya lo traiga.

### Modulo de autenticacion (`backend/src/modules/auth/`)

- Hashing con Argon2 (parametros configurables).
- JWT separados para access (corta duracion) y refresh (larga duracion).
- Refresh tokens persistidos como hash en BD, rotacion automatica.
- Tokens de recuperacion: 32 bytes aleatorios, SHA-256 en BD, expiracion 1h, un solo uso.
- Middleware `authenticate` extrae el Bearer y carga el usuario.
- Middleware `authorize('ADMIN')` valida el rol.

---

## Modelo de datos

Diagrama entidad-relacion simplificado:

```mermaid
erDiagram
    CATEGORY ||--o{ PROTOCOL : contiene
    PROTOCOL ||--o{ MATERIAL : tiene
    PROTOCOL ||--o{ CHECKLIST_ITEM : tiene
    PROTOCOL ||--o{ STEP : tiene
    PROTOCOL ||--o{ INTERRUPTION_CRITERION : tiene
    PROTOCOL ||--o| DATA_REGISTRY : tiene
    PROTOCOL ||--o| FORM_SCHEMA : tiene
    PROTOCOL ||--o{ EVALUATION : registra
    USER ||--o{ EVALUATION : autoria
    USER ||--o{ PASSWORD_RESET_TOKEN : solicita
```

### Tablas principales

- **Category**: id, name, slug, color, description, icon, order.
- **Protocol**: id, title, slug, description, objective, categoryId.
- **FormSchema**: id, protocolId (UNIQUE), fields (JSONB).
- **DataRegistry**: id, protocolId (UNIQUE), title, description, unit, fields.
- **Evaluation**: id, protocolId, studentId, subjectName, evaluatorName, results (JSONB), notes, date.
- **User**: id, email (UNIQUE), name, passwordHash, role, refreshTokenHash.
- **PasswordResetToken**: id, userId, tokenHash, expiresAt, usedAt.

### Ficha Tecnica base (anadida por el backend)

Toda evaluacion incluye SIEMPRE estos 3 campos al inicio del esquema:

| name | label | tipo | obligatorio |
| --- | --- | --- | --- |
| `id_estudiante` | ID del estudiante | text | si |
| `evaluado` | Nombre del evaluado | text | si |
| `evaluador` | Nombre del evaluador | text | si |

Los nombres estan reservados en el editor del panel admin para evitar duplicaciones.

---

## API REST

Todas las rutas estan bajo `/api`. Las respuestas exitosas vienen envueltas en `{ data: ... }` y los errores en `{ error: { code, message, details? } }`.

### Salud

- `GET /api/health` (sin auth).

### Autenticacion

- `POST /api/auth/login` (sin auth, emite access + refresh).
- `POST /api/auth/refresh` (usa refresh token).
- `POST /api/auth/logout` (Bearer).
- `POST /api/auth/forgot-password` (sin auth).
- `POST /api/auth/reset-password` (sin auth, usa token).
- `GET /api/auth/me` (Bearer).

### Categorias

- `GET /api/categories` (sin auth).
- `GET /api/categories/:id` (sin auth).
- `GET /api/categories/:id/protocols` (sin auth).
- `POST /api/categories` (ADMIN).
- `PATCH /api/categories/:id` (ADMIN).
- `DELETE /api/categories/:id` (ADMIN).

### Protocolos

- `GET /api/protocols` (sin auth).
- `GET /api/protocols/:id` (sin auth).
- `POST /api/protocols` (ADMIN).
- `PATCH /api/protocols/:id` (ADMIN).
- `DELETE /api/protocols/:id` (ADMIN).

### Esquemas de formulario

- `GET /api/forms/:protocolId` (publico, sin auth).
- `POST /api/forms/:protocolId` (ADMIN).

### Evaluaciones

- `POST /api/evaluations` (sin auth, captura publica).
- `GET /api/evaluations` (ADMIN, filtros: `protocolId`, `search`).
- `GET /api/evaluations/:id` (ADMIN).
- `PATCH /api/evaluations/:id` (ADMIN).
- `DELETE /api/evaluations/:id` (ADMIN).
- `GET /api/evaluations/student/:studentId` (ADMIN).

### Usuarios

- `GET /api/users` (ADMIN).
- `GET /api/users/:id` (ADMIN).
- `POST /api/users` (ADMIN).
- `PATCH /api/users/:id` (ADMIN).
- `DELETE /api/users/:id` (ADMIN).

### Analiticas

- `GET /api/analytics/summary` (ADMIN).
- `GET /api/analytics/activity` (ADMIN).
- `GET /api/analytics/top-protocols` (ADMIN).

### Ejemplo de login con curl

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sportmetric.com","password":"admin1234"}'
```

Respuesta:

```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "uuid",
      "email": "admin@sportmetric.com",
      "name": "Administrador",
      "role": "ADMIN"
    }
  }
}
```

Para mas detalle ver [docs-engineering/api/estado-api.md](docs-engineering/api/estado-api.md).

---

## Seguridad

SportMetric Academic implementa seguridad robusta por defecto:

- **Hashing de contrasenas**: Argon2 con parametros configurables (memoria, tiempo, paralelismo).
- **Tokens de acceso**: JWT firmados con `JWT_SECRET`, expiracion corta (15 minutos por defecto).
- **Tokens de refresh**: JWT firmados con `JWT_REFRESH_SECRET`, persistidos como hash en BD, rotacion automatica en cada uso.
- **Tokens de recuperacion**: 32 bytes aleatorios, hasheados con SHA-256, expiracion 1h, un solo uso.
- **Headers de seguridad**: Helmet con CSP estricta (no se permiten `unsafe-inline` ni origines externos).
- **CORS**: restringido a `ALLOWED_ORIGINS` configurables.
- **Rate limit**: por IP, configurable (1000 req/15min por defecto para uso admin intensivo).
- **Autorizacion por rol**: middleware `authorize('ADMIN')` en todas las rutas sensibles.
- **Cliente HTTP defensivo**: usa `XMLHttpRequest` con factor inyectable para evitar bloqueos de extensiones.
- **Anti-cache**: headers `Cache-Control`, `Pragma`, `Expires` en endpoints dinamicos + query string `_t=Date.now()`.
- **Sin secretos en el repositorio**: todas las claves y URLs sensibles van en `.env` (no versionado).
- **Sin `dangerouslySetInnerHTML`**: el frontend nunca renderiza HTML crudo.

Para decisiones detalladas ver [docs-engineering/adr/](docs-engineering/adr/).

---

## Calidad y pruebas

### Cobertura actual

| Paquete | Suites | Tests |
| --- | ---: | ---: |
| Frontend | 25 | 134 |
| Backend | 19 | 93 |
| **Total** | **44** | **227** |

### Comandos

#### Frontend

```bash
cd frontend
npm install
npm run lint          # ESLint con react-hooks
npm test -- --run     # Vitest, una sola corrida (sin watch)
npm run test:run      # alias explicito
npm run test:coverage # Vitest con reporte de cobertura
npm run build         # Build de produccion con Vite
```

#### Backend

```bash
cd backend
npm install           # ejecuta automaticamente "prisma generate" (postinstall)
npm run lint          # ESLint flat config
npm test              # Vitest en una sola corrida
npm run test:watch    # Vitest en modo watch
npm run test:coverage # Vitest con reporte de cobertura
npm run build         # prisma generate + tsc + copy-prisma-client
npm start             # Ejecuta dist/server.js
npm run db:generate           # Regenera el cliente Prisma
npm run db:migrate:dev        # Crea/aplica migraciones en desarrollo
npm run db:migrate:deploy     # Aplica migraciones en produccion
npm run db:seed               # Ejecuta el seed inicial
npm run db:studio             # Abre Prisma Studio
npm run deploy:render         # Build + migraciones (util para CI/CD en Render)
```

### CI con GitHub Actions

El workflow `.github/workflows/ci.yml` ejecuta en cada push y pull request:

1. Instalacion de dependencias en frontend y backend.
2. `npm run lint` en ambos paquetes.
3. `npm test -- --run` en ambos paquetes.
4. `npm run build` en ambos paquetes.

### Estrategia de testing

- **Backend**: tests unitarios por servicio y por controlador, con mock del cliente Prisma.
- **Frontend**: tests de servicios mockeando el factory XHR, tests de paginas con `Testing Library` y fixtures.

Para detalle ver [docs-engineering/testing/auditoria-y-pruebas.md](docs-engineering/testing/auditoria-y-pruebas.md).

---

## Despliegue

### Recomendacion: Vercel + Render

- **Frontend en Vercel**: build automatico desde `frontend/`, `VITE_DATA_SOURCE=api`, `VITE_API_BASE_URL=https://<backend>.onrender.com`.
- **Backend en Render**: build automatico desde `backend/`, `DATABASE_URL` apuntando a la PostgreSQL de Render.
- **PostgreSQL en Render**: servicio gestionado, copias de seguridad automaticas.

### Cloud-agnostic

El proyecto esta preparado para cambiar de proveedor (Vercel, Netlify, Render, Railway, AWS, GCP, Azure) sin reescribir codigo, solo ajustando variables de entorno.

### Checklist de despliegue

- [ ] `JWT_SECRET` y `JWT_REFRESH_SECRET` son claves aleatorias de 32+ bytes (no las de ejemplo).
- [ ] `ALLOWED_ORIGINS` incluye el origen del frontend en produccion.
- [ ] `TRUST_PROXY_HOPS` refleja los proxies reales (1 en Render, 2 si hay CDN adicional).
- [ ] `DATABASE_URL` apunta a la base de produccion.
- [ ] El seed NO se ejecuta en produccion.
- [ ] El usuario administrador inicial se cambia la contrasena en el primer login.

Para mas detalle ver [docs-engineering/deployment/render-vercel.md](docs-engineering/deployment/render-vercel.md).

### Desarrollo con Docker

Si prefieres no instalar Node ni PostgreSQL localmente, puedes usar el `docker-compose.yml` incluido:

```bash
docker compose -f docker/docker-compose.yml up
```

Esto levanta:

- `postgres`: base de datos PostgreSQL 16.
- `backend`: API Express con migraciones y seed automaticos.
- `frontend`: Vite dev server con proxy al backend.

Los archivos `docker/backend.Dockerfile` y `docker/frontend.Dockerfile` son multi-stage y estan listos para produccion.

### Protocolos academicos preconfigurados (seed)

El seed inicial carga 12 protocolos academicos distribuidos en categorias, con sus videos y JSON de configuracion:

| Categoria | Protocolos |
| --- | --- |
| Calentamiento | Calentamiento general |
| Antropometria | Medicion de la talla, Medicion del peso, Medicion del perimetro de cintura |
| Resistencia | Medicion de resistencia cardiorrespiratoria, Test de resistencia muscular (plancha isometrica) |
| Movilidad | Movilidad articular y estiramientos, Test de movilidad articular con inclinometro |
| Flexibilidad | Test de detent (Sargent), Test de flexibilidad del hombro (FMS) |
| Potencia | Test de potencia de brazos con balon medicinal |

Todos los videos y descripciones viven en `frontend/src/data/protocols/*.json` y son copiados a la BD por el seed. Tras el seed, los administradores pueden editar, versionar o eliminar estos protocolos desde el panel.

---

## Troubleshooting

### El backend no levanta

**Sintomas**: `npm run dev` falla al arrancar o imprime errores de Prisma.

**Causas comunes**:

- Variables de entorno faltantes en `backend/.env`.
- PostgreSQL no esta corriendo o la `DATABASE_URL` es incorrecta.
- Las migraciones no se aplicaron (`npm run db:migrate:dev`).
- El cliente Prisma no esta generado (`npm run db:generate`).

**Solucion**: revisa el log del backend. La primera linea del error suele indicar la causa exacta.

### `npm start` del backend falla despues de compilar

**Causa**: el cliente Prisma generado vive en `dist/generated/prisma` y `npm start` no lo regenera.

**Solucion**: ejecuta `npm run build` (que incluye la generacion del cliente) o configura un `postbuild` en `package.json`.

### El frontend no carga datos desde la API

**Checklist**:

- `VITE_DATA_SOURCE=api` en `frontend/.env`.
- `VITE_API_BASE_URL` vacio (usa proxy de Vite) o con la URL publica del backend.
- El backend esta corriendo y responde en `/api/health`.
- `ALLOWED_ORIGINS` del backend incluye el origen del frontend.
- La consola del navegador no muestra errores de CORS.

### Las categorias no cargan (error `Failed to fetch`)

**Causa comun**: una extension del navegador (Grammarly, ad-blockers) sobrescribe `fetch` global.

**Solucion**: el cliente HTTP ya usa `XMLHttpRequest` con `xhrFactory.js` para evitar este problema. Si aun persiste, desactiva las extensiones o usa una ventana de incognito.

### El DynamicForm no refleja los cambios del admin

**Causa comun**: el navegador cachea la respuesta del endpoint `/api/forms/:protocolId`.

**Solucion**: el endpoint ya envia headers anti-cache y el cliente agrega `_t=${Date.now()}`. Si persiste, limpia la cache del navegador o reinicia el frontend.

### La columna de usuario en el panel admin sale en blanco

**Causa**: la pagina `AdminLayout.jsx` no renderizaba `<Outlet />` por un JSX mal balanceado.

**Estado**: corregido en la auditoria de la Fase 2.

### `prisma.$transaction` se queda colgado

**Causa**: el helper de transaccion no recibia el cliente transaccional (`tx`).

**Solucion**: el repository ahora pasa `tx` a los helpers `buildRelations`, `syncDataRegistry` y `syncFormSchema` para que operen dentro de la misma transaccion.

### `ECONNREFUSED 127.0.0.1:5432`

**Causa**: PostgreSQL no esta corriendo o escucha solo en `localhost`.

**Solucion**:

- Verifica el servicio: `pg_isready` o el panel de control.
- Si PostgreSQL esta en Docker, asegurate de que el puerto este mapeado.
- Usa `localhost` o `127.0.0.1` segun corresponda en `DATABASE_URL`.

### Tokens JWT expirados en pruebas

**Causa**: el access token de prueba expira rapido (15 minutos por defecto).

**Solucion**: en tests usa el endpoint `/api/auth/refresh` con el refresh token, o genera tokens de prueba con `JWT_SECRET` y `JWT_REFRESH_SECRET` conocidos.

---

## Convenciones del proyecto

### Estilo de codigo

- **Clean Code**: nombres descriptivos, funciones pequenas con una sola responsabilidad.
- **SOLID**: dependencias inyectadas, abierto/cerrado, sustitucion de Liskov, segregacion de interfaces, inversion de dependencias.
- **Clean Architecture**: separacion por capas (Routes, Controllers, Services, Repositories, DTOs en backend; Pages, Components, Services, Layouts en frontend).
- **Comentarios en espanol**: todos los comentarios del codigo y documentacion estan en espanol.
- **Sin emojis**: ni en codigo ni en documentacion.
- **Modularidad**: cada modulo es autonomo y testeable.

### Estrategia de ramas

- `main`: rama estable y de referencia.
- `dev`: integracion y evolucion del trabajo tecnico.
- Promover cambios de `dev` a `main` solo cuando `lint`, `test` y `build` esten en verde.

### Commits

- Mensajes descriptivos en espanol.
- Una preocupacion por commit.
- PRs pequenos y enfocados.

### Pragma y sobreingenieria

- Evitamos abstracciones prematuras.
- Preferimos elementos visuales familiares como valores predeterminados.
- Introducimos complejidad solo cuando es necesaria.

### Seguridad

- Alta sensibilidad: hashing robusto (Argon2), manejo seguro de tokens, CSP y CORS estrictas.
- No se baja la seguridad por conveniencia local.

---

## Documentacion relacionada

### Documentacion funcional (`docs/`)

- [CHANGELOG.md](CHANGELOG.md): registro de cambios por fase.
- [README-backend.md](README-backend.md): guia especifica del backend.
- [README-frontend.md](README-frontend.md): guia especifica del frontend.
- [docs/DESIGN.md](docs/DESIGN.md): sistema de diseno.
- [docs/APP_FLOW.md](docs/APP_FLOW.md): flujo funcional detallado.
- [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md): contexto del proyecto.
- [docs/PROTOCOL_STRUCTURE.md](docs/PROTOCOL_STRUCTURE.md): estructura de un protocolo.
- [docs/Desing mockups UI UX/](docs/Desing%20mockups%20UI%20UX/): mockups de alta fidelidad (HTML + screenshot) de las pantallas clave.

### Documentacion tecnica (`docs-engineering/`)

- [docs-engineering/architecture/arquitectura-general.md](docs-engineering/architecture/arquitectura-general.md): arquitectura por capas con diagramas.
- [docs-engineering/api/estado-api.md](docs-engineering/api/estado-api.md): detalle de cada endpoint con ejemplos curl.
- [docs-engineering/database/operacion-postgresql-prisma.md](docs-engineering/database/operacion-postgresql-prisma.md): operacion de la base de datos.
- [docs-engineering/deployment/render-vercel.md](docs-engineering/deployment/render-vercel.md): estrategia de despliegue.
- [docs-engineering/testing/auditoria-y-pruebas.md](docs-engineering/testing/auditoria-y-pruebas.md): estrategia y auditoria de pruebas.
- [docs-engineering/diagrams/indice-diagramas.md](docs-engineering/diagrams/indice-diagramas.md): indice centralizado de diagramas.

### Architecture Decision Records (`docs-engineering/adr/`)

- [ADR-0001](docs-engineering/adr/0001-monorepo-simple.md): monorepo simple en lugar de monorepo gestionado.
- [ADR-0002](docs-engineering/adr/0002-express-en-lugar-de-nestjs.md): Express 5 en lugar de NestJS.
- [ADR-0003](docs-engineering/adr/0003-argon2-en-lugar-de-bcrypt.md): Argon2 en lugar de bcrypt para hashing.
- [ADR-0004](docs-engineering/adr/0004-cloud-agnostic.md): diseno cloud-agnostic para portabilidad.
- [ADR-0005](docs-engineering/adr/0005-preparar-docker.md): preparacion de Dockerfiles y compose.

---

## Licencia

Este proyecto es de uso academico. La licencia y terminos de uso se definen en [LICENSE](LICENSE) (si aplica).

---

## Contacto y soporte

Para preguntas tecnicas o reportar problemas, abrir un issue en el repositorio o contactar al equipo de desarrollo a traves de los canales oficiales de la institucion.

---

**SportMetric Academic** - plataforma web full stack para la gestion academica de protocolos de medicion fisica y antropometrica.

- 19 secciones autocontenidas.
- ~1130 lineas de documentacion oficial.
- 5 ADR documentados.
- 227 tests automatizados (134 frontend + 93 backend).
- 12 protocolos academicos preconfigurados.
- 6 categorias semilla.
- 100% de las APIs documentadas con ejemplos curl.
