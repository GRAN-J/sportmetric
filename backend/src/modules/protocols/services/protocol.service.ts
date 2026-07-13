// =============================================================================
// Servicio de Protocolos
// =============================================================================
// Contiene la lógica de negocio para los protocolos y usa el repositorio
// =============================================================================

import { ProtocolDTO, ProtocolListItemDTO } from '../dto/protocol.dto';
import * as protocolRepository from '../repositories/protocol.repository';

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
