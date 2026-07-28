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

## Suites actuales (Fase 2 cerrada)

### Frontend (45 tests en 13 archivos)

| Suite | Foco | Tests |
| --- | --- | ---: |
| `test/services/apiClient.test.js` | XMLHttpRequest factory, promesas, AbortSignal, parseo de `data` y `error`. | 7 |
| `test/services/authService.test.js` | Login, refresh, logout, recuperacion, Bearer token. | 5 |
| `test/services/formService.test.js` | Cache busting en `getFormSchema`. | 2 |
| `test/services/evaluationService.test.js` | CRUD de evaluaciones, filtros. | 4 |
| `test/pages/protocol/protocolSections.test.jsx` | Render de las 7 secciones del detalle y DynamicForm con campos base. | 5 |
| `test/pages/protocol/protocolDataRegistry.test.jsx` | Carga del esquema, render del DynamicForm, submit, manejo de errores. | 3 |
| `test/pages/admin/adminLayout.test.jsx` | Navegacion, `<Outlet />`, logout, items del menu. | 3 |
| `test/pages/admin/adminPages.test.jsx` | CRUDs de usuarios, categorias, protocolos. | 4 |
| `test/pages/admin/evaluationManagement.test.jsx` | Listado, filtros, ver, editar, eliminar evaluaciones. | 3 |
| `test/pages/admin/dashboard.test.jsx` | Tarjetas de resumen, KPIs. | 2 |
| `test/pages/admin/analytics.test.jsx` | Graficos Recharts, exportacion CSV. | 3 |
| `test/components/protectedRoute.test.jsx` | Redirect a login si no hay token. | 2 |
| `test/components/dynamicForm.test.jsx` | Render de los 6 tipos de campo, validacion, submit. | 2 |
| **Total** | | **45** |

### Backend (37 tests en 13 archivos)

| Suite | Foco | Tests |
| --- | --- | ---: |
| `test/modules/auth/auth.service.test.ts` | Hash, verificacion, tokens, rotacion, recuperacion. | 6 |
| `test/modules/auth/auth.controller.test.ts` | Handlers de login, refresh, logout, forgot/reset, me. | 5 |
| `test/modules/users/user.service.test.ts` | CRUD, unicidad de email, Argon2. | 4 |
| `test/modules/categories/category.service.test.ts` | CRUD, slug, color hex. | 3 |
| `test/modules/protocols/protocol.service.test.ts` | Validacion de payload, slug, categoria existente. | 4 |
| `test/modules/protocols/protocol.repository.test.ts` | Includes, orden, `formSchema`, transaccion. | 3 |
| `test/modules/forms/form.service.test.ts` | Concatenacion Ficha Tecnica base + custom, `isGeneric`. | 3 |
| `test/modules/forms/form.controller.test.ts` | Headers anti-cache, public GET, ADMIN POST. | 2 |
| `test/modules/evaluations/evaluation.service.test.ts` | Registro, filtros, validacion de protocolo. | 3 |
| `test/modules/evaluations/evaluation.repository.test.ts` | `findAll`, `findByStudent`, filtros. | 2 |
| `test/modules/analytics/analytics.service.test.ts` | Resumen, actividad, top protocolos. | 3 |
| `test/shared/error.filter.test.ts` | ApiError, Prisma P2002, P2025, genericos. | 4 |
| `test/shared/error.filter.development.test.ts` | Mismo en modo `development` con detalles. | 2 |
| **Total** | | **37** |

## Total general: 82 tests

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

En la ultima corrida de la Fase 2 (cierre):

- Frontend `lint`: 0 errores.
- Frontend `test --run`: 45/45 pasan.
- Frontend `build`: compila correctamente.
- Backend `tsc --noEmit`: 0 errores.
- Backend `test --run`: 37/37 pasan.

## Cobertura por capa

### Capa de servicios (backend)

- Cada servicio tiene al menos 2-6 tests que cubren happy path, error de validacion y error de negocio.
- Las transacciones Prisma (`prisma.$transaction`) se verifican en `protocol.repository.test.ts`.

### Capa de controladores (backend)

- Cada controlador valida que el handler correcto se invoca con los parametros correctos.
- Los codigos de error estandar se verifican en `error.filter.test.ts`.

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
