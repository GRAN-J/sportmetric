// =============================================================================
// Repositorio de Categorías
// =============================================================================
// Se encarga de interactuar directamente con la base de datos usando Prisma
// =============================================================================

import prisma from '../../../config/database';
import { CategoryDTO } from '../dto/category.dto';

/**
 * Obtiene todas las categorías ordenadas por el campo `order`
 */
export async function getAllCategories(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
  });

  return categories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    icon: category.icon,
    color: category.color,
    order: category.order,
  }));
}

/**
 * Obtiene una categoría por su ID
 */
export async function getCategoryById(id: string): Promise<CategoryDTO | null> {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) return null;

  return {
    id: category.id,
    title: category.title,
    description: category.description,
    icon: category.icon,
    color: category.color,
    order: category.order,
  };
}
