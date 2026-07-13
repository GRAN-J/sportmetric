// =============================================================================
// Servicio de Categorías
// =============================================================================
// Contiene la lógica de negocio para las categorías y usa el repositorio
// =============================================================================

import { CategoryDTO } from '../dto/category.dto';
import * as categoryRepository from '../repositories/category.repository';

/**
 * Obtiene todas las categorías ordenadas
 */
export async function getCategories(): Promise<CategoryDTO[]> {
  return categoryRepository.getAllCategories();
}

/**
 * Obtiene una categoría por ID
 */
export async function getCategory(id: string): Promise<CategoryDTO | null> {
  return categoryRepository.getCategoryById(id);
}
