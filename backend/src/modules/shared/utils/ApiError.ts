// =============================================================================
// Clase personalizada para manejar errores de la API
// =============================================================================
// Extiende la clase Error nativa de JavaScript para agregar propiedades
// útiles para la API:
// - statusCode: Código HTTP de la respuesta
// - code: Código interno del error (ej: "VALIDATION_ERROR")
// - details: Detalles adicionales del error (solo en desarrollo)
// =============================================================================

import { env } from '../../../config/env';

export class ApiError extends Error {
  public readonly statusCode: number; // Código HTTP (ej: 400, 401, 500)
  public readonly code: string;       // Código interno del error (ej: "UNAUTHORIZED")
  public readonly details?: any;      // Detalles adicionales (opcional)

  /**
   * Constructor de la clase ApiError
   * @param message - Mensaje descriptivo del error
   * @param statusCode - Código HTTP de la respuesta
   * @param code - Código interno del error
   * @param details - Detalles adicionales (solo en desarrollo)
   */
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message); // Llamamos al constructor de la clase padre Error
    
    this.name = 'ApiError'; // Nombre de la clase de error
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Capturamos el stack trace (solo en desarrollo, para mejor depuración)
    if (env.NODE_ENV !== 'production') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}