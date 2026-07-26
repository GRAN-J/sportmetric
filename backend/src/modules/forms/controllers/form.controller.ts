// =============================================================================
// Controlador de Esquemas de Formulario
// =============================================================================

import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import * as formService from '../services/form.service';

/**
 * GET /api/forms/:protocolId
 * Obtiene el esquema de campos para un protocolo
 */
export const getSchema = asyncHandler(async (req: Request, res: Response) => {
  const { protocolId } = req.params;
  const schema = await formService.getSchemaByProtocol(protocolId as string);
  // Evita que el navegador cachee esta respuesta; el esquema puede cambiar
  // dinámicamente cuando el admin edita los campos personalizados.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(new ApiResponse(schema, 'Esquema obtenido correctamente'));
});

/**
 * POST /api/forms/:protocolId
 * Define el esquema de campos (Admin)
 */
export const saveSchema = asyncHandler(async (req: Request, res: Response) => {
  const { protocolId } = req.params;
  const { fields } = req.body;
  const schema = await formService.saveSchema(protocolId as string, fields);
  res.json(new ApiResponse(schema, 'Esquema guardado correctamente'));
});
