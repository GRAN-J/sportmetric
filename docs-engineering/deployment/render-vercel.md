# Despliegue recomendado: Vercel + Render

## Objetivo

Desplegar:

- frontend en Vercel;
- backend en Render;
- PostgreSQL en Render.

## Arquitectura final

```mermaid
flowchart LR
    Usuario[Usuario] --> Frontend[Frontend en Vercel]
    Frontend --> Backend[Backend API en Render]
    Backend --> DB[(PostgreSQL en Render)]
```

## Estado actual del despliegue

La configuracion del monorepo ya quedo alineada con el estado real del proyecto:

- Vercel construye el frontend desde la raiz usando `vercel.json`;
- `vercel.json` ya agrega rewrite SPA hacia `index.html` para evitar 404 en rutas profundas;
- el backend ya pasa `npm ci`, `lint`, `test:coverage` y `build`;
- el build del backend copia el cliente Prisma generado a `dist/generated/prisma`, necesario para que `npm start` funcione en runtime;
- GitHub Actions valida frontend y backend antes de despliegues posteriores.

## 1. Crear la base de datos en Render

1. Crear un servicio PostgreSQL.
2. Guardar la `DATABASE_URL` que entrega Render.
3. No hace falta abrir consola todavia.

Importante:

- Render crea la instancia de base de datos;
- Prisma crea las tablas;
- el seed carga los datos iniciales cuando se necesite.

## 2. Crear el backend en Render

Configuracion recomendada:

- Service Type: Web Service
- Root Directory: `backend`
- Build Command: `npm install && npm run deploy:render`
- Start Command: `npm run start`

Variables de entorno:

- `NODE_ENV=production`
- `PORT=10000` o el puerto que Render gestione internamente
- `BACKEND_PUBLIC_URL=https://tu-backend.onrender.com`
- `DATABASE_URL=...`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `FRONTEND_URL=https://tu-frontend.vercel.app`
- `ALLOWED_ORIGINS=https://tu-frontend.vercel.app`
- `TRUST_PROXY_HOPS=1`

Notas:

- `deploy:render` compila y aplica migraciones;
- el seed no tiene por que correr en cada deploy;
- si necesitas poblar datos iniciales, ejecutalo una vez de forma controlada;
- `npm run build` ya incluye la copia del cliente Prisma a `dist/`, asi que no hace falta un paso extra manual;
- si el backend deja de estar detras de un proxy confiable, `TRUST_PROXY_HOPS` debe volver a `0`.

## 3. Crear el frontend en Vercel

Configuracion recomendada:

- Framework: Vite
- Root Directory: `frontend` si configuras el proyecto dentro de esa carpeta, o raiz del repo usando `vercel.json`

Variables:

- `VITE_DATA_SOURCE=api`
- `VITE_API_BASE_URL=https://tu-backend.onrender.com`

Nota:

- si despliegas desde la raiz del monorepo, mantener `vercel.json` evita que Vercel intente construir el proyecto equivocado.
- si cambias a Netlify, Render Static Site u otro host, debes replicar el fallback SPA hacia `index.html`.

## 4. Flujo de cambios normales

Despues del primer setup, el flujo esperado es:

1. hacer push al repositorio;
2. GitHub Actions valida frontend y backend;
3. Render redepliega backend;
4. Vercel redepliega frontend.

```mermaid
sequenceDiagram
    participant Dev as Desarrollador
    participant Git as Repositorio
    participant CI as GitHub Actions
    participant Render as Render
    participant Vercel as Vercel

    Dev->>Git: Push al repositorio
    Git-->>CI: Dispara lint, cobertura y build
    CI-->>Render: Cambios validados
    CI-->>Vercel: Cambios validados
    Render->>Render: Instala, compila y ejecuta migraciones
    Vercel->>Vercel: Construye la SPA
```

## 5. Cuando si hace falta intervencion manual

- cuando quieres correr el seed por primera vez;
- cuando necesitas corregir datos manualmente;
- cuando cambias secretos o URLs;
- cuando agregas nuevas migraciones.

## 6. Cambio futuro de proveedor

La solucion quedo preparada para poder mover:

- frontend a Netlify, Render Static Site o similar;
- backend a Railway, Fly.io, AWS, Azure o GCP;
- PostgreSQL a Neon, Supabase, Railway o RDS.

La clave es mantener:

- `DATABASE_URL`;
- `BACKEND_PUBLIC_URL`;
- `ALLOWED_ORIGINS`;
- `VITE_API_BASE_URL`;
- `TRUST_PROXY_HOPS`.

## 7. Procedimiento de migracion

### Migrar solo el frontend

1. desplegar `frontend/` con `npm ci` y `npm run build`;
2. publicar `frontend/dist`;
3. configurar `VITE_DATA_SOURCE=api`;
4. configurar `VITE_API_BASE_URL` con la URL publica del backend;
5. activar fallback SPA a `index.html`;
6. validar navegacion profunda y carga de categorias/protocolos.

### Migrar solo el backend

1. desplegar `backend/` con `npm ci`, `npm run build` y `npm run start`;
2. configurar `DATABASE_URL`, `BACKEND_PUBLIC_URL`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, `JWT_SECRET`, `JWT_REFRESH_SECRET`;
3. ajustar `TRUST_PROXY_HOPS` segun la topologia real del host;
4. ejecutar `npm run db:migrate:deploy`;
5. validar `GET /api/health`, `GET /api/categories` y `GET /api/protocols/:id`.

### Migrar frontend y backend al mismo tiempo

1. desplegar primero backend y base de datos;
2. validar API publica;
3. desplegar frontend apuntando a la nueva `VITE_API_BASE_URL`;
4. actualizar `FRONTEND_URL` y `ALLOWED_ORIGINS` en backend con el dominio final del frontend;
5. volver a validar CORS, rutas profundas y endpoints principales.

## 8. Checklist post-migracion

- `npm ci`, `lint`, `test:coverage` y `build` siguen pasando en CI;
- el frontend no devuelve 404 en rutas internas al refrescar;
- el backend responde con la IP real correcta tras el proxy;
- CORS permite el nuevo dominio del frontend;
- la app carga categorias y protocolos reales desde la API;
- Swagger y health check responden en el backend publico.

## Diagrama de portabilidad

```mermaid
flowchart TD
    Codigo[Codigo del proyecto] --> Variables[Variables de entorno]
    Variables --> FrontProvider[Proveedor del frontend]
    Variables --> BackProvider[Proveedor del backend]
    Variables --> DbProvider[Proveedor de PostgreSQL]

    FrontProvider --> OpcionesFront[Vercel / Netlify / Render Static Site]
    BackProvider --> OpcionesBack[Render / Railway / Fly.io / AWS / Azure / GCP]
    DbProvider --> OpcionesDb[Render / Neon / Supabase / Railway / RDS]
```
