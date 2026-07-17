# SportMetric Academic - Frontend

Frontend SPA de SportMetric Academic construido con React, Vite y Tailwind CSS.

## Responsabilidades del frontend

- presentar la navegacion academica de protocolos;
- listar categorias y protocolos;
- renderizar el detalle completo del protocolo;
- poder trabajar con datos locales o con API;
- servir como base para futuras pantallas con formularios y autenticacion.

## Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React
- Vitest
- ESLint

## Instalacion y arranque

```bash
npm install
npm run dev
```

URL local:

- `http://localhost:5173`

## Variables de entorno

Partir de `frontend/.env.example`.

Variables disponibles:

- `VITE_DATA_SOURCE`
- `VITE_API_BASE_URL`

## Modos de funcionamiento

### 1. Modo local

Usa el contenido embebido del proyecto:

- `src/data/categories.js`
- `src/data/protocols/*.json`

Configuracion:

```env
VITE_DATA_SOURCE=local
```

Este modo es util para:

- diseno y revision visual;
- validacion de contenido;
- trabajo sin depender del backend.

### 2. Modo API

Usa el backend como fuente de datos:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3001
```

Este modo es util para:

- preparar integracion real con PostgreSQL;
- despliegue con Vercel + Render;
- validar contratos entre frontend y backend.
- aprovechar el endpoint filtrado por categoria para reducir carga innecesaria.

## Scripts disponibles

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run test`
- `npm run test:run`
- `npm run test:coverage`

## Estado real validado

Se verifico recientemente que:

- `npm run lint` pasa;
- `npm run test:coverage` pasa;
- `npm run build` pasa;
- la navegacion principal carga correctamente;
- categorias, lista de protocolos y detalle se renderizan bien;
- no hay errores reales de consola en las vistas probadas.

Cobertura verificada:

- statements: `91.11%`
- branches: `75.23%`
- functions: `83.2%`
- lines: `94.02%`

## Auditoria tecnica del frontend

Ejecutar:

```bash
npm run lint
npm run test:coverage
npm run build
```

La suite actual valida:

- `apiClient`, `categoryService` y `protocolService`;
- bienvenida, layout y navegacion inferior;
- paginas de categorias, protocolos y detalle;
- secciones del protocolo;
- `ErrorBoundary`.

## Estructura relevante

```text
frontend/
|-- public/
|   `-- assets/
|-- src/
|   |-- components/
|   |-- data/
|   |-- layout/
|   |-- pages/
|   |   `-- protocol/
|   |-- services/
|   |   |-- apiClient.js
|   |   |-- categoryService.js
|   |   `-- protocolService.js
|   |-- styles/
|   |-- test/
|   |   |-- components/
|   |   |-- layout/
|   |   |-- pages/
|   |   `-- services/
|   |-- App.jsx
|   `-- main.jsx
`-- .env.example
```

## Paginas principales

- Bienvenida
- Categorias
- Lista de protocolos
- Detalle de protocolo:
  - objetivo;
  - materiales;
  - descripcion;
  - checklist;
  - pasos;
  - criterios de interrupcion;
  - registro de datos.

## Como funciona la capa de datos

El frontend no consulta datos directamente desde componentes complejos. En su lugar usa servicios:

- `categoryService.js`
- `protocolService.js`
- `apiClient.js`

Eso permite:

- mantener la UI estable;
- cambiar la fuente de datos sin reescribir las pantallas;
- conservar compatibilidad con el backend aunque el modelo interno de la BD sea distinto al JSON original.

## Despliegue en Vercel

Configuracion recomendada:

- Root Directory: `frontend`, o raiz del repo usando `vercel.json`
- Framework: Vite
- mantener fallback SPA a `index.html` para soportar refresh en rutas profundas

Variables tipicas:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=https://tu-backend.onrender.com
```

Si cambias Vercel por otro proveedor, la regla sigue siendo la misma:

- construir `frontend/dist`;
- servir archivos estaticos;
- redirigir rutas desconocidas de la SPA a `index.html`;
- apuntar `VITE_API_BASE_URL` al backend publico correcto.

## Problemas comunes

### El frontend no muestra datos

Revisar:

- `VITE_DATA_SOURCE`
- `VITE_API_BASE_URL`
- que el backend este corriendo si estas en modo `api`

### En local todo se ve bien, pero en produccion no carga la API

Revisar:

- que `VITE_API_BASE_URL` apunte al backend publico;
- que el backend permita el origen de Vercel mediante `ALLOWED_ORIGINS`.

### El frontend funciona al entrar por `/`, pero al refrescar una ruta profunda devuelve 404

Revisar el fallback SPA del proveedor:

- en Vercel ya se cubre con `vercel.json`;
- en otros hosts debes reenviar rutas de la SPA a `index.html`.

### Aparece error de CORS

No se arregla en el frontend. Debes corregir el backend:

- `FRONTEND_URL`
- `ALLOWED_ORIGINS`

### Cambie contenido en PostgreSQL y no se ve en la app

Verificar:

- que el frontend este en modo `api`;
- que el backend consulte la base correcta;
- que la URL publica del backend sea la misma que usa el frontend.

### El build muestra una recomendacion sobre React SWC

En desarrollo Vite puede sugerir migrar a `@vitejs/plugin-react` si no usas plugins SWC. Hoy esa recomendacion no rompe el proyecto ni bloquea el build.

## Documentacion relacionada

- `README.md`
- `README-backend.md`
- `docs-engineering/architecture/arquitectura-general.md`
- `docs-engineering/testing/auditoria-y-pruebas.md`
- `docs-engineering/deployment/render-vercel.md`
- `docs-engineering/diagrams/indice-diagramas.md`
