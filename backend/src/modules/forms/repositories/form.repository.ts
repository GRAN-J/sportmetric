// =============================================================================
// Repositorio de Esquemas de Formulario
// =============================================================================
// Maneja la persistencia de la estructura dinámica de los formularios.
// =============================================================================

import prisma from '../../../config/database';

export interface CreateFormSchemaDTO {
  protocolId: string;
  fields: any; // Estructura JSON de los campos
}

/**
 * Obtiene el esquema de formulario para un protocolo específico
 */
export async function findByProtocolId(protocolId: string) {
  return prisma.formSchema.findUnique({
    where: { protocolId },
  });
}

/**
 * Crea o actualiza un esquema de formulario
 */
export async function upsert(data: CreateFormSchemaDTO) {
  return prisma.formSchema.upsert({
    where: { protocolId: data.protocolId },
    update: { fields: data.fields },
    create: {
      protocolId: data.protocolId,
      fields: data.fields,
    },
  });
}
