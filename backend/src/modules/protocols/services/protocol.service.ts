// =============================================================================
// Servicio de Protocolos
// =============================================================================
// Contiene la lógica de negocio para los protocolos y usa el repositorio
// =============================================================================

import { ProtocolDTO, ProtocolListItemDTO } from '../dto/protocol.dto';
import { ApiError } from '../../shared/utils/ApiError';
import * as protocolRepository from '../repositories/protocol.repository';
import prisma from '../../../config/database';

// -----------------------------------------------------------------------------
// Helpers de validación
// -----------------------------------------------------------------------------

const SLUG_REGEX = /^[a-z0-9-]+$/;

const validatePayload = async (data: any, isUpdate: boolean = false) => {
  if (!data || typeof data !== 'object') {
    throw new ApiError('Datos del protocolo inválidos', 400, 'INVALID_PAYLOAD');
  }

  // ID (slug)
  if (!isUpdate) {
    if (!data.id || typeof data.id !== 'string' || !data.id.trim()) {
      throw new ApiError('El identificador (slug) es obligatorio', 400, 'MISSING_ID');
    }
    if (!SLUG_REGEX.test(data.id)) {
      throw new ApiError('El identificador solo puede contener minúsculas, números y guiones', 400, 'INVALID_ID');
    }
  }

  // Categoría
  if (!data.categoryId || typeof data.categoryId !== 'string' || !data.categoryId.trim()) {
    throw new ApiError('Debes seleccionar una categoría válida', 400, 'MISSING_CATEGORY');
  }

  // Verifica que la categoría exista en la base de datos
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new ApiError(`La categoría "${data.categoryId}" no existe en el sistema`, 400, 'CATEGORY_NOT_FOUND');
  }

  // Título
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    throw new ApiError('El título del protocolo es obligatorio', 400, 'MISSING_TITLE');
  }
};

/**
 * Obtiene todos los protocolos del sistema
 */
export async function getProtocols(): Promise<ProtocolListItemDTO[]> {
  return protocolRepository.getAllProtocols();
}

/**
 * Obtiene todos los protocolos de una categoría
 */
export async function getProtocolsByCategory(
  categoryId: string
): Promise<ProtocolListItemDTO[]> {
  return protocolRepository.getProtocolsByCategory(categoryId);
}

/**
 * Obtiene un protocolo completo por ID
 */
export async function getProtocol(id: string): Promise<ProtocolDTO | null> {
  return protocolRepository.getProtocolById(id);
}

/**
 * Crea un protocolo (Admin)
 */
export async function createProtocol(data: any) {
  await validatePayload(data, false);
  return protocolRepository.create(data);
}

/**
 * Actualiza un protocolo (Admin)
 */
export async function updateProtocol(id: string, data: any) {
  await validatePayload(data, true);
  return protocolRepository.update(id, data);
}

/**
 * Elimina un protocolo (Admin)
 */
export async function deleteProtocol(id: string) {
  return protocolRepository.remove(id);
}
