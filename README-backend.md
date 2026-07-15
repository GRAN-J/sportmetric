# SportMetric Academic - Backend

Backend API de SportMetric Academic construido con Express, TypeScript, Prisma y PostgreSQL.

## Responsabilidades del backend

- exponer endpoints REST para categorias y protocolos;
- validar configuracion y entorno;
- conectarse a PostgreSQL;
- documentar la API via Swagger;
- servir como base para autenticacion y persistencia futura de formularios.

## Stack

- Node.js 22.x
- Express 5
- TypeScript
- Prisma 7
- PostgreSQL
- Pino
- Zod
- Helmet
- CORS
- Rate limit
- Vitest
- ESLint

## Requisitos

- Node.js 22.x
- PostgreSQL 16
- archivo `.env` configurado

## Variables de entorno

Partir de `backend/.env.example`.

Variables principales:

- `NODE_ENV`
- `PORT`
- `BACKEND_PUBLIC_URL`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`

### Ejemplo local

```env
NODE_ENV=development
PORT=3001
BACKEND_PUBLIC_URL=http://localhost:3001
DATABASE_URL="postgresql://postgres:1234@localhost:5432/sportmetric?schema=public"
JWT_SECRET="tu-secreto-super-seguro-para-access-token-cambiar-en-produccion"
JWT_REFRESH_SECRET="tu-secreto-super-seguro-para-refresh-token-cambiar-en-produccion"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

## Instalacion y arranque

```bash
npm install
npm run db:migrate:dev
npm run db:seed
npm run dev
```

## Scripts disponibles

- `npm run dev`: desarrollo con `tsx watch`
- `npm run build`: genera Prisma Client, compila TypeScript y copia el cliente Prisma a `dist/generated/prisma`
- `npm run start`: ejecuta el build compilado
- `npm run lint`: valida calidad estatica
- `npm run test`: ejecuta la suite del backend
- `npm run test:watch`: ejecuta pruebas en modo observacion
- `npm run test:coverage`: ejecuta pruebas con cobertura
- `npm run db:generate`: genera Prisma Client
- `npm run db:migrate:dev`: migraciones en desarrollo
- `npm run db:migrate:deploy`: aplica migraciones para produccion
- `npm run db:seed`: ejecuta el seed
- `npm run db:studio`: abre Prisma Studio
- `npm run deploy:render`: build + migraciones para despliegue

## Endpoints implementados

### Salud

- `GET /api/health`

### Categorias

- `GET /api/categories`
- `GET /api/categories/:id`
- `GET /api/categories/:id/protocols`

### Protocolos

- `GET /api/protocols`
- `GET /api/protocols/:id`

## Swagger

En desarrollo:

- `http://localhost:3001/api/docs`

## Estado real validado

Se verifico recientemente que:

- `npm run lint` pasa;
- `npm run test:coverage` pasa;
- `npm run build` pasa;
- `npm start` funciona con el build compilado;
- `GET /api/health`, `GET /api/categories` y `GET /api/protocols/:id` responden correctamente en runtime.

Cobertura verificada:

- statements: `96.35%`
- branches: `79.62%`
- functions: `96.66%`
- lines: `96.21%`

## Auditoria tecnica del backend

Ejecutar:

```bash
npm run lint
npm run test:coverage
npm run build
```

La suite actual valida:

- configuracion `env`, `cors`, `jwt` y base de datos;
- repositorios y servicios de categorias y protocolos;
- `ApiResponse`, filtro de errores y rate limit;
- contrato HTTP principal con `supertest`.

## Seed y datos iniciales

El seed:

- limpia tablas de contenido;
- carga categorias desde `frontend/src/data/categories.js`;
- carga protocolos desde `frontend/src/data/protocols/*.json`.

Esto permite mantener una transicion ordenada entre contenido local y contenido en base de datos.

## Despliegue en Render

Configuracion recomendada del servicio web:

- Root Directory: `backend`
- Build Command: `npm install && npm run deploy:render`
- Start Command: `npm run start`

Variables minimas:

- `DATABASE_URL`
- `BACKEND_PUBLIC_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `NODE_ENV=production`

## Problemas comunes

### Error de Prisma Client no generado

Ejecutar:

```bash
npm run db:generate
```

### El backend compila, pero `npm start` falla

Ejecutar:

```bash
npm run build
```

El build actual genera Prisma Client y lo copia a `dist/generated/prisma`.

### Error por tablas faltantes

Ejecutar:

```bash
npm run db:migrate:dev
```

o en produccion:

```bash
npm run db:migrate:deploy
```

### Error por datos vacios

Ejecutar:

```bash
npm run db:seed
```

### Error de CORS

Revisar:

- `FRONTEND_URL`
- `ALLOWED_ORIGINS`

Si usas Vercel, asegurate de incluir la URL publica del frontend.

### El backend compila pero no conecta a Render Postgres

Revisar:

- `DATABASE_URL` exacta entregada por Render;
- que la base este creada;
- que las migraciones se hayan aplicado;
- que `NODE_ENV` y `BACKEND_PUBLIC_URL` esten correctos.

## Documentacion relacionada

- `README.md`
- `docs-engineering/architecture/arquitectura-general.md`
- `docs-engineering/api/estado-api.md`
- `docs-engineering/database/operacion-postgresql-prisma.md`
- `docs-engineering/diagrams/indice-diagramas.md`
- `docs-engineering/testing/auditoria-y-pruebas.md`
