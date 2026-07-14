# Auditoría técnica y pruebas

## Objetivo

Esta guía explica cómo auditar la aplicación con pruebas automáticas y con verificaciones manuales mínimas antes de hacer commit, desplegar o entregar cambios.

## Cobertura actual

### Frontend

Las pruebas del frontend validan la capa de servicios en modo local:

- carga de categorías;
- búsqueda de categoría por id;
- carga de protocolo por id;
- listado por categoría;
- navegación al siguiente protocolo.

### Backend

Las pruebas del backend validan el contrato HTTP base:

- health check;
- respuesta estándar de categorías;
- manejo de 404 de categoría;
- listado de protocolos por categoría;
- detalle de protocolo;
- manejo de 404 de protocolo;
- aceptación de un origen permitido por CORS.

## Cómo ejecutar la auditoría automática

### Frontend

Desde `frontend/`:

```bash
npm install
npm run test:run
npm run build
```

### Backend

Desde `backend/`:

```bash
npm install
npm run test
npm run build
```

## Auditoría manual mínima recomendada

### 1. Backend

Verificar:

- `GET /api/health`
- `GET /api/categories`
- `GET /api/protocols`
- `GET /api/protocols/:id`
- `GET /api/docs` en desarrollo

### 2. Frontend en modo local

Verificar:

- pantalla de bienvenida;
- listado de categorías con colores e iconos correctos;
- navegación a lista de protocolos;
- renderizado completo del detalle del protocolo.

### 3. Frontend en modo API

Configurar:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3001
```

Luego verificar:

- carga de categorías desde backend;
- carga de protocolos por categoría;
- detalle de protocolo;
- ausencia de errores de CORS.

## Qué NO cubren aún estas pruebas

- persistencia de formularios;
- autenticación;
- flujos administrativos;
- pruebas end-to-end en navegador;
- pruebas de rendimiento.

## Cuándo ampliar esta suite

Conviene ampliarla cuando se implemente cualquiera de estas piezas:

- almacenamiento real de formularios;
- login y refresh tokens;
- endpoints POST, PUT o DELETE;
- permisos por rol;
- integración completa entre frontend y backend en CI.

## Fallos comunes y su interpretación

### Fallan pruebas del frontend

Revisar:

- cambios en la forma del dato local;
- cambios en `protocolService.js`;
- ids de categorías o protocolos;
- orden de protocolos por categoría.

### Fallan pruebas del backend

Revisar:

- estructura de respuesta de `ApiResponse`;
- controladores que ahora devuelvan otro contrato;
- códigos de error personalizados;
- configuración de CORS en `env.ts` y `cors.ts`.

### El build pasa pero los tests fallan

Eso suele indicar que el proyecto compila, pero rompimos comportamiento observable. Debe corregirse antes de preparar commits o despliegue.
