// =============================================================================
// Configuración de Swagger/OpenAPI para documentar la API
// =============================================================================
// Swagger genera una documentación interactiva de la API, accesible en /api/docs
// (solo en entorno de desarrollo).
// - openapi: Versión de la especificación OpenAPI
// - info: Información general de la API
// - servers: URLs de los servidores (desarrollo y producción)
// - components: Definiciones de seguridad (autenticación JWT)
// - apis: Rutas a los archivos TypeScript con comentarios JSDoc para generar la doc
// =============================================================================

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerOptions = {
  definition: {
    openapi: '3.1.0', // Versión de la especificación OpenAPI
    info: {
      title: 'SportMetric Academic API', // Nombre de la API
      version: '1.0.0',                  // Versión de la API
      description: 'API REST para la aplicación SportMetric Academic', // Descripción
    },
    servers: [
      {
        // URL del servidor según el entorno
        url: env.NODE_ENV === 'development'
          ? `http://localhost:${env.PORT}`
          : env.BACKEND_PUBLIC_URL,
        description: env.NODE_ENV === 'development'
          ? 'Servidor de desarrollo'
          : 'Servidor de producción',
      },
    ],
    components: {
      // Esquema de seguridad para autenticación JWT
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token de acceso JWT (obtenido en el login)',
        },
      },
    },
  },
  // Rutas a los archivos TypeScript que contienen comentarios JSDoc para la documentación
  apis: ['src/modules/**/*.ts'],
};

// Generamos la especificación OpenAPI usando swagger-jsdoc
export const swaggerSpec = swaggerJsdoc(swaggerOptions);
