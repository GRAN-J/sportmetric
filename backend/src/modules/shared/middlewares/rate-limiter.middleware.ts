// =============================================================================
// Middlewares de Rate Limiting para prevenir ataques de fuerza bruta
// =============================================================================
// El rate limiting limita el número de solicitudes que una IP puede hacer en un
// periodo de tiempo, para proteger la aplicación de abusos.
// =============================================================================

import rateLimit from 'express-rate-limit';

// =============================================================================
// 1. Rate Limiting general (para todas las rutas)
// =============================================================================
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,                   // Ventana de tiempo: 15 minutos
  max: 100,                                   // Máximo de 100 solicitudes por IP en la ventana
  message: 'Demasiadas solicitudes desde esta IP, por favor inténtalo de nuevo más tarde.',
  standardHeaders: true,                      // Devuelve info del rate limit en los encabezados RateLimit-*
  legacyHeaders: false,                       // Desactiva los encabezados X-RateLimit-*
});

// =============================================================================
// 2. Rate Limiting más estricto para endpoints de autenticación
// =============================================================================
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,                   // Ventana de tiempo: 15 minutos
  max: 5,                                     // Máximo de 5 intentos por IP (para login/registro)
  message: 'Demasiados intentos desde esta IP, por favor inténtalo de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});