// =============================================================================
// Servicio de Usuarios
// =============================================================================

import * as userRepository from '../repositories/user.repository';
import { ApiError } from '../../shared/utils/ApiError';
import * as argon2 from 'argon2';

/**
 * Obtiene todos los usuarios
 */
export async function getAllUsers() {
  const users = await userRepository.findAll();
  return users.map(user => {
    const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, passwordResetTokenHash: _passwordResetTokenHash, ...rest } = user;
    return rest;
  });
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id: string) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }
  const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, passwordResetTokenHash: _passwordResetTokenHash, ...rest } = user;
  return rest;
}

/**
 * Crea un nuevo usuario (Admin)
 */
export async function createUser(data: any) {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new ApiError('El correo ya está registrado', 400, 'EMAIL_EXISTS');
  }

  const passwordHash = await argon2.hash(data.password);
  
  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
  });

  const { passwordHash: _, ...rest } = user;
  return rest;
}

/**
 * Actualiza un usuario
 */
export async function updateUser(id: string, data: any) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }

  const updateData: any = { ...data };
  if (data.password) {
    updateData.passwordHash = await argon2.hash(data.password);
    delete updateData.password;
  }

  const updatedUser = await userRepository.update(id, updateData);
  const { passwordHash: _, refreshTokenHash: __, ...rest } = updatedUser;
  return rest;
}

/**
 * Elimina un usuario
 */
export async function deleteUser(id: string) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }
  return userRepository.remove(id);
}
