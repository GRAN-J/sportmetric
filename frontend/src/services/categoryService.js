// =============================================================================
// Servicio de categorías
// =============================================================================
// Permite cargar categorías desde datos locales o desde la API del backend.
// =============================================================================

import { categories as localCategories } from '../data/categories';
import { apiGet, isApiDataSource } from './apiClient';
import { isAuthenticated } from './authService';

/**
 * Obtiene las categorías disponibles.
 * - En modo local usa el archivo categories.js.
 * - En modo api consulta el backend, PERO solo si el usuario esta
 *   autenticado. Los visitantes sin sesion reciben los datos locales
 *   para evitar pagar el cold start de Render en cada visita publica.
 */
export const getCategories = async (options = {}) => {
  if (!isApiDataSource() || !isAuthenticated()) {
    return localCategories;
  }

  return apiGet('/api/categories', options);
};

/**
 * Obtiene una categoría por ID usando la misma fuente de datos activa.
 */
export const getCategoryById = async (categoryId, options = {}) => {
  const categories = await getCategories(options);
  return categories.find((category) => category.id === categoryId) || null;
};
