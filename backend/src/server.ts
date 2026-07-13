// =============================================================================
// Punto de entrada principal del servidor backend
// =============================================================================
// Este archivo se encarga de:
// 1. Conectar a la base de datos usando Prisma
// 2. Iniciar el servidor Express
// 3. Manejar señales de terminación para cerrar la aplicación con gracia
// =============================================================================

import app from './app';
import { env } from './config/env';
import logger from './modules/shared/utils/logger';
import prisma from './config/database';

/**
 * Función principal para iniciar el servidor
 */
const startServer = async () => {
  try {
    // 1. Intentamos conectar a la base de datos
    try {
      await prisma.$connect();
      logger.info('Conexión a la base de datos establecida.');
    } catch (dbError) {
      if (env.NODE_ENV === 'development') {
        logger.warn('No se pudo conectar a la base de datos. El servidor seguirá corriendo sin BD (solo para desarrollo).');
      } else {
        throw dbError;
      }
    }

    // 2. Iniciamos el servidor Express
    const server = app.listen(env.PORT, () => {
      logger.info(`Servidor corriendo en http://localhost:${env.PORT}`);
      logger.info(`Entorno: ${env.NODE_ENV}`);
      logger.info(`Ruta de salud: http://localhost:${env.PORT}/api/health`);
      logger.info(`Documentación API (solo desarrollo): http://localhost:${env.PORT}/api/docs`);
    });

    // ===========================================================================
    // 3. Manejamos señales de terminación para cerrar la app con gracia
    // ===========================================================================
    const shutdown = async (signal: string) => {
      logger.info(`Recibida señal de terminación: ${signal}`);
      logger.info('Cerrando el servidor...');

      // Cerramos el servidor HTTP
      server.close(() => {
        logger.info('Servidor HTTP cerrado.');
      });

      // Intentamos desconectar de la base de datos, si está conectada
      try {
        await prisma.$disconnect();
        logger.info('Conexión a la base de datos cerrada.');
      } catch (e) {
        // No hacemos nada si no estábamos conectados
      }
      
      process.exit(0);
    };

    // Escuchamos las señales de terminación
    process.on('SIGTERM', () => shutdown('SIGTERM')); // Usado por Docker, Kubernetes
    process.on('SIGINT', () => shutdown('SIGINT'));   // Cuando presionas Ctrl+C en la terminal
  } catch (error) {
    // Si hay un error al iniciar, lo logueamos y salimos
    logger.error({ error }, 'Error al iniciar el servidor.');
    try {
      await prisma.$disconnect();
    } catch (e) {
      // No hacemos nada
    }
    process.exit(1);
  }
};

// Iniciamos el servidor!
startServer();
