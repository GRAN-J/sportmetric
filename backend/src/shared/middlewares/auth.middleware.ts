// =============================================================================
// Middleware de Autenticación
// =============================================================================
// Verifica que la petición incluya un token de acceso válido en los headers.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../modules/shared/utils/ApiError';
import { jwtConfig } from '../../config/jwt';

/**
 * Middleware para proteger rutas que requieren autenticación
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError('No autorizado: Token no proporcionado', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.access.secret);
    (req as any).user = decoded;
    next();
  } catch (_error) {
    throw new ApiError('Sesión expirada o token inválido', 401, 'INVALID_TOKEN');
  }
};

/**
 * Middleware para restringir el acceso a ciertos roles
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new ApiError('No tienes permisos para realizar esta acción', 403, 'FORBIDDEN');
    }

    next();
  };
};
