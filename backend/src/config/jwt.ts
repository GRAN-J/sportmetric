// =============================================================================
// Configuración de JSON Web Tokens (JWT) para autenticación
// =============================================================================
// Este archivo define la configuración para los tokens de acceso y refresh:
// - Access Token: Tiene vida corta (15m) y se usa para autenticar peticiones
// - Refresh Token: Tiene vida más larga (7d) y se usa para obtener nuevos access tokens
// =============================================================================

import { env } from './env';

// Objeto con la configuración para ambos tipos de tokens
export const jwtConfig = {
  // Configuración para el Access Token (token de acceso)
  access: {
    secret: env.JWT_SECRET,               // Secreto para firmar el access token
    expiresIn: env.JWT_ACCESS_EXPIRES_IN, // Tiempo de expiración (ej: 15m)
  },
  // Configuración para el Refresh Token (token de actualización)
  refresh: {
    secret: env.JWT_REFRESH_SECRET,               // Secreto para firmar el refresh token
    expiresIn: env.JWT_REFRESH_EXPIRES_IN, // Tiempo de expiración (ej: 7d)
  },
};