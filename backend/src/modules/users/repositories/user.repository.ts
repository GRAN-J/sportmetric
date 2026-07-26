// =============================================================================
// Repositorio de Usuarios
// =============================================================================
// Maneja las operaciones directas con la base de datos para el modelo User.
// =============================================================================

import prisma from '../../../config/database';
import { Role } from '../../../generated/prisma';

export interface CreateUserDTO {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: Role;
  refreshTokenHash?: string | null;
  passwordResetTokenHash?: string | null;
  passwordResetExpires?: Date | null;
}

/**
 * Busca un usuario por su email
 */
export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Obtiene todos los usuarios
 */
export async function findAll() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Elimina un usuario
 */
export async function remove(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

/**
 * Busca un usuario por su ID
 */
export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Crea un nuevo usuario
 */
export async function create(data: CreateUserDTO) {
  return prisma.user.create({
    data,
  });
}

/**
 * Actualiza la información de un usuario
 */
export async function update(id: string, data: UpdateUserDTO) {
  return prisma.user.update({
    where: { id },
    data,
  });
}
