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
//   - Wildcard con prefijo: "sportmetric-*.vercel.app"
//                            -> matchea subdominios que EMPIECEN por
//                               "sportmetric-" Y TERMINEN en ".vercel.app".
//   - Wildcard de dominio:  "*.vercel.app"
//                            -> matchea cualquier subdominio de vercel.app.
//                            ADVERTENCIA: en proveedores de hosting compartido
//                            (Vercel, Netlify) cualquier OTRO proyecto podra
//                            hacer fetch al backend. Usar solo en dev o
//                            combinar con el patron con prefijo en produccion.
//   - Wildcard total:       "*" -> permite CUALQUIER origen. Solo para dev.
// =============================================================================

import { CorsOptions } from 'cors';
import { env } from './env';

// -----------------------------------------------------------------------------
// Tipos de reglas que podemos declarar en ALLOWED_ORIGINS.
// -----------------------------------------------------------------------------
type OriginRule =
  | { type: 'all' }
  | { type: 'exact'; value: string }
  // Wildcard con prefijo + sufijo. El * se reemplaza por cualquier subdominio.
  // El sufijo DEBE empezar con "." para garantizar que el match sea de
  // subdominio completo (evita "evil-vercel.app" matchee "*.vercel.app"
  // por truncamiento o sufijos de otro TLD).
  | { type: 'wildcard'; prefix: string; suffix: string };

// -----------------------------------------------------------------------------
// Parsea una entrada individual a una regla tipada.
// -----------------------------------------------------------------------------
const parseEntry = (entry: string): OriginRule | null => {
  // Wildcard total: "*" permite cualquier origen (solo para dev).
  if (entry === '*') {
    return { type: 'all' };
  }

  // Si la entrada contiene un "*", lo tratamos como wildcard con prefijo+sufijo.
  if (entry.includes('*')) {
    // Solo permitimos un unico "*" en la entrada. Si hay mas, es ambiguo y
    // lo rechazamos para no dar una falsa sensacion de seguridad.
    if (entry.split('*').length > 2) {
      return null;
    }

    const [prefix, suffix] = entry.split('*', 2);

    // El sufijo debe empezar con "." para que el match sea un subdominio
    // legitimo. Por ejemplo, "sportmetric-*.vercel.app" produce sufijo
    // ".vercel.app". Si el usuario escribe "sportmetric-*vercel.app" sin
    // el punto, lo rechazamos para evitar matches como "x-vercel.app".
    if (!suffix.startsWith('.')) {
      return null;
    }

    return { type: 'wildcard', prefix, suffix };
  }

  // Origen exacto: se compara de forma estricta con la cadena completa.
  return { type: 'exact', value: entry };
};

// -----------------------------------------------------------------------------
// Parsea la cadena cruda de ALLOWED_ORIGINS y devuelve la lista tipada de reglas.
// Las entradas invalidas se descartan y se registran en consola para que el
// operador sepa que su configuracion tiene un problema.
// -----------------------------------------------------------------------------
const parseOriginRules = (raw: string): OriginRule[] => {
  const rules: OriginRule[] = [];

  for (const entry of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    const rule = parseEntry(entry);
    if (rule) {
      rules.push(rule);
    } else {
      console.warn(`[cors] Entrada invalida en ALLOWED_ORIGINS ignorada: "${entry}"`);
    }
  }

  return rules;
};

// -----------------------------------------------------------------------------
// Lee la configuracion actual desde env y devuelve las reglas ya parseadas.
// Esta funcion se invoca EN CADA REQUEST (no al cargar el modulo) para:
//   1. Poder mockear env.ALLOWED_ORIGINS en los tests unitarios.
//   2. Garantizar que siempre se evaluan las reglas vigentes (en caso de
//      entornos donde las variables cambien en runtime).
//
// Politica por entorno:
//   - development/test: si ALLOWED_ORIGINS no esta definido, se usa
//     FRONTEND_URL como fallback. Esto permite que el frontend local
//     funcione sin configurar nada adicional.
//   - production: si ALLOWED_ORIGINS NO esta definido, NO se permite
//     ningun origen cross-origin. Esto es la postura segura por defecto
//     cuando se usa el proxy reverso de Vercel (ver api/proxy.js), que
//     hace que el frontend siempre hable same-origin. Si el operador
//     quiere permitir cross-origin explicito en produccion, debe
//     configurar ALLOWED_ORIGINS de forma consciente.
// -----------------------------------------------------------------------------
const getOriginRules = (): OriginRule[] => {
  const raw = env.ALLOWED_ORIGINS;

  if (env.NODE_ENV === 'production' && !raw) {
    // Produccion sin ALLOWED_ORIGINS: bloquear todo cross-origin.
    return [];
  }

  return parseOriginRules(raw ?? env.FRONTEND_URL);
};

// -----------------------------------------------------------------------------
// Comprueba si un origin cumple con alguna de las reglas declaradas.
// - "all"      -> siempre true.
// - "exact"    -> comparacion estricta con la cadena completa.
// - "wildcard" -> el hostname debe EMPEZAR por prefix y TERMINAR por suffix
//                 (con punto al inicio para garantizar match de subdominio).
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
      return hostname.startsWith(rule.prefix) && hostname.endsWith(rule.suffix);
    } catch {
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
