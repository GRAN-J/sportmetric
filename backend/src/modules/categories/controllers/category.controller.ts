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
