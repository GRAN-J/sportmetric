# Estado de la API

Documento de referencia de los endpoints disponibles en el backend de SportMetric Academic.

URL base: `http://localhost:3001/api` (desarrollo local con proxy de Vite en el frontend).

## Convenciones generales

- Todas las respuestas exitosas vienen envueltas en `{ data: ... }`.
- Los errores vienen envueltos en `{ error: { code, message, details? } }`.
- Content-Type: `application/json`.
- Authorization: `Bearer <access_token>` en rutas protegidas.
- CORS: restringido a `ALLOWED_ORIGINS` desde el `.env` del backend.
- Rate limit: `generalLimiter` por IP, configurable.
- Health check: `GET /api/health` (sin auth, sin rate limit).

## Catalogo por modulo

### 1. Salud

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Health check del servicio. |

### 2. Autenticacion (`/api/auth`)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Valida credenciales con Argon2, emite access + refresh tokens. |
| POST | `/api/auth/refresh` | No (usa refresh token) | Rota el refresh token y emite uno nuevo. |
| POST | `/api/auth/logout` | Si (Bearer) | Invalida el refresh token del usuario en BD. |
| POST | `/api/auth/forgot-password` | No | Genera token de recuperacion (SHA-256) con TTL de 1h. |
| POST | `/api/auth/reset-password` | No (usa token) | Consume el token y actualiza el hash de contrasena. |

#### Ejemplo de login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sportmetric.com",
  "password": "admin1234"
}
```

Respuesta:

```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "...",
      "email": "admin@sportmetric.com",
      "name": "Administrador",
      "role": "ADMIN"
    }
  }
}
```

### 3. Categorias (`/api/categories`)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/categories` | No | Lista todas las categorias. |
| GET | `/api/categories/:id` | No | Detalle de una categoria. |
| GET | `/api/categories/:id/protocols` | No | Protocolos de la categoria. |
| POST | `/api/categories` | ADMIN | Crea una categoria. |
| PATCH | `/api/categories/:id` | ADMIN | Actualiza una categoria. |
| DELETE | `/api/categories/:id` | ADMIN | Elimina una categoria. |

#### Ejemplo de payload (POST/PATCH)

```json
{
  "name": "Resistencia",
  "slug": "resistencia",
  "color": "#0d9488",
  "description": "Pruebas de resistencia cardiovascular y muscular.",
  "icon": "Activity",
  "order": 1
}
```

### 4. Protocolos (`/api/protocols`)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/protocols` | No | Lista todos los protocolos. |
| GET | `/api/protocols/:id` | No | Detalle con todas las relaciones. |
| POST | `/api/protocols` | ADMIN | Crea un protocolo completo con sus relaciones. |
| PATCH | `/api/protocols/:id` | ADMIN | Actualiza el protocolo y sus relaciones. |
| DELETE | `/api/protocols/:id` | ADMIN | Elimina el protocolo y todas sus relaciones. |

#### Payload completo (POST/PATCH)

```json
{
  "id": "medicion-del-peso",
  "title": "Medicion del peso",
  "categoryId": "uuid-de-categoria",
  "description": "...",
  "objective": "...",
  "materials": [
    { "name": "Bascula SECA", "image": "..." }
  ],
  "checklistItems": [
    { "text": "Verificar calibracion" }
  ],
  "steps": [
    { "step": 1, "title": "...", "description": "...", "video": null }
  ],
  "interruptionCrit": [
    { "text": "Suspender si el estudiante presenta mareo" }
  ],
  "dataRegistry": {
    "title": "Ficha de peso",
    "description": "...",
    "unit": "kg",
    "fields": {}
  },
  "formSchema": {
    "fields": [
      {
        "name": "frecuencia_cardiaca",
        "label": "Frecuencia cardiaca",
        "type": "number",
        "unit": "bpm",
        "required": true
      }
    ]
  }
}
```

El guardado se hace en una sola transaccion Prisma con `upsert` de cada relacion. El backend valida:

- `id` en formato slug (`^[a-z0-9-]+$`).
- `categoryId` existente en BD.
- `title` obligatorio.
- campos personalizados no usan los nombres reservados (`id_estudiante`, `evaluado`, `evaluador`).

### 5. Esquemas de formulario (`/api/forms`)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/forms/:protocolId` | **No (publico)** | Devuelve el esquema con los campos base + personalizados. |
| POST | `/api/forms/:protocolId` | ADMIN | Guarda el esquema de campos personalizados. |

El endpoint `GET` es publico a proposito: cualquier usuario (incluso sin login) puede consultar el esquema para renderizar el formulario de registro correctamente. Esto evita depender del token JWT en la captura publica.

Headers anti-cache obligatorios:

```http
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Pragma: no-cache
Expires: 0
```

