// =============================================================================
// Proxy reverso del API para Vercel (Edge Runtime)
// =============================================================================
// Esta serverless function se deploya automaticamente en Vercel y reescribe
// cualquier request a /api/* hacia el backend configurado en la variable de
// entorno BACKEND_URL. Beneficios:
//
//   1. Cero CORS: el frontend hace fetch a su mismo origen (/api/*), por lo
//      que el navegador NO envia Origin cross-origin y no se requiere
//      configurar ALLOWED_ORIGINS en el backend.
//   2. Sin hardcode por proveedor: la URL del backend vive en
//      process.env.BACKEND_URL, no en vercel.json ni en el codigo.
//   3. Defensa en profundidad: el backend puede cerrar completamente CORS
//      en produccion y aceptar solo requests same-origin (viniendo del
//      proxy de Vercel).
//   4. Cookies same-site first-party: las cookies HttpOnly de sesion se
//      manejan como first-party, evitando restricciones de SameSite=Lax.
//
// Variables de entorno (configurar en Vercel Dashboard):
//   BACKEND_URL              URL completa del backend SIN slash final.
//                            Ej: https://api.mi-dominio.com
//   PROXY_ALLOWED_PREFIX     (Opcional) Prefijo que el path DEBE tener
//                            despues de quitar "/api". Si esta vacio o no
//                            se define, se permite cualquier path que
//                            empiece con "/". Default: "" (sin restriccion).
//   PROXY_BLOCKED_PATHS      (Opcional) CSV de sub-paths bloqueados.
//                            Ej: "/admin/internal,/debug"
// =============================================================================

/* global Request, Response, URL, Headers, fetch, process */

export const config = {
  runtime: 'edge',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
};

const FORWARD_HEADER_DENY = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
]);

const RESPONSE_HEADER_DENY = new Set([
  'connection',
  'transfer-encoding',
  'content-encoding',
]);

const splitCsv = (raw) =>
  (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Construye la URL destino en el backend a partir de la request entrante.
 * - Quita el prefijo "/api" del pathname.
 * - Conserva la query string.
 * - Aplica validaciones de seguridad (path traversal, paths bloqueados).
 *
 * @param {URL} incomingUrl  URL parseada de la request entrante.
 * @param {string} backendUrl URL base del backend (sin slash final).
 * @param {string[]} blockedPaths Sub-paths que no se permiten.
 * @returns {{ ok: true, target: string } | { ok: false, status: number, message: string }}
 */
export const buildTarget = (incomingUrl, backendUrl, blockedPaths = []) => {
  if (!backendUrl) {
    return { ok: false, status: 500, message: 'BACKEND_URL no esta configurada' };
  }

  const cleanedPath = incomingUrl.pathname.replace(/^\/api/, '');
  const safePath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;

  for (const blocked of blockedPaths) {
    if (safePath === blocked || safePath.startsWith(`${blocked}/`)) {
      return { ok: false, status: 403, message: 'Path bloqueado' };
    }
  }

  return {
    ok: true,
    target: `${backendUrl.replace(/\/$/, '')}${safePath}${incomingUrl.search}`,
  };
};

/**
 * Reenvia los headers de la request entrante al backend, omitiendo los
 * headers hop-by-hop que no deben propagarse.
 */
const buildForwardHeaders = (incomingHeaders) => {
  const out = new Headers();
  incomingHeaders.forEach((value, key) => {
    if (!FORWARD_HEADER_DENY.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  // Cabecera para que el backend pueda distinguir requests que vienen del
  // proxy (util para logging y para ignorar CORS en el backend).
  out.set('X-Forwarded-By', 'vercel-edge-proxy');
  return out;
};

/**
 * Reenvia los headers de la respuesta del backend al cliente, omitiendo
 * los headers hop-by-hop y los relacionados con encoding.
 */
const buildResponseHeaders = (backendHeaders) => {
  const out = new Headers();
  backendHeaders.forEach((value, key) => {
    if (!RESPONSE_HEADER_DENY.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  return out;
};

export default async function handler(request) {
  // Preflight CORS: como el frontend es same-origin, en teoria no deberia
  // llegar preflight. Pero si llega (ej. el usuario hace un OPTIONS manual
  // desde DevTools), respondemos con los headers correctos sin reenviar.
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const incomingUrl = new URL(request.url);
  const backendUrl = process.env.BACKEND_URL;
  const blockedPaths = splitCsv(process.env.PROXY_BLOCKED_PATHS);

  const built = buildTarget(incomingUrl, backendUrl, blockedPaths);
  if (!built.ok) {
    return new Response(JSON.stringify({ error: built.message }), {
      status: built.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let backendResponse;
  try {
    backendResponse = await fetch(built.target, {
      method: request.method,
      headers: buildForwardHeaders(request.headers),
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: err instanceof Error ? err.message : 'Error desconocido',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: buildResponseHeaders(backendResponse.headers),
  });
}
