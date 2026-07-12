// =============================================================================
// Configuración de la conexión a la base de datos con Prisma
// =============================================================================
// Este archivo exporta una instancia única del cliente de Prisma (Singleton),
// para evitar crear múltiples conexiones a la base de datos.
// =============================================================================

import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from './env';

// Creamos la conexión a PostgreSQL y el adaptador para Prisma
const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Creamos la instancia del cliente de Prisma
// - log: En entorno de desarrollo, mostramos logs de consultas, info, advertencias y errores
const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

export default prisma;