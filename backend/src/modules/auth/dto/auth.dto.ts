// =============================================================================
// DTOs de Autenticación
// =============================================================================
// Define los esquemas de validación para las peticiones de autenticación.
// =============================================================================

import { z } from 'zod';

// Esquema para el registro de usuarios
export const registerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email no válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(['STUDENT', 'EVALUATOR', 'ADMIN', 'RESEARCHER']).optional(),
});

// Esquema para el inicio de sesión
export const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Esquema para solicitar recuperación de contraseña
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email no válido'),
});

// Esquema para restablecer contraseña
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

// Tipos inferidos de los esquemas
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
