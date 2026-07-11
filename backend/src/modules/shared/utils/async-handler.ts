// =============================================================================
// Wrapper (envoltorio) para manejar errores en controladores asíncronos
// =============================================================================
// Este wrapper captura cualquier error que ocurra en un controlador async y
// lo envía al middleware de manejo de errores (errorHandler).
// Así, no tenemos que usar try/catch en cada controlador!
// =============================================================================

import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  // Retornamos un nuevo controlador que envuelve el original
  return (req: Request, res: Response, next: NextFunction) => {
    // Ejecutamos el controlador original y si hay un error, lo pasamos a next()
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};