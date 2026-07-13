// =============================================================================
// Servicio de categorías
// =============================================================================
// Permite cargar categorías desde datos locales o desde la API del backend.
// =============================================================================

import { categories as localCategories } from '../data/categories';
import { apiGet, isApiDataSource } from './apiClient';

/**
 * Obtiene las categorías disponibles.
 * - En modo local usa el archivo categories.js.
 * - En modo api consulta el backend.
 */
export const getCategories = async () => {
  if (!isApiDataSource()) {
    return localCategories;
  }

  return apiGet('/api/categories');
};

/**
 * Obtiene una categoría por ID usando la misma fuente de datos activa.
 */
export const getCategoryById = async (categoryId) => {
  const categories = await getCategories();
  return categories.find((category) => category.id === categoryId) || null;
};