#### Respuesta de `GET /api/forms/:protocolId`

```json
{
  "data": {
    "isGeneric": false,
    "fields": [
      { "name": "id_estudiante", "label": "ID del estudiante", "type": "text", "required": true },
      { "name": "evaluado", "label": "Nombre del evaluado", "type": "text", "required": true },
      { "name": "evaluador", "label": "Nombre del evaluador", "type": "text", "required": true },
      { "name": "frecuencia_cardiaca", "label": "Frecuencia cardiaca", "type": "number", "unit": "bpm", "required": true }
    ],
    "protocolId": "medicion-del-peso"
  }
}
```

Si el admin no definio campos personalizados, `isGeneric: true` y `fields` contiene solo los 3 campos base.

### 6. Evaluaciones (`/api/evaluations`)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/api/evaluations` | No (captura publica) | Registra una nueva evaluacion. |
| GET | `/api/evaluations` | ADMIN | Lista todas las evaluaciones (filtros: `protocolId`, `search`). |
| GET | `/api/evaluations/:id` | ADMIN | Detalle de una evaluacion. |
| PATCH | `/api/evaluations/:id` | ADMIN | Actualiza resultados o notas. |
| DELETE | `/api/evaluations/:id` | ADMIN | Elimina una evaluacion. |
| GET | `/api/evaluations/student/:studentId` | ADMIN | Historial de un estudiante. |

#### Payload de `POST /api/evaluations`

```json
{
  "protocolId": "medicion-del-peso",
  "studentId": "EST-2024-001",
  "subjectName": "Juan Perez",
  "evaluatorName": "Ana Docente",
  "results": {
    "id_estudiante": "EST-2024-001",
    "evaluado": "Juan Perez",
    "evaluador": "Ana Docente",
    "frecuencia_cardiaca": 72
  },
  "notes": "Sin novedades.",
  "date": "2026-07-27T10:00:00Z"
}
```

### 7. Usuarios (`/api/users`)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/users` | ADMIN | Lista usuarios. |
| GET | `/api/users/:id` | ADMIN | Detalle de un usuario. |
| POST | `/api/users` | ADMIN | Crea un usuario (Argon2 hashea la contrasena). |
| PATCH | `/api/users/:id` | ADMIN | Actualiza un usuario. |
| DELETE | `/api/users/:id` | ADMIN | Elimina un usuario. |

### 8. Analiticas (`/api/analytics`)

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/api/analytics/summary` | ADMIN | Resumen general: usuarios, protocolos, evaluaciones, actividad reciente. |
| GET | `/api/analytics/activity` | ADMIN | Evaluaciones por dia (ultimos 30 dias). |
| GET | `/api/analytics/top-protocols` | ADMIN | Top 5 protocolos mas evaluados. |

## Codigos de error estandar

| HTTP | Codigo interno | Significado |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Payload invalido. |
| 400 | `MISSING_CATEGORY` | Falta el `categoryId` en protocolo. |
| 400 | `CATEGORY_NOT_FOUND` | `categoryId` no existe en BD. |
| 400 | `INVALID_ID` | El slug no cumple el patron `^[a-z0-9-]+$`. |
| 401 | `UNAUTHORIZED` | Token invalido o expirado. |
| 403 | `FORBIDDEN` | Rol insuficiente. |
| 404 | `NOT_FOUND` | Recurso no encontrado. |
| 404 | `PROTOCOL_NOT_FOUND` | Protocolo no existe. |
| 404 | `EVALUATION_NOT_FOUND` | Evaluacion no existe. |
| 409 | `UNIQUE_CONSTRAINT` | Violacion de unicidad (ej: email duplicado). |
| 429 | `RATE_LIMIT` | Demasiadas peticiones. |
| 500 | `DATABASE_ERROR` | Error generico de base de datos. |
| 500 | `INTERNAL` | Error interno no clasificado. |

## Cabeceras relevantes

| Cabecera | Donde | Proposito |
| --- | --- | --- |
| `Authorization: Bearer <token>` | Rutas protegidas | Autenticacion JWT. |
| `Content-Type: application/json` | POST/PATCH/PUT | Declarar JSON. |
| `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate` | `/api/forms/*` | Evitar cache en esquemas dinamicos. |
| `Pragma: no-cache` | `/api/forms/*` | Compatibilidad con HTTP/1.0. |
| `Expires: 0` | `/api/forms/*` | Forzar expiracion inmediata. |

## Ejemplo de curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sportmetric.com","password":"admin1234"}'

# Listar protocolos
curl http://localhost:3001/api/protocols

# Crear categoria (con token)
curl -X POST http://localhost:3001/api/categories \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Resistencia","slug":"resistencia","color":"#0d9488"}'
```
