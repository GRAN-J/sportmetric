// =============================================================================
// Controlador de Analítica
// =============================================================================

import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import * as analyticsService from '../services/analytics.service';

/**
 * GET /api/analytics/summary
 * Obtiene el resumen de estadísticas
 */
export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const stats = await analyticsService.getGeneralStats();
  res.json(new ApiResponse(stats, 'Resumen obtenido correctamente'));
});

/**
 * GET /api/analytics/activity
 * Obtiene la actividad mensual
 */
export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await analyticsService.getEvaluationsByMonth();
  res.json(new ApiResponse(activity, 'Actividad mensual obtenida correctamente'));
});

/**
 * GET /api/analytics/top-protocols
 * Obtiene los protocolos más usados
 */
export const getTopProtocols = asyncHandler(async (req: Request, res: Response) => {
  const top = await analyticsService.getTopProtocols();
  res.json(new ApiResponse(top, 'Top protocolos obtenido correctamente'));
});
