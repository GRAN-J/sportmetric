// =============================================================================
// Controlador de Categorías
// =============================================================================
// Maneja las peticiones HTTP y devuelve las respuestas usando el servicio
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { ApiError } from '../../shared/utils/ApiError';
import * as categoryService from '../services/category.service';

/**
 * GET /api/categories
 * Obtiene todas las categorías
 */
export const getCategories = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const categories = await categoryService.getCategories();

  res.json(new ApiResponse(categories, 'Categorías obtenidas correctamente'));
});

/**
 * GET /api/categories/:id
 * Obtiene una categoría por ID
 */
export const getCategory = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const categoryId = String(req.params.id);
  const category = await categoryService.getCategory(categoryId);

  if (!category) {
    throw new ApiError('Categoría no encontrada', 404, 'CATEGORY_NOT_FOUND');
  }

  res.json(new ApiResponse(category, 'Categoría obtenida correctamente'));
});

/**
 * POST /api/categories
 * Crea una categoría (Admin)
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json(new ApiResponse(category, 'Categoría creada correctamente'));
});

/**
 * PATCH /api/categories/:id
 * Actualiza una categoría (Admin)
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await categoryService.updateCategory(id as string, req.body);
  res.json(new ApiResponse(category, 'Categoría actualizada correctamente'));
});

/**
 * DELETE /api/categories/:id
 * Elimina una categoría (Admin)
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id as string);
  res.json(new ApiResponse(null, 'Categoría eliminada correctamente'));
});
