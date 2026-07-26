// =============================================================================
// Controlador de Autenticación
// =============================================================================
// Maneja las peticiones HTTP de login, registro y gestión de sesiones.
// =============================================================================

import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/async-handler';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import * as authService from '../services/auth.service';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../dto/auth.dto';
import { ApiError } from '../../shared/utils/ApiError';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

/**
 * Configuración de la cookie para el refresh token
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
};

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);
  const user = await authService.register(validatedData);
  res.status(201).json(new ApiResponse(user, 'Usuario registrado correctamente'));
});

/**
 * POST /api/auth/login
 * Inicia sesión y devuelve tokens
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const { user, tokens } = await authService.login(validatedData);

  // Enviamos el refresh token en una cookie segura
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions);

  res.json(new ApiResponse({
    user,
    accessToken: tokens.accessToken
  }, 'Inicio de sesión correcto'));
});

/**
 * POST /api/auth/refresh
 * Renueva los tokens de acceso
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;

  if (!refreshToken) {
    throw new ApiError('Token de actualización no proporcionado', 401, 'REFRESH_TOKEN_REQUIRED');
  }

  const tokens = await authService.refreshTokens(refreshToken);

  // Actualizamos la cookie con el nuevo refresh token
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, cookieOptions);

  res.json(new ApiResponse({
    accessToken: tokens.accessToken
  }, 'Tokens renovados correctamente'));
});

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.sub;
  
  if (userId) {
    await authService.logout(userId);
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE);
  res.json(new ApiResponse(null, 'Sesión cerrada correctamente'));
});

/**
 * POST /api/auth/forgot-password
 * Solicita la recuperación de contraseña
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(email);
  
  res.json(new ApiResponse(null, 'Si el correo está registrado, recibirás instrucciones en breve'));
});

/**
 * POST /api/auth/reset-password
 * Restablece la contraseña usando el token
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(validatedData);
  
  res.json(new ApiResponse(null, 'Contraseña restablecida correctamente'));
});
