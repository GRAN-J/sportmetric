/**
 * Servicio para manejar la carga y gestión de protocolos desde archivos JSON
 */

// Carga todos los módulos de protocolos desde la carpeta data/protocols
const protocolModules = import.meta.glob('../data/protocols/*.json', { eager: true });

/**
 * Lista completa de objetos de protocolo (solo aquellos con estructura válida)
 */
const allProtocolObjects = Object.values(protocolModules)
  .map((m) => (m?.default ? m.default : m))
  .filter((p) => p && typeof p.order === 'number' && p.id && p.title && p.category);

/**
 * Lista de protocolos ordenada por categoría y orden definido
 */
const protocolListSorted = allProtocolObjects
  .slice()
  .sort((a, b) => (a.category.localeCompare(b.category) || a.order - b.order));

/**
 * Mapa para buscar protocolos por su ID de forma rápida
 */
const protocolById = new Map(protocolListSorted.map((p) => [p.id, p]));

/**
 * Lista de metadatos de protocolos (para navegación)
 */
const protocolMetaSorted = protocolListSorted.map((p) => ({
  id: p.id,
  title: p.title,
  category: p.category,
  summary: p.objective || '',
  order: p.order,
}));

/**
 * Obtiene la lista de metadatos de protocolos para una categoría específica
 * @param {string} categoryId - ID de la categoría ('all' para todos)
 * @returns {Array} Lista de metadatos de protocolos
 */
export const getProtocolsByCategory = (categoryId) => {
  if (categoryId === 'all') return protocolMetaSorted;
  return protocolMetaSorted.filter((p) => p.category === categoryId);
};

/**
 * Obtiene el ID del siguiente protocolo en la misma categoría
 * @param {string} currentProtocolId - ID del protocolo actual
 * @param {string} categoryId - ID de la categoría
 * @returns {string|null} ID del siguiente protocolo o null si no hay más
 */
export const getNextProtocolId = (currentProtocolId, categoryId) => {
  const list = getProtocolsByCategory(categoryId);
  const idx = list.findIndex((p) => p.id === currentProtocolId);
  if (idx !== -1 && idx < list.length - 1) return list[idx + 1].id;
  return null;
};

/**
 * Obtiene un protocolo completo por su ID
 * @param {string} protocolId - ID del protocolo a buscar
 * @returns {Promise<Object|null>} Objeto del protocolo o null si no existe
 */
export const getProtocolById = async (protocolId) => {
  return protocolById.get(protocolId) || null;
};
