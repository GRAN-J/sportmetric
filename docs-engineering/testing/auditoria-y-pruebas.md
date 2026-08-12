# Auditoria y pruebas

Este documento describe la estrategia, herramientas y estado actual de las pruebas del proyecto SportMetric Academic.

## Herramientas

| Capa | Framework | Mocking | Cobertura |
| --- | --- | --- | --- |
| Frontend | Vitest + Testing Library + jsdom | `vi.mock`, `vi.hoisted`, factory injection | Suites por modulo + fixtures. |
| Backend | Vitest + Supertest | Mock de Prisma client | Suites por modulo + DTOs. |

## Convenciones

- Cada modulo del backend tiene su carpeta espejo en `backend/src/test/<modulo>/`.
- Cada modulo del frontend tiene su carpeta espejo en `frontend/src/test/<modulo>/`.
- Los fixtures compartidos viven en `frontend/src/test/fixtures.js`.
- Los helpers de mock de Prisma viven en `backend/src/test/shared/prismaMock.ts`.

## Suites actuales

### Frontend (134 tests en 25 archivos)

| Suite | Foco | Tests |
| --- | --- | ---: |
| `test/services/apiClient.test.js` | XMLHttpRequest factory, promesas, AbortSignal, parseo de `data` y `error`. | 7 |
| `test/services/authService.test.js` | Login, refresh, logout, recuperacion, Bearer token. | 14 |
| `test/services/formService.test.js` | Cache busting en `getFormSchema`. | 5 |
| `test/services/evaluationService.test.js` | CRUD de evaluaciones, filtros. | 7 |
| `test/services/protocolService.test.js` | CRUD de protocolos y detalle con includes. | 9 |
| `test/services/categoryService.test.js` | CRUD de categorias. | 5 |
| `test/services/analyticsService.test.js` | Resumenes y top protocolos. | 4 |
| `test/pages/Login.test.jsx` | Formulario de inicio de sesion. | 5 |
| `test/pages/ForgotPassword.test.jsx` | Solicitud de recuperacion. | 4 |
| `test/pages/ResetPassword.test.jsx` | Confirmacion de nueva contrasena. | 6 |
| `test/pages/Welcome.test.jsx` | Pagina de bienvenida publica. | 2 |
| `test/pages/Categories.test.jsx` | Listado publico de categorias. | 2 |
| `test/pages/ProtocolList.test.jsx` | Listado de protocolos por categoria. | 3 |
| `test/pages/ProtocolDetail.test.jsx` | Detalle publico del protocolo. | 3 |
| `test/pages/EvaluationHistory.test.jsx` | Historial de evaluaciones por estudiante. | 4 |
| `test/pages/protocol/protocolSections.test.jsx` | Render de las 7 secciones del detalle y DynamicForm con campos base. | 5 |
| `test/pages/protocol/protocolDataRegistry.test.jsx` | Carga del esquema, render del DynamicForm, submit, manejo de errores. | 3 |
| `test/layout/MainLayout.test.jsx` | Layout publico con Header y BottomNav. | 2 |
| `test/layout/AdminLayout.test.jsx` | Navegacion, `<Outlet />`, logout, items del menu. | 4 |
| `test/components/ErrorBoundary.test.jsx` | Captura de errores React y render del fallback. | 1 |
| `test/components/navigation/BottomNav.test.jsx` | Navegacion inferior, highlight del item activo. | 4 |
| `test/App.test.jsx` | Smoke test de la aplicacion. | 1 |
| `test/proxy/proxy.test.js` | Rewrite de Vite y bypass de prefijo `/api`. | 17 |
| `test/vite/csp.test.js` | Content-Security-Policy del build de Vite. | 11 |
| `test/shared/exportUtils.test.js` | Helpers de exportacion PDF/CSV. | 6 |
| **Total** | | **134** |

### Backend (93 tests en 19 archivos)

| Suite | Foco | Tests |
| --- | --- | ---: |
| `test/app.test.ts` | Contrato HTTP principal con `supertest` (rutas publicas + admin). | 6 |
| `test/config/env.test.ts` | Validacion con Zod de variables de entorno. | 2 |
| `test/config/database.test.ts` | Instancia singleton de Prisma Client. | 2 |
| `test/config/jwt.test.ts` | Firmado y verificacion de tokens. | 1 |
| `test/config/cors.test.ts` | Matching de origines exactos, wildcard dominio y wildcard total. | 16 |
| `test/modules/categories/category.service.test.ts` | CRUD, slug, color hex. | 2 |
| `test/modules/categories/category.repository.test.ts` | Queries Prisma de categorias. | 3 |
| `test/modules/protocols/protocol.service.test.ts` | Validacion de payload, slug, categoria existente. | 3 |
| `test/modules/protocols/protocol.repository.test.ts` | Includes, orden, `formSchema`, transaccion. | 5 |
| `test/modules/forms/form.service.test.ts` | Concatenacion Ficha Tecnica base + custom, `isGeneric`. | 5 |
| `test/modules/forms/form.repository.test.ts` | Upsert y lectura de esquemas. | 4 |
| `test/modules/evaluations/evaluation.repository.test.ts` | `findAll`, `findByStudent`, filtros. | 11 |
| `test/modules/analytics/analytics.service.test.ts` | Resumen, actividad, top protocolos. | 8 |
| `test/modules/users/user.repository.test.ts` | CRUD, unicidad de email, hashing. | 8 |
| `test/shared/ApiResponse.test.ts` | Envoltorio estandar de respuestas. | 2 |
| `test/shared/auth.middleware.test.ts` | `authenticate` y `authorize('ADMIN')`. | 7 |
| `test/shared/error.filter.test.ts` | ApiError, Prisma P2002, P2025, genericos. | 4 |
| `test/shared/error.filter.development.test.ts` | Mismo en modo `development` con detalles. | 3 |
| `test/shared/rate-limiter.middleware.test.ts` | Limite por IP y headers. | 1 |
| **Total** | | **93** |

