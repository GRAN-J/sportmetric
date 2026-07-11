// =============================================================================
// Clase para respuestas estándarizadas de la API
// =============================================================================
// Todas las respuestas exitosas de la API usan esta estructura para asegurar
// consistencia en toda la aplicación.
// - success: Indica si la operación fue exitosa
// - data: Datos de la respuesta
// - message: Mensaje descriptivo de la operación
// - meta: Metadatos adicionales (opcional, ej: paginación)
// =============================================================================

export class ApiResponse<T> {
  public readonly success: boolean; // Siempre true para respuestas exitosas
  public readonly data: T | null;   // Datos de la respuesta (puede ser null)
  public readonly message: string;  // Mensaje descriptivo
  public readonly meta?: any;       // Metadatos adicionales (opcional)

  /**
   * Constructor de la clase ApiResponse
   * @param data - Datos de la respuesta
   * @param message - Mensaje descriptivo (opcional, por defecto "Operación exitosa")
   * @param meta - Metadatos adicionales (opcional, ej: paginación)
   */
  constructor(
    data: T | null,
    message: string = 'Operación exitosa',
    meta?: any
  ) {
    this.success = true;
    this.data = data;
    this.message = message;
    if (meta) {
      this.meta = meta;
    }
  }
}