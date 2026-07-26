// =============================================================================
// Seed de la base de datos: Carga datos iniciales en la BD
// =============================================================================
// Este script se ejecuta con el comando `npx prisma db seed` y se encarga de:
// 1. Limpiar la base de datos (solo para desarrollo)
// 2. Cargar las categorías desde el archivo categories.json del frontend
// 3. Cargar todos los protocolos desde los archivos JSON en /frontend/src/data/protocols
// =============================================================================

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import * as argon2 from 'argon2';

// Creamos la conexión a PostgreSQL y el adaptador para Prisma
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Creamos la instancia del cliente de Prisma
const prisma = new PrismaClient({ adapter });

// Ruta al archivo de categorías (compartido con el frontend)
const categoriesPath = path.join(__dirname, '../../frontend/src/data/categories.json');
const categoriesData = fs.readFileSync(categoriesPath, 'utf8');
const categories = JSON.parse(categoriesData);

// Directorio donde se guardan los protocolos en el frontend
const protocolsDir = path.join(__dirname, '../../frontend/src/data/protocols');

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // ===========================================================================
  // 1. Limpiamos la base de datos (borramos todos los registros, en orden para evitar conflictos de FK)
  // ===========================================================================
  await prisma.material.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.step.deleteMany();
  await prisma.interruptionCriterion.deleteMany();
  await prisma.dataRegistry.deleteMany();
  await prisma.protocol.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Base de datos limpiada.');

  // ===========================================================================
  // 1.1. Creamos el usuario administrador inicial
  // ===========================================================================
  console.log('Cargando usuario administrador...');
  const adminPasswordHash = await argon2.hash('admin1234');
  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@sportmetric.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });
  console.log('Usuario administrador creado: admin@sportmetric.com / admin1234');

  // ===========================================================================
  // 2. Cargamos las categorías en la BD
  // ===========================================================================
  console.log('Cargando categorías...');
  for (const cat of categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        title: cat.title,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order: cat.order
      }
    });
  }
  console.log(`Cargadas ${categories.length} categorías.`);

  // ===========================================================================
  // 3. Cargamos todos los protocolos desde los archivos JSON
  // ===========================================================================
  console.log('Cargando protocolos...');
  
  // Obtenemos todos los archivos JSON de protocolos
  const protocolFiles = fs.readdirSync(protocolsDir).filter(file => file.endsWith('.json'));
  let protocolsCount = 0;

  for (const file of protocolFiles) {
    const filePath = path.join(protocolsDir, file);
    const protocolDataRaw = fs.readFileSync(filePath, 'utf8');
    const protocolData = JSON.parse(protocolDataRaw);

    // Creamos el protocolo principal
    const protocol = await prisma.protocol.create({
      data: {
        id: protocolData.id,
        categoryId: protocolData.category,
        order: protocolData.order,
        title: protocolData.title,
        objective: protocolData.objective,
        description: protocolData.description
      }
    });

    // -------------------------------------------------------------------------
    // 3.1. Creamos los materiales del protocolo
    // -------------------------------------------------------------------------
    if (protocolData.materials && protocolData.materials.length > 0) {
      for (let i = 0; i < protocolData.materials.length; i++) {
        const mat = protocolData.materials[i];
        await prisma.material.create({
          data: {
            protocolId: protocol.id,
            name: mat.name,
            imageUrl: mat.image,
            // Si el JSON no tiene el campo order, usamos el índice + 1
            order: mat.order ?? (i + 1)
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // 3.2. Creamos los items del checklist
    // -------------------------------------------------------------------------
    if (protocolData.checklist && protocolData.checklist.length > 0) {
      for (let i = 0; i < protocolData.checklist.length; i++) {
        const itemRaw = protocolData.checklist[i];
        // Manejamos el caso donde el checklist es un array de strings o de objetos
        const item = typeof itemRaw === 'string' ? { text: itemRaw } : itemRaw;
        await prisma.checklistItem.create({
          data: {
            protocolId: protocol.id,
            text: item.text,
            order: item.order ?? (i + 1)
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // 3.3. Creamos los pasos del protocolo
    // -------------------------------------------------------------------------
    if (protocolData.steps && protocolData.steps.length > 0) {
      for (let i = 0; i < protocolData.steps.length; i++) {
        const step = protocolData.steps[i];
        await prisma.step.create({
          data: {
            protocolId: protocol.id,
            stepNumber: step.step,
            title: step.title,
            description: step.description,
            videoUrl: step.video,
            order: step.order ?? (i + 1)
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // 3.4. Creamos los criterios de interrupción
    // -------------------------------------------------------------------------
    if (protocolData.interruptionCriteria && protocolData.interruptionCriteria.length > 0) {
      for (let i = 0; i < protocolData.interruptionCriteria.length; i++) {
        const critRaw = protocolData.interruptionCriteria[i];
        const crit = typeof critRaw === 'string' ? { text: critRaw } : critRaw;
        await prisma.interruptionCriterion.create({
          data: {
            protocolId: protocol.id,
            text: crit.text,
            order: crit.order ?? (i + 1)
          }
        });
      }
    }

    // -------------------------------------------------------------------------
    // 3.5. Creamos el registro de datos (si existe y tiene title)
    // -------------------------------------------------------------------------
    if (protocolData.dataRegistry && protocolData.dataRegistry.title) {
      await prisma.dataRegistry.create({
        data: {
          protocolId: protocol.id,
          title: protocolData.dataRegistry.title,
          description: protocolData.dataRegistry.description,
          unit: protocolData.dataRegistry.unit
        }
      });
    }

    protocolsCount++;
  }

  // ===========================================================================
  // 4. Cargamos esquemas de formulario iniciales (Fase 2)
  // ===========================================================================
  console.log('Cargando esquemas de formulario...');

  const formSchemas = [
    {
      protocolId: 'medicion-del-peso',
      fields: [
        { name: 'peso', label: 'Peso (kg)', type: 'number', required: true, unit: 'kg' }
      ]
    },
    {
      protocolId: 'medicion-de-la-talla',
      fields: [
        { name: 'talla', label: 'Talla (cm)', type: 'number', required: true, unit: 'cm' }
      ]
    },
    {
      protocolId: 'medicion-del-perimetro-de-cintura',
      fields: [
        { name: 'medicion1', label: 'Medición 1 (cm)', type: 'number', required: true, unit: 'cm' },
        { name: 'medicion2', label: 'Medición 2 (cm)', type: 'number', required: true, unit: 'cm' }
      ]
    }
  ];

  for (const schema of formSchemas) {
    await prisma.formSchema.upsert({
      where: { protocolId: schema.protocolId },
      update: { fields: schema.fields },
      create: {
        protocolId: schema.protocolId,
        fields: schema.fields
      }
    });
  }

  console.log(`Cargados ${formSchemas.length} esquemas de formulario.`);
  console.log(`Cargados ${protocolsCount} protocolos.`);
  console.log('Seed completado exitosamente!');
}

// Ejecutamos el script de seed
main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerramos la conexión a la BD, haya ocurrido un error o no
    await prisma.$disconnect();
  });
