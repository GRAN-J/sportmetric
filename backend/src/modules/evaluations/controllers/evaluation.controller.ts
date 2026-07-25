// =============================================================================
// Controlador de Evaluaciones
// =============================================================================
// La ruta POST es PÚBLICA (la captura la hace cualquier visitante del sitio
// que haya completado la Ficha Técnica). El resto (GET/PATCH/DELETE) sigue
// protegido para uso administrativo.
// =============================================================================

import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import * as evaluationService from '../services/evaluation.service';

/**
 * POST /api/evaluations
 * Registra una nueva medición (captura pública).
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const evaluation = await evaluationService.registerEvaluation({
    protocolId: req.body.protocolId,
    results: req.body.results,
    notes: req.body.notes ?? null,
    date: req.body.date ? new Date(req.body.date) : undefined,
  });
  res.status(201).json(new ApiResponse(evaluation, 'Evaluación registrada correctamente'));
});

/**
 * GET /api/evaluations
 * Lista todas las evaluaciones con filtros opcionales (protocolId, search).
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { protocolId, search } = req.query;
  const evaluations = await evaluationService.getAllEvaluations({
    protocolId: protocolId ? String(protocolId) : undefined,
    search: search ? String(search) : undefined,
  });
  res.json(new ApiResponse(evaluations, 'Evaluaciones obtenidas correctamente'));
});

/**
 * GET /api/evaluations/student/:studentId
 * Obtiene el historial de un estudiante a partir de su `id_estudiante`.
 */
export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const history = await evaluationService.getStudentHistory(studentId as string);
  res.json(new ApiResponse(history, 'Historial obtenido correctamente'));
});

/**
 * GET /api/evaluations/:id
 * Obtiene detalle de una evaluación.
 */
export const getDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const detail = await evaluationService.getEvaluationDetail(id as string);
  res.json(new ApiResponse(detail, 'Detalle obtenido correctamente'));
});

/**
 * PATCH /api/evaluations/:id
 * Actualiza una evaluación.
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await evaluationService.updateEvaluation(id as string, req.body);
  res.json(new ApiResponse(updated, 'Evaluación actualizada correctamente'));
});

/**
 * DELETE /api/evaluations/:id
 * Elimina una evaluación.
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await evaluationService.deleteEvaluation(id as string);
  res.json(new ApiResponse(null, 'Evaluación eliminada correctamente'));
});
