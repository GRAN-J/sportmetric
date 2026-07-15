// =============================================================================
// Middleware global de manejo de errores para Express
// =============================================================================
// Este middleware captura todos los errores que ocurran en la aplicación y devuelve
// una respuesta consistente al cliente. Maneja:
// - Errores personalizados (ApiError)
// - Errores de validación (ZodError)
// - Errores de la base de datos (PrismaClientKnownRequestError)
// - Errores genéricos
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../../../config/env';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 1. Primero logueamos el error usando el logger para depuración
  logger.error(error);

  // ===========================================================================
  // 2. Manejamos errores personalizados (ApiError)
  // ===========================================================================
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        // En desarrollo, mostramos detalles adicionales; en producción, no
        details: env.NODE_ENV === 'development' ? error.details : undefined,
      },
    });
  }

  // ===========================================================================
  // 3. Manejamos errores de validación (ZodError)
  // ===========================================================================
  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: (error as any).flatten().fieldErrors,
      },
    });
  }

  // ===========================================================================
  // 4. Manejamos errores de la base de datos (Prisma)
  // ===========================================================================
  if ((error as any).code) {
    let statusCode = 500;
    let code = 'DATABASE_ERROR';
    let message = 'Error en la base de datos';
    let details = undefined;

    // Analizamos el código de error de Prisma para dar mensajes más específicos
    switch ((error as any).code) {
      case 'P2002': // Violación de restricción única (unique constraint)
        statusCode = 409;
        code = 'UNIQUE_CONSTRAINT';
        message = 'El registro ya existe';
        details = env.NODE_ENV === 'development' ? (error as any).meta : undefined;
        break;
      case 'P2025': // Registro no encontrado
        statusCode = 404;
        code = 'NOT_FOUND';
        message = 'Registro no encontrado';
        details = env.NODE_ENV === 'development' ? (error as any).meta : undefined;
        break;
      default:
        break;
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }

  // ===========================================================================
  // 5. Error genérico (cualquier otro error)
  // ===========================================================================
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'development' ? error.message : 'Ocurrió un error interno',
    },
  });
};
