// =============================================================================
// Esquema Genérico de Formulario (Ficha Técnica)
// =============================================================================
// Define los campos BASE que SIEMPRE estarán presentes en cualquier
// instrumento de registro, sin importar si el administrador configuró
// campos personalizados o no.
//
// Estos tres campos son obligatorios en TODA evaluación:
//   - ID del estudiante: documento o código que identifica al evaluado.
//   - Nombre del evaluado
//   - Nombre del evaluador
//
// Las mediciones, promedio y observaciones NO forman parte de la base
// porque dependen del protocolo específico; cuando el admin las necesita,
// las define en la pestaña "Registro" del editor de Protocolos.
// =============================================================================

/**
 * Campos base OBLIGATORIOS presentes en cualquier formulario de evaluación.
 * Se concatenan al inicio del esquema devuelto por el backend, seguidos de
 * los campos personalizados definidos por el administrador (si existen).
 */
export const GENERIC_FIELDS = [
  {
    name: 'id_estudiante',
    label: 'ID del estudiante',
    type: 'text',
    required: true,
    placeholder: 'Documento o código institucional del estudiante',
  },
  {
    name: 'evaluado',
    label: 'Nombre del evaluado',
    type: 'text',
    required: true,
    placeholder: 'Nombre completo de la persona evaluada',
  },
  {
    name: 'evaluador',
    label: 'Nombre del evaluador',
    type: 'text',
    required: true,
    placeholder: 'Nombre del evaluador',
  },
];

/**
 * Devuelve el esquema genérico envuelto en un objeto con `isGeneric: true`.
 * Sirve como fallback para cualquier protocolo que no tenga esquema propio.
 */
export const getGenericSchema = () => ({
  isGeneric: true,
  fields: GENERIC_FIELDS,
});
