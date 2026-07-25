// =============================================================================
// Repositorio de Evaluaciones
// =============================================================================
// Maneja el registro y consulta de las mediciones realizadas.
//
// Importante: la captura es PÚBLICA. Los nombres del evaluado/evaluador y el
// id del estudiante se guardan dentro de `results` (JSONB) en los campos
// `id_estudiante`, `evaluado` y `evaluador` de la Ficha Técnica base.
// Por eso no hay joins contra la tabla User.
// =============================================================================

import prisma from '../../../config/database';

export interface CreateEvaluationDTO {
  protocolId: string;
  results: any; // Datos en formato JSON (incluye id_estudiante, evaluado, evaluador, ...custom)
  notes?: string | null;
  date?: Date;
}

const FULL_INCLUDE = {
  protocol: { select: { id: true, title: true, categoryId: true } },
};

/**
 * Registra una nueva evaluación.
 * No se envian FKs a User: la captura es publica y los identificadores viven
 * en `results` (Ficha Tecnica base).
 */
export async function create(data: CreateEvaluationDTO) {
  return prisma.evaluation.create({
    data: {
      protocolId: data.protocolId,
      results: data.results,
      notes: data.notes ?? null,
      date: data.date || new Date(),
    },
    include: FULL_INCLUDE,
  });
}

/**
 * Lista todas las evaluaciones con filtros opcionales.
 * El `search` ahora busca dentro del JSONB `results` porque no hay FKs a User.
 */
export async function findAll(filters: { protocolId?: string; search?: string } = {}) {
  const where: any = {};

  if (filters.protocolId) {
    where.protocolId = filters.protocolId;
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    // Busqueda dentro del JSONB de resultados.
    // `path` apunta a la clave de la Ficha Tecnica base; el mode 'insensitive'
    // requiere que la instalacion de Postgres tenga la extension `citext` o
    // que el collation sea case-insensitive. En este proyecto usamos ILIKE.
    where.OR = [
      { notes: { contains: q, mode: 'insensitive' } },
      { results: { path: ['id_estudiante'], string_contains: q } },
      { results: { path: ['evaluado'], string_contains: q } },
      { results: { path: ['evaluador'], string_contains: q } },
      { protocol: { title: { contains: q, mode: 'insensitive' } } },
    ];
  }

  return prisma.evaluation.findMany({
    where,
    orderBy: { date: 'desc' },
    include: FULL_INCLUDE,
  });
}

/**
 * Obtiene el historial de evaluaciones de un estudiante identificado
 * por su `id_estudiante` dentro del JSONB de resultados.
 */
export async function findByStudent(studentIdCode: string) {
  return prisma.evaluation.findMany({
    where: {
      results: { path: ['id_estudiante'], equals: studentIdCode },
    },
    orderBy: { date: 'desc' },
    include: {
      protocol: { select: { id: true, title: true } },
    },
  });
}

/**
 * Obtiene el detalle de una evaluación específica.
 */
export async function findById(id: string) {
  return prisma.evaluation.findUnique({
    where: { id },
    include: {
      protocol: true,
    },
  });
}

/**
 * Actualiza los datos editables de una evaluación.
 */
export async function update(id: string, data: { results?: any; notes?: string | null; date?: Date }) {
  return prisma.evaluation.update({
    where: { id },
    data: {
      results: data.results,
      notes: data.notes,
      date: data.date,
    },
    include: FULL_INCLUDE,
  });
}

/**
 * Elimina una evaluación.
 */
export async function remove(id: string) {
  return prisma.evaluation.delete({ where: { id } });
}
