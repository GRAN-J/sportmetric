// =============================================================================
// Configuración del logger estructurado usando Pino
// =============================================================================
// Pino es un logger rápido y ligero para Node.js.
// - En desarrollo: Usa pino-pretty para mostrar logs legibles en consola, con colores
// - En producción: Logs en formato JSON (para servicios de logging como Datadog/New Relic)
// =============================================================================

import pino from 'pino';
import { env } from '../../../config/env';

const logger = pino({
  // Nivel de logging:
  // - debug: En desarrollo (mostramos todos los logs)
  // - info: En producción (solo logs importantes)
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',

  // Evita que credenciales o cookies terminen expuestas en logs.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  
  // Transporte (solo en desarrollo): pino-pretty para logs legibles
  transport: env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,                    // Muestra colores en la consola
      translateTime: 'yyyy-mm-dd HH:MM:ss', // Formatea la fecha y hora
      ignore: 'pid,hostname',           // No muestra el pid y hostname en los logs
    },
  } : undefined, // En producción, no usamos transporte (logs en JSON)
});

export default logger;
