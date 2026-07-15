# Auditoria tecnica y pruebas

## Objetivo

Esta guia explica como auditar la aplicacion con pruebas automaticas y con verificaciones manuales minimas antes de hacer commit, desplegar o entregar cambios.

## Estado actual de la auditoria

Hoy el proyecto ya cuenta con:

- lint en frontend y backend;
- suites de pruebas separadas y ordenadas en `frontend/src/test` y `backend/src/test`;
- cobertura minima exigida por configuracion en Vitest;
- build validado en ambos proyectos;
- smoke test manual real de frontend y backend levantados en local.

## Cobertura actual

### Frontend

Las pruebas del frontend validan:

- servicios `apiClient`, `categoryService` y `protocolService`;
- pantalla de bienvenida;
- layout principal y navegacion inferior;
- paginas de categorias, lista de protocolos y detalle;
- secciones del detalle del protocolo;
- manejo de errores en `ErrorBoundary`.

Cobertura verificada:

- statements: `91.11%`
- branches: `75.23%`
- functions: `83.2%`
- lines: `94.02%`

### Backend

Las pruebas del backend validan:

- `env`, `cors`, `jwt` y configuracion de base de datos;
- repositorios y servicios de categorias y protocolos;
- `ApiResponse`, filtro global de errores y rate limit;
- contrato HTTP principal mediante `supertest`.

Cobertura verificada:

- statements: `96.35%`
- branches: `79.62%`
- functions: `96.66%`
- lines: `96.21%`

## Como ejecutar la auditoria automatica

### Frontend

Desde `frontend/`:

```bash
npm install
npm run lint
npm run test:coverage
npm run build
```

### Backend

Desde `backend/`:

```bash
npm install
npm run lint
npm run test:coverage
npm run build
```

## Verificacion manual minima recomendada

### 1. Backend

Levantar el backend y verificar:

- `GET /api/health`
- `GET /api/categories`
- `GET /api/protocols`
- `GET /api/protocols/:id`
- `GET /api/docs` en desarrollo

### 2. Frontend en modo local

Verificar:

- pantalla de bienvenida;
- listado de categorias con colores e iconos correctos;
- navegacion a lista de protocolos;
- renderizado completo del detalle del protocolo.

### 3. Frontend en modo API

Configurar:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3001
```

Luego verificar:

- carga de categorias desde backend;
- carga de protocolos por categoria;
- detalle de protocolo;
- ausencia de errores reales de consola;
- ausencia de errores de CORS.

## Integracion continua

El workflow `.github/workflows/ci.yml` ya ejecuta:

- `npm run lint`
- `npm run test:coverage`
- `npm run build`

en frontend y backend.

Eso hace que la validacion local y la validacion de GitHub Actions esten alineadas.

## Que NO cubren aun estas pruebas

- persistencia de formularios;
- autenticacion;
- flujos administrativos;
- pruebas end-to-end completas en navegador;
- pruebas de rendimiento.

## Cuando ampliar esta suite

Conviene ampliarla cuando se implemente cualquiera de estas piezas:

- almacenamiento real de formularios;
- login y refresh tokens;
- endpoints POST, PUT o DELETE;
- permisos por rol;
- integracion completa frontend-backend con formularios persistidos.

## Fallos comunes y su interpretacion

### Fallan pruebas del frontend

Revisar:

- cambios en la forma del dato local;
- cambios en `protocolService.js` o `apiClient.js`;
- ids de categorias o protocolos;
- textos esperados por componentes y rutas.

### Fallan pruebas del backend

Revisar:

- estructura de respuesta de `ApiResponse`;
- controladores que ahora devuelvan otro contrato;
- codigos de error personalizados;
- configuracion de CORS en `env.ts` y `cors.ts`;
- cliente Prisma generado y disponible para build.

### El build pasa pero `npm start` del backend falla

Eso suele indicar un problema entre el codigo compilado y el cliente Prisma generado. La solucion correcta es volver a ejecutar:

```bash
npm run build
```

El build actual ya copia el cliente Prisma a `dist/generated/prisma`.
