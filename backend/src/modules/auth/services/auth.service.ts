// =============================================================================
// Servicio de Autenticación
// =============================================================================
// Contiene la lógica de negocio para el registro, login y gestión de tokens.
// =============================================================================

import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../shared/utils/ApiError';
import * as userRepository from '../../users/repositories/user.repository';
import { jwtConfig } from '../../../config/jwt';
import { LoginDTO, RegisterDTO, ResetPasswordDTO } from '../dto/auth.dto';
import { sendPasswordResetEmail } from '../../../shared/services/email.service';
import crypto from 'crypto';
import prisma from '../../../config/database';

/**
 * Genera un Access Token
 */
function generateAccessToken(payload: object): string {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn as any,
  });
}

/**
 * Genera un Refresh Token
 */
function generateRefreshToken(payload: object): string {
  return jwt.sign(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn as any,
  });
}

/**
 * Registra un nuevo usuario en el sistema
 */
export async function register(data: RegisterDTO) {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new ApiError('El correo electrónico ya está registrado', 400, 'EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await argon2.hash(data.password);
  
  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role as any, // Casting a Role de Prisma
  });

  // No devolvemos el hash de la contraseña
  const { passwordHash: _, refreshTokenHash: __, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Inicia sesión de un usuario y devuelve los tokens
 */
export async function login(data: LoginDTO) {
  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new ApiError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await argon2.verify(user.passwordHash, data.password);
  if (!isPasswordValid) {
    throw new ApiError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Guardamos el hash del refresh token en la BD
  const refreshTokenHash = await argon2.hash(refreshToken);
  await userRepository.update(user.id, { refreshTokenHash });

  const { passwordHash: _, refreshTokenHash: __, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

/**
 * Renueva el access token usando un refresh token válido
 */
export async function refreshTokens(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, jwtConfig.refresh.secret) as any;
    const user = await userRepository.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new ApiError('No autorizado', 401, 'UNAUTHORIZED');
    }

    const isTokenValid = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!isTokenValid) {
      throw new ApiError('Token de actualización inválido', 401, 'INVALID_REFRESH_TOKEN');
    }

    const newPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    await userRepository.update(user.id, { refreshTokenHash: newRefreshTokenHash });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Token de actualización expirado o inválido', 401, 'INVALID_REFRESH_TOKEN');
  }
}

/**
 * Cierra la sesión del usuario eliminando su refresh token
 */
export async function logout(userId: string) {
  await userRepository.update(userId, { refreshTokenHash: null });
}

/**
 * Genera un token de recuperación de contraseña y envía el email
 */
export async function forgotPassword(email: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    // Por seguridad, no revelamos si el email existe o no
    return;
  }

  // Generamos un token aleatorio
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await argon2.hash(resetToken);
  
  // Expira en 1 hora
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);

  await userRepository.update(user.id, {
    passwordResetTokenHash: resetTokenHash,
    passwordResetExpires: expires,
  });

  // Enviamos el email (simulado por ahora)
  await sendPasswordResetEmail(user.email, resetToken);
}

/**
 * Restablece la contraseña usando un token válido
 */
export async function resetPassword(data: ResetPasswordDTO) {
  const users = await (prisma as any).user.findMany({
    where: {
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  let targetUser = null;
  for (const user of users) {
    if (user.passwordResetTokenHash && await argon2.verify(user.passwordResetTokenHash, data.token)) {
      targetUser = user;
      break;
    }
  }

  if (!targetUser) {
    throw new ApiError('Token de recuperación inválido o expirado', 400, 'INVALID_RESET_TOKEN');
  }

  const newPasswordHash = await argon2.hash(data.newPassword);

  await userRepository.update(targetUser.id, {
    passwordHash: newPasswordHash,
    passwordResetTokenHash: null,
    passwordResetExpires: null,
    refreshTokenHash: null, // Forzamos nuevo login
  });
}
