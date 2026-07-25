// =============================================================================
// Servicio de Evaluaciones
// =============================================================================
// La captura es PÚBLICA: el visitante llena la Ficha Técnica base y la
// evaluación se persiste en PostgreSQL. Los identificadores del evaluado y
// del evaluador viven en `results.{id_estudiante, evaluado, evaluador}`.
// =============================================================================

import * as evaluationRepository from '../repositories/evaluation.repository';
import { ApiError } from '../../shared/utils/ApiError';
import prisma from '../../../config/database';

/**
 * Registra una evaluación. Valida que el protocolo exista.
 */
export async function registerEvaluation(data: {
  protocolId: string;
  results: any;
  notes?: string | null;
  date?: Date;
}) {
  // Valida que el protocolo exista.
  const protocol = await prisma.protocol.findUnique({ where: { id: data.protocolId } });
  if (!protocol) {
    throw new ApiError('El protocolo especificado no existe', 404, 'PROTOCOL_NOT_FOUND');
  }

  return evaluationRepository.create(data);
}

/**
 * Lista todas las evaluaciones con filtros opcionales.
 */
export async function getAllEvaluations(filters: { protocolId?: string; search?: string } = {}) {
  return evaluationRepository.findAll(filters);
}

/**
 * Obtiene el historial de un estudiante a partir de su `id_estudiante`
 * guardado en la Ficha Técnica base.
 */
export async function getStudentHistory(studentIdCode: string) {
  return evaluationRepository.findByStudent(studentIdCode);
}

/**
 * Obtiene detalle de una evaluación.
 */
export async function getEvaluationDetail(id: string) {
  const evaluation = await evaluationRepository.findById(id);
  if (!evaluation) {
    throw new ApiError('Evaluación no encontrada', 404, 'EVALUATION_NOT_FOUND');
  }
  return evaluation;
}

/**
 * Actualiza una evaluación existente.
 */
export async function updateEvaluation(id: string, data: { results?: any; notes?: string | null; date?: Date }) {
  const existing = await evaluationRepository.findById(id);
  if (!existing) {
    throw new ApiError('Evaluación no encontrada', 404, 'EVALUATION_NOT_FOUND');
  }
  return evaluationRepository.update(id, data);
}

/**
 * Elimina una evaluación.
 */
export async function deleteEvaluation(id: string) {
  const existing = await evaluationRepository.findById(id);
  if (!existing) {
    throw new ApiError('Evaluación no encontrada', 404, 'EVALUATION_NOT_FOUND');
  }
  return evaluationRepository.remove(id);
}
