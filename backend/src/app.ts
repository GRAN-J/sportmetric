// =============================================================================
// Configuración principal de la aplicación Express
// =============================================================================
// Este archivo configura Express con todos los middlewares globales, rutas y
// el manejo de errores.
// =============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

// Importamos las configuraciones
import { corsConfig } from './config/cors';
import { helmetConfig } from './config/helmet';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';

// Importamos middlewares y filtros
import logger from './modules/shared/utils/logger';
import { generalLimiter } from './modules/shared/middlewares/rate-limiter.middleware';
import { errorHandler } from './modules/shared/filters/error.filter';
import categoryRoutes from './modules/categories/category.routes';
import protocolRoutes from './modules/protocols/protocol.routes';

// Creamos la instancia de la aplicación Express
const app = express();

// Se configura por entorno para evitar confiar en proxies inexistentes.
app.set('trust proxy', env.TRUST_PROXY_HOPS);

// =============================================================================
// 1. Aplicamos middlewares globales
// =============================================================================
app.use(pinoHttp({ logger }));                                      // Logging de todas las solicitudes HTTP
app.use(helmet(helmetConfig));                                      // Seguridad de encabezados HTTP (Helmet)
app.use(cors(corsConfig));                                          // Configuración de CORS
app.use(express.json({ limit: '10mb' }));                           // Parsear cuerpos JSON (max 10 MB)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));     // Parsear cuerpos URL-encoded
app.use(cookieParser());                                            // Parsear cookies en las solicitudes
app.use(generalLimiter);                                            // Rate limiting (evitar abusos)

// =============================================================================
// 2. Ruta de salud (health check)
// =============================================================================
// Ruta para verificar que la API está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API SportMetric Academic está funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// 3. Rutas principales del dominio
// =============================================================================
app.use('/api/categories', categoryRoutes);
app.use('/api/protocols', protocolRoutes);

// =============================================================================
// 4. Swagger UI (solo en entorno de desarrollo)
// =============================================================================
if (env.NODE_ENV === 'development') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger UI disponible en http://localhost:3001/api/docs');
}

// =============================================================================
// 5. Middleware global de manejo de errores (debe ser el último middleware!)
// =============================================================================
app.use(errorHandler);

export default app;
