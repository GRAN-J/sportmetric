// =============================================================================
// Controlador de Usuarios
// =============================================================================

import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import * as userService from '../services/user.service';

/**
 * GET /api/users
 * Obtiene todos los usuarios (Admin)
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(new ApiResponse(users, 'Usuarios obtenidos correctamente'));
});

/**
 * GET /api/users/:id
 * Obtiene un usuario por ID
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id as string);
  res.json(new ApiResponse(user, 'Usuario obtenido correctamente'));
});

/**
 * POST /api/users
 * Crea un usuario (Admin)
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(new ApiResponse(user, 'Usuario creado correctamente'));
});

/**
 * PATCH /api/users/:id
 * Actualiza un usuario
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.updateUser(id as string, req.body);
  res.json(new ApiResponse(user, 'Usuario actualizado correctamente'));
});

/**
 * DELETE /api/users/:id
 * Elimina un usuario
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUser(id as string);
  res.json(new ApiResponse(null, 'Usuario eliminado correctamente'));
});
