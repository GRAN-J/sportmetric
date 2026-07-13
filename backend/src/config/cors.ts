// =============================================================================
// Configuración de CORS (Cross-Origin Resource Sharing)
// =============================================================================
// CORS permite que el frontend (en un dominio diferente) se comunique con el backend.
// - origin: URL del frontend permitida
// - credentials: Permite enviar cookies y encabezados de autenticación
// - methods: Métodos HTTP permitidos
// - allowedHeaders: Encabezados permitidos en las peticiones
// =============================================================================

import { CorsOptions } from 'cors';
import { env } from './env';

// Construimos la lista final de orígenes permitidos a partir de ALLOWED_ORIGINS
// o, si no existe, usamos FRONTEND_URL como valor por defecto.
const allowedOrigins = (env.ALLOWED_ORIGINS ?? env.FRONTEND_URL)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Permitimos herramientas sin origin (Swagger, health checks, Postman local).
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,                                      // Permite credenciales (cookies, tokens)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],      // Encabezados permitidos
};
