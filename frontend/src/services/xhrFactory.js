// =============================================================================
// Factoría de XMLHttpRequest
// =============================================================================
// Encapsula la creación de la instancia XHR para poder:
//   1) Reemplazarla fácilmente en pruebas unitarias (Dependency Inversion).
//   2) Centralizar la elección del transporte HTTP (XHR vs fetch en el futuro).
// =============================================================================

/**
 * Crea una nueva instancia de XMLHttpRequest.
 * Se mantiene como función nombrada y no como arrow para que sea posible
 * utilizarla con `new` en caso de que se decida exponer la factoría
 * completa (no es el caso actual, pero queda como puerta de extensión).
 */
export function createXHR() {
  return new XMLHttpRequest();
}
