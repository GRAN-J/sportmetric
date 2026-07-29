// =============================================================================
// Generador de la cadena Content-Security-Policy (CSP) para el frontend
// =============================================================================
// Este modulo corre en el servidor de Vite (Node), por lo que `process` esta
// disponible como global en build/dev.
// =============================================================================

/* global process */

const DEV_ORIGINS = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'ws://localhost:5173',
  'ws://localhost:5174',
  'ws://127.0.0.1:5173',
  'ws://127.0.0.1:5174',
];

const splitCsv = (raw) =>
  (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const deriveApiOrigin = (raw) => {
  const apiBase = (raw ?? '').trim();
  if (!apiBase) return '';
  try {
    return new URL(apiBase).origin;
  } catch {
    console.warn(`[csp] VITE_API_BASE_URL no es una URL valida: "${apiBase}"`);
    return '';
  }
};

/**
 * Construye la cadena CSP a partir de las variables de entorno.
 * @param {Record<string, string | undefined>} [env=process.env] Entorno de build.
 * @returns {string} Cadena CSP lista para usar en <meta>.
 */
export const buildCsp = (env = process.env) => {
  const apiOrigin = deriveApiOrigin(env.VITE_API_BASE_URL);
  const extraConnect = splitCsv(env.VITE_CSP_EXTRA_CONNECT_SRC);
  const extraImg = splitCsv(env.VITE_CSP_EXTRA_IMG_SRC);
  const extraScript = splitCsv(env.VITE_CSP_EXTRA_SCRIPT_SRC);

  const connectSrc = ["'self'", apiOrigin, ...DEV_ORIGINS, ...extraConnect]
    .filter(Boolean)
    .join(' ');

  const imgSrc = ["'self'", 'data:', ...extraImg].filter(Boolean).join(' ');

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://fonts.googleapis.com',
    ...extraScript,
  ]
    .filter(Boolean)
    .join(' ');

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src ${imgSrc}`,
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
  ];

  return directives.join('; ');
};

/**
 * Plugin de Vite que reemplaza el placeholder __CSP__ dentro de
 * <meta http-equiv="Content-Security-Policy">. Se aplica tanto en dev
 * (cuando Vite sirve el HTML) como en build (cuando genera el bundle).
 */
export const cspPlugin = () => ({
  name: 'sportmetric:csp',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      if (!html.includes('__CSP__')) {
        return html;
      }
      return html.replace('__CSP__', buildCsp());
    },
  },
});
