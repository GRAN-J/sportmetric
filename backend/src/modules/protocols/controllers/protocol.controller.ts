// =============================================================================
// Controlador de Protocolos
// =============================================================================
// Maneja las peticiones HTTP relacionadas con protocolos y delega la lógica
// al servicio correspondiente.
// =============================================================================

import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ApiError } from '../../shared/utils/ApiError';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import * as protocolService from '../services/protocol.service';

/**
 * GET /api/protocols
 * Obtiene todos los protocolos del sistema.
 */
export const getProtocols = asyncHandler(async (_req: Request, res: Response) => {
  const protocols = await protocolService.getProtocols();
  res.json(new ApiResponse(protocols, 'Protocolos obtenidos correctamente'));
});

/**
 * GET /api/categories/:id/protocols
 * Obtiene los protocolos de una categoría específica.
 */
export const getProtocolsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryId = String(req.params.id);
  const protocols = await protocolService.getProtocolsByCategory(categoryId);
  res.json(new ApiResponse(protocols, 'Protocolos de la categoría obtenidos correctamente'));
});

/**
 * GET /api/protocols/:id
 * Obtiene el detalle completo de un protocolo.
 */
export const getProtocol = asyncHandler(async (req: Request, res: Response) => {
  const protocolId = String(req.params.id);
  const protocol = await protocolService.getProtocol(protocolId);

  if (!protocol) {
    throw new ApiError('Protocolo no encontrado', 404, 'PROTOCOL_NOT_FOUND');
  }

  res.json(new ApiResponse(protocol, 'Protocolo obtenido correctamente'));
});
