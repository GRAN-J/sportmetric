# SportMetric Academic - Frontend

Frontend SPA de SportMetric Academic construido con React, Vite y Tailwind CSS.

## Responsabilidades del frontend

- presentar la navegación académica de protocolos;
- listar categorías y protocolos;
- renderizar el detalle completo del protocolo;
- poder trabajar con datos locales o con API;
- servir como base para futuras pantallas con formularios y autenticación.

## Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React

## Instalación y arranque

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

Configuración:

```env
VITE_DATA_SOURCE=local
```

Este modo es útil para:

- diseño y revisión visual;
- validación de contenido;
- trabajo sin depender del backend.

### 2. Modo API

Usa el backend como fuente de datos:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3001
```

Este modo es útil para:

- preparar integración real con PostgreSQL;
- despliegue con Vercel + Render;
- validar contratos entre frontend y backend.

## Scripts disponibles

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run test:run`

## Auditoría técnica del frontend

Ejecutar:

```bash
npm run test:run
npm run build
```

La suite actual valida la capa de servicios en modo local para detectar cambios no deseados en:

- categorías;
- detalle de protocolos;
- navegación entre protocolos;
- estructura mínima del contenido consumido por la UI.

## Estructura relevante

```text
frontend/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   ├── data/
│   ├── layout/
│   ├── pages/
│   │   └── protocol/
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── categoryService.js
│   │   └── protocolService.js
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
└── .env.example
```

## Páginas principales

- Bienvenida
- Categorías
- Lista de protocolos
- Detalle de protocolo:
  - objetivo;
  - materiales;
  - descripción;
  - checklist;
  - pasos;
  - criterios de interrupción;
  - registro de datos.

## Cómo funciona la capa de datos

El frontend no consulta datos directamente desde componentes complejos. En su lugar usa servicios:

- `categoryService.js`
- `protocolService.js`

Eso permite:

- mantener la UI estable;
- cambiar la fuente de datos sin reescribir las pantallas;
- conservar compatibilidad con el backend aunque el modelo interno de la BD sea distinto al JSON original.

## Despliegue en Vercel

Configuración recomendada:

- Root Directory: `frontend`
- Framework: Vite

Variables típicas:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=https://tu-backend.onrender.com
```

## Problemas comunes

### El frontend no muestra datos

Revisar:

- `VITE_DATA_SOURCE`
- `VITE_API_BASE_URL`
- que el backend esté corriendo si estás en modo `api`

### En local todo se ve bien, pero en producción no carga la API

Revisar:

- que `VITE_API_BASE_URL` apunte al backend público;
- que el backend permita el origen de Vercel mediante `ALLOWED_ORIGINS`.

### Aparece error de CORS

No se arregla en el frontend. Debes corregir el backend:

- `FRONTEND_URL`
- `ALLOWED_ORIGINS`

### Cambié contenido en PostgreSQL y no se ve en la app

Verificar:

- que el frontend esté en modo `api`;
- que el backend consulte la base correcta;
- que la URL pública del backend sea la misma que usa el frontend.

## Documentación relacionada

- `README.md`
- `README-backend.md`
- `docs-engineering/architecture/arquitectura-general.md`
- `docs-engineering/testing/auditoria-y-pruebas.md`
- `docs-engineering/deployment/render-vercel.md`
- `docs-engineering/diagrams/indice-diagramas.md`
