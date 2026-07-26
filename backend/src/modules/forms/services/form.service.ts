// =============================================================================
// Servicio de Esquemas de Formulario
// =============================================================================
// El esquema que se devuelve SIEMPRE incluye:
//   1) Los campos base de la Ficha Técnica (Nombre del evaluado y Nombre del
//      evaluador). Estos son obligatorios en CUALQUIER evaluación.
//   2) Los campos personalizados definidos por el administrador (si los hay).
// Esto garantiza que TODA evaluación tenga la información mínima requerida
// sin importar si el admin personalizó o no el protocolo.
// =============================================================================

import * as formRepository from '../repositories/form.repository';
import { GENERIC_FIELDS } from '../utils/generic-schema';

/**
 * Obtiene el esquema para un protocolo.
 * - SIEMPRE incluye los campos base de la Ficha Técnica al inicio.
 * - Concatena los campos personalizados del admin al final (si existen).
 */
export async function getSchemaByProtocol(protocolId: string) {
  const schema = await formRepository.findByProtocolId(protocolId);
  const customFields = Array.isArray(schema?.fields) ? schema.fields : [];

  // Filtra los campos personalizados vacíos para no ensuciar la respuesta.
  // Se castea a `any[]` porque Prisma tipa `JsonArray` y no permite acceder
  // directamente a las propiedades del objeto.
  const cleanCustomFields = (customFields as any[]).filter(
    (f) => f && f.name && String(f.name).trim() && f.label && String(f.label).trim()
  );

  // Si NO hay campos personalizados, el esquema es el genérico (igual a la base)
  if (cleanCustomFields.length === 0) {
    return {
      isGeneric: true,
      fields: GENERIC_FIELDS,
      protocolId,
    };
  }

  // Si hay campos personalizados, se concatenan al final de la Ficha Técnica
  return {
    isGeneric: false,
    fields: [...GENERIC_FIELDS, ...cleanCustomFields],
    protocolId,
  };
}

/**
 * Define o actualiza el esquema para un protocolo (Admin)
 */
export async function saveSchema(protocolId: string, fields: any) {
  return formRepository.upsert({ protocolId, fields });
}