## Total general: 227 tests (134 frontend + 93 backend) en 44 archivos

## Comandos para correr la suite

### Frontend

```bash
cd frontend
npm install
npm run lint          # ESLint con react-hooks
npm test -- --run     # Vitest, una sola corrida, sin watch
npm run build         # Build de produccion con Vite
```

### Backend

```bash
cd backend
npm install
npm run lint
npm test -- --run
npm run build         # Compilacion TypeScript
```

## Estado verificado

En la ultima corrida verificada:

- Frontend `lint`: 0 errores.
- Frontend `test --run`: 134/134 pasan.
- Frontend `build`: compila correctamente.
- Backend `tsc --noEmit`: 0 errores.
- Backend `test --run`: 93/93 pasan.

## Cobertura por capa

### Capa de servicios (backend)

- Cada servicio tiene al menos 2-8 tests que cubren happy path, error de validacion y error de negocio.
- Las transacciones Prisma (`prisma.$transaction`) se verifican en `protocol.repository.test.ts`.

### Capa de controladores (backend)

- El contrato HTTP principal se valida en `app.test.ts` con `supertest`.
- Los codigos de error estandar se verifican en `error.filter.test.ts` y `error.filter.development.test.ts`.

### Capa de servicios frontend

- `apiClient` se prueba mockeando el factory (`xhrFactory.js`), no el global XMLHttpRequest.
- `formService` verifica que se anada `_t=Date.now()` para evitar cache.
- `evaluationService` y `authService` prueban happy path y error.

### Capa de paginas (frontend)

- Cada pagina se renderiza con `@testing-library/react` y se valida que:
  - muestra los datos correctos;
  - reacciona a interacciones del usuario (clicks, cambios de input);
  - llama a los servicios esperados;
  - muestra mensajes de error cuando falla.

### Capa de infraestructura

- `proxy.test.js` valida el rewrite de Vite (17 tests).
- `vite/csp.test.js` valida la Content-Security-Policy del build (11 tests).
- `cors.test.ts` cubre el matching de origines exactos, wildcard dominio y wildcard total (16 tests).

## Auditoria tecnica realizada

En la auditoria de la Fase 2 se encontraron y corrigieron los siguientes problemas:

### Bugs reales

1. `<label>` con atributo `name` (HTML invalido, ignorado por React) en `Login.jsx`.
2. `fetchEvaluations` recibia un `signal` que no usaba.
3. `apiClient.js` instanciaba `new XMLHttpRequest()` directamente, sin factor inyectable.
4. `apiClient.test.js` estaba escrito para `fetch` (vieja implementacion) y nunca se migro a XMLHttpRequest.
5. `protocolSections.test.jsx` validaba la Ficha Tecnica vieja (mediciones 1, 2, promedio).
6. `error.filter.ts` filtraba detalles de errores Prisma desconocidos en desarrollo, contradiciendo el test que pedia ocultarlos.
7. `protocol.repository.test.ts` no esperaba `formSchema: true` en el `include`.

### Mejoras estructurales

- Se introdujo `xhrFactory.js` para que el cliente HTTP sea testeable de forma honesta (Dependency Inversion).
- Se reescribio `apiClient.test.js` para testear la logica REAL del cliente (promesas, manejo de errores, AbortSignal, wrapper `data`).
- Se actualizo `protocolSections.test.jsx` al nuevo contrato del DynamicForm.
- Se desactivo la regla `react-hooks/set-state-in-effect` globalmente con justificacion documentada (es legitima para el patron de carga inicial con AbortController).
- Se elimino el componente obsoleto `TechnicalSheet.jsx`.

## Reglas que valida el lint

- `react-hooks/rules-of-hooks`: hooks en el orden y cantidad correctos.
- `react-hooks/exhaustive-deps`: dependencias declaradas en arrays de hooks.
- `no-unused-vars`: variables declaradas y no usadas.
- `react-refresh/only-export-components`: solo se exportan componentes o constantes triviales.
- Convenciones del proyecto: `prefer-const`, `eqeqeq`, `no-var`, etc.

## Buenas practicas

- No se usa `dangerouslySetInnerHTML`.
- No se exponen secretos en el codigo.
- No se renderizan `console.log` en codigo de produccion.
- No se desactiva el lint con `// eslint-disable` sin justificacion.
- No se hacen mocks que oculten bugs (cada test verifica la logica real).
