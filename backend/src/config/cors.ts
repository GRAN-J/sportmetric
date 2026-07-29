// =============================================================================
// Configuración de CORS (Cross-Origin Resource Sharing)
// =============================================================================
// CORS permite que el frontend (en un dominio diferente) se comunique con el backend.
// - origin: URL del frontend permitida
// - credentials: Permite enviar cookies y encabezados de autenticación
// - methods: Métodos HTTP permitidos
// - allowedHeaders: Encabezados permitidos en las peticiones
// =============================================================================
// Reglas soportadas en ALLOWED_ORIGINS (separadas por coma):
//   - Origen exacto:        "https://app.ejemplo.com"
//   - Wildcard de dominio:  "*.vercel.app"  -> matchea cualquier subdominio
//                                            de vercel.app (incluye previews).
//   - Wildcard total:       "*"             -> permite CUALQUIER origen.
//                                            Solo usar en desarrollo local.
// =============================================================================

import { CorsOptions } from 'cors';
import { env } from './env';

// -----------------------------------------------------------------------------
// Tipos de reglas que podemos declarar en ALLOWED_ORIGINS.
// -----------------------------------------------------------------------------
type OriginRule =
  | { type: 'all' }
  | { type: 'exact'; value: string }
  | { type: 'wildcard'; value: string }; // "value" incluye el punto inicial, ej: ".vercel.app"

// -----------------------------------------------------------------------------
// Parsea la cadena cruda de ALLOWED_ORIGINS y devuelve la lista tipada de reglas.
// -----------------------------------------------------------------------------
const parseOriginRules = (raw: string): OriginRule[] => {
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map<OriginRule>((entry) => {
      // Wildcard total: "*" permite cualquier origen (solo para dev).
      if (entry === '*') {
        return { type: 'all' };
      }

      // Wildcard de dominio: "*.vercel.app" permite cualquier subdominio.
      if (entry.startsWith('*.')) {
        // Guardamos ".vercel.app" para usar endsWith() de forma segura.
        return { type: 'wildcard', value: entry.slice(1) };
      }

      // Origen exacto: se compara de forma estricta.
      return { type: 'exact', value: entry };
    });
};

// -----------------------------------------------------------------------------
// Lee la configuración actual desde env y devuelve las reglas ya parseadas.
// Esta función se invoca EN CADA REQUEST (no al cargar el módulo) para:
//   1. Poder mockear env.ALLOWED_ORIGINS en los tests unitarios.
//   2. Garantizar que siempre se evalúan las reglas vigentes (en caso de
//      entornos donde las variables cambien en runtime).
// -----------------------------------------------------------------------------
const getOriginRules = (): OriginRule[] => {
  const rules = parseOriginRules(env.ALLOWED_ORIGINS ?? env.FRONTEND_URL);
  return rules;
};

// -----------------------------------------------------------------------------
// Comprueba si un origin cumple con alguna de las reglas declaradas.
// - "all"      -> siempre true.
// - "exact"    -> comparación estricta con la cadena completa.
// - "wildcard" -> valida que el hostname termine con ".value" (incluye el punto
//                 inicial para evitar matches como "malicious-vercel.app").
// -----------------------------------------------------------------------------
const isOriginAllowed = (origin: string, rules: OriginRule[]): boolean => {
  return rules.some((rule) => {
    if (rule.type === 'all') return true;

    if (rule.type === 'exact') {
      return origin === rule.value;
    }

    // rule.type === 'wildcard'
    try {
      const { hostname } = new URL(origin);
      // "https://sportmetric.vercel.app".hostname.endsWith(".vercel.app") -> true
      // "https://malicious-vercel.app".hostname.endsWith(".vercel.app")    -> false
      // "https://sportmetric.vercel.app.evil.com"...endsWith(".vercel.app")-> false
      return hostname.endsWith(rule.value);
    } catch {
      // Si el origin no es una URL válida, no lo permitimos por wildcard.
      return false;
    }
  });
};

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Permitimos herramientas sin origin (Swagger, health checks, Postman local).
    if (!origin) {
      return callback(null, true);
    }

    const rules = getOriginRules();

    if (isOriginAllowed(origin, rules)) {
      return callback(null, true);
    }

    console.log(`CORS RECHAZADO: El origen "${origin}" no cumple ninguna regla:`, rules);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
