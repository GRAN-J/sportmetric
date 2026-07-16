// =============================================================================
// Configuración y validación de las variables de entorno
// =============================================================================
// Este archivo valida las variables de entorno usando Zod para asegurar que
// todas las necesarias estén presentes y tengan el formato correcto.
// Si la validación falla, la aplicación no inicia (para evitar errores en runtime).
// =============================================================================

import 'dotenv/config';
import { z } from 'zod';

// =============================================================================
// 1. Definimos el esquema de validación con Zod
// =============================================================================
// Esquema que define qué variables de entorno necesitamos y sus formatos:
const envSchema = z.object({
  // Entorno de ejecución
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Puerto donde se ejecutará el servidor
  PORT: z.coerce.number().default(3001),
  
  // URL de conexión a la base de datos PostgreSQL
  DATABASE_URL: z.string().url(),
  
  // Secrets para firmar los tokens JWT (deben ser seguras y de al menos 32 caracteres)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres'),
  
  // Tiempo de expiración de los tokens
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'), // 15 minutos para el access token
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'), // 7 días para el refresh token
  
  // URL pública del backend (útil para Swagger y despliegue)
  BACKEND_PUBLIC_URL: z.string().url().default('http://localhost:3001'),

  // URL principal del frontend (compatibilidad con configuración previa)
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Lista de orígenes permitidos para CORS separados por coma
  ALLOWED_ORIGINS: z.string().optional(),

  // Cantidad de proxies de confianza delante de Express.
  // 0 = no confiar en X-Forwarded-* (local / topología simple).
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
});

// =============================================================================
// 2. Validamos las variables de entorno
// =============================================================================
const parsedEnv = envSchema.safeParse(process.env);

// =============================================================================
// 3. Si la validación falla, mostramos un error claro y salimos de la aplicación
// =============================================================================
if (!parsedEnv.success) {
  console.error('Error de validación de variables de entorno:');
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

// =============================================================================
// 4. Exportamos las variables de entorno validadas y tipadas
// =============================================================================
export const env = parsedEnv.data;
