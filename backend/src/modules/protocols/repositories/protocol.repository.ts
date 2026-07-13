// =============================================================================
// Repositorio de Protocolos
// =============================================================================
// Se encarga de interactuar directamente con la base de datos usando Prisma
// =============================================================================

import prisma from '../../../config/database';
import { ProtocolDTO, ProtocolListItemDTO } from '../dto/protocol.dto';

/**
 * Obtiene todos los protocolos de todas las categorías
 */
export async function getAllProtocols(): Promise<ProtocolListItemDTO[]> {
  const protocols = await prisma.protocol.findMany({
    orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
  });

  return protocols.map((protocol) => ({
    id: protocol.id,
    categoryId: protocol.categoryId,
    order: protocol.order,
    title: protocol.title,
    objective: protocol.objective,
    description: protocol.description,
  }));
}

/**
 * Obtiene todos los protocolos de una categoría (solo datos básicos para la lista)
 */
export async function getProtocolsByCategory(
  categoryId: string
): Promise<ProtocolListItemDTO[]> {
  const protocols = await prisma.protocol.findMany({
    where: { categoryId },
    orderBy: { order: 'asc' },
  });

  return protocols.map((protocol) => ({
    id: protocol.id,
    categoryId: protocol.categoryId,
    order: protocol.order,
    title: protocol.title,
    objective: protocol.objective,
    description: protocol.description,
  }));
}

/**
 * Obtiene un protocolo completo por ID (con todas las relaciones)
 */
export async function getProtocolById(id: string): Promise<ProtocolDTO | null> {
  const protocol = await prisma.protocol.findUnique({
    where: { id },
    include: {
      materials: { orderBy: { order: 'asc' } },
      checklistItems: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
      interruptionCrit: { orderBy: { order: 'asc' } },
      dataRegistry: true,
    },
  });

  if (!protocol) return null;

  return {
    id: protocol.id,
    categoryId: protocol.categoryId,
    order: protocol.order,
    title: protocol.title,
    objective: protocol.objective,
    description: protocol.description,
    materials: protocol.materials.map((m) => ({
      id: m.id,
      name: m.name,
      imageUrl: m.imageUrl,
      order: m.order,
    })),
    checklistItems: protocol.checklistItems.map((c) => ({
      id: c.id,
      text: c.text,
      order: c.order,
    })),
    steps: protocol.steps.map((s) => ({
      id: s.id,
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description,
      videoUrl: s.videoUrl,
      order: s.order,
    })),
    interruptionCrit: protocol.interruptionCrit.map((i) => ({
      id: i.id,
      text: i.text,
      order: i.order,
    })),
    dataRegistry: protocol.dataRegistry
      ? {
          id: protocol.dataRegistry.id,
          title: protocol.dataRegistry.title,
          description: protocol.dataRegistry.description,
          unit: protocol.dataRegistry.unit,
        }
      : null,
  };
}
