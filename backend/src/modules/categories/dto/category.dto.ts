// =============================================================================
// DTO de Categoría para respuestas API
// =============================================================================
// Define la estructura de los datos de categoría que enviamos al frontend
// =============================================================================

export interface CategoryDTO {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}
