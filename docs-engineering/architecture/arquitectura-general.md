# Arquitectura general de SportMetric Academic

## Objetivo

Este documento describe la arquitectura actual del proyecto, las responsabilidades principales de cada capa y la forma en que el sistema quedó preparado para crecer sin sobreingeniería.

## Vista general del sistema

```mermaid
flowchart LR
    Usuario[Usuario final] --> Frontend[Frontend React + Vite]
    Frontend --> Servicios[Servicios de datos]
    Servicios -->|Modo local| Json[JSON locales del frontend]
    Servicios -->|Modo api| Backend[Backend Express + TypeScript]
    Backend --> Prisma[Prisma ORM]
    Prisma --> PostgreSQL[(PostgreSQL)]
```

## Componentes principales

### Frontend

Responsable de:

- navegación entre pantallas;
- renderizado de categorías y protocolos;
- cambio entre fuente local y API;
- presentación visual y experiencia de usuario.

### Backend

Responsable de:

- exponer la API REST;
- aplicar reglas de negocio mínimas;
- centralizar acceso a datos;
- aislar al frontend de la base de datos.

### Base de datos

Responsable de:

- persistir categorías y protocolos;
- servir como fuente única de verdad cuando el frontend opere en modo `api`;
- soportar el crecimiento futuro hacia formularios, autenticación y panel administrativo.

## Arquitectura interna del backend

```mermaid
flowchart TD
    Ruta[Route] --> Controlador[Controller]
    Controlador --> Servicio[Service]
    Servicio --> Repositorio[Repository]
    Repositorio --> Prisma[Prisma Client]
    Prisma --> BD[(PostgreSQL)]
    Controlador --> Respuesta[ApiResponse / ApiError]
```

## Arquitectura interna del frontend

```mermaid
flowchart TD
    Paginas[Páginas React] --> Servicios[Servicios de frontend]
    Servicios --> ApiClient[apiClient.js]
    Servicios --> LocalData[Datos locales]
    ApiClient --> Backend[Backend API]
```

## Flujo de lectura de protocolos

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant S as protocolService
    participant B as Backend
    participant D as PostgreSQL

    U->>F: Abre una categoría o protocolo
    F->>S: Solicita datos
    alt modo local
        S-->>F: Lee JSON del proyecto
    else modo api
        S->>B: GET /api/categories/:id/protocols o GET /api/protocols/:id
        B->>D: Consulta mediante Prisma
        D-->>B: Registros encontrados
        B-->>S: Respuesta estándar de API
        S-->>F: Datos mapeados al formato de UI
    end
    F-->>U: Renderiza contenido
```

## Decisiones estructurales clave

- monorepo simple en lugar de una estructura más pesada;
- frontend desacoplado del backend;
- PostgreSQL como base relacional estándar;
- Prisma como capa de acceso portable;
- variables de entorno para aislar infraestructura del código.

## Preparación para fases futuras

La arquitectura ya quedó lista para incorporar:

- persistencia de formularios;
- autenticación;
- endpoints de escritura;
- edición administrativa;
- cambio de proveedor de infraestructura sin rediseño profundo.
