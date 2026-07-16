// =============================================================================
// Servicio de protocolos
// =============================================================================
// Expone una interfaz estable para el frontend aunque los datos provengan de
// archivos JSON locales o de la API del backend.
// =============================================================================

import { apiGet, isApiDataSource } from './apiClient';

// Carga todos los módulos de protocolos desde la carpeta data/protocols.
const protocolModules = import.meta.glob('../data/protocols/*.json', { eager: true });

const allProtocolObjects = Object.values(protocolModules)
  .map((module) => (module?.default ? module.default : module))
  .filter((protocol) => protocol && typeof protocol.order === 'number' && protocol.id && protocol.title && protocol.category);

const protocolListSorted = allProtocolObjects
  .slice()
  .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);

const protocolById = new Map(protocolListSorted.map((protocol) => [protocol.id, protocol]));

let protocolMetaCache = null;
const protocolMetaByCategoryCache = new Map();

const localListToMeta = (protocol) => ({
  id: protocol.id,
  title: protocol.title,
  category: protocol.category,
  summary: protocol.objective || '',
  order: protocol.order,
});

const mapApiProtocolListItem = (protocol) => ({
  id: protocol.id,
  title: protocol.title,
  category: protocol.categoryId,
  summary: protocol.objective || protocol.description || '',
  order: protocol.order,
});

const mapApiProtocolDetail = (protocol) => ({
  id: protocol.id,
  order: protocol.order,
  category: protocol.categoryId,
  title: protocol.title,
  objective: protocol.objective,
  description: protocol.description,
  materials: (protocol.materials || []).map((material) => ({
    name: material.name,
    image: material.imageUrl || null,
    order: material.order,
  })),
  checklist: (protocol.checklistItems || []).map((item) => item.text),
  steps: (protocol.steps || []).map((step) => ({
    step: step.stepNumber,
    title: step.title,
    description: step.description,
    video: step.videoUrl || null,
    order: step.order,
  })),
  interruptionCriteria: (protocol.interruptionCrit || []).map((criterion) => criterion.text),
  dataRegistry: protocol.dataRegistry || {},
});

const sortProtocolsMeta = (protocols) =>
  protocols.sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);

const getAllProtocolsMeta = async (options = {}) => {
  if (protocolMetaCache) {
    return protocolMetaCache;
  }

  if (!isApiDataSource()) {
    protocolMetaCache = protocolListSorted.map(localListToMeta);
    return protocolMetaCache;
  }

  const protocols = await apiGet('/api/protocols', options);
  protocolMetaCache = sortProtocolsMeta(protocols.map(mapApiProtocolListItem));

  return protocolMetaCache;
};

/**
 * Obtiene la lista de protocolos para una categoría específica.
 * Si la categoría es `all`, devuelve todos.
 */
export const getProtocolsByCategory = async (categoryId, options = {}) => {
  if (!isApiDataSource()) {
    const protocols = await getAllProtocolsMeta();
    if (categoryId === 'all') {
      return protocols;
    }

    return protocols.filter((protocol) => protocol.category === categoryId);
  }

  if (categoryId === 'all') {
    return getAllProtocolsMeta(options);
  }

  if (protocolMetaByCategoryCache.has(categoryId)) {
    return protocolMetaByCategoryCache.get(categoryId);
  }

  const protocols = await apiGet(`/api/categories/${categoryId}/protocols`, options);
  const mappedProtocols = sortProtocolsMeta(protocols.map(mapApiProtocolListItem));
  protocolMetaByCategoryCache.set(categoryId, mappedProtocols);
  return mappedProtocols;
};

/**
 * Obtiene el ID del siguiente protocolo dentro de la misma categoría.
 */
export const getNextProtocolId = async (currentProtocolId, categoryId, options = {}) => {
  const protocols = await getProtocolsByCategory(categoryId, options);
  const currentIndex = protocols.findIndex((protocol) => protocol.id === currentProtocolId);

  if (currentIndex !== -1 && currentIndex < protocols.length - 1) {
    return protocols[currentIndex + 1].id;
  }

  return null;
};

/**
 * Obtiene el detalle completo de un protocolo por su ID.
 */
export const getProtocolById = async (protocolId, options = {}) => {
  if (!isApiDataSource()) {
    return protocolById.get(protocolId) || null;
  }

  const protocol = await apiGet(`/api/protocols/${protocolId}`, options);
  return mapApiProtocolDetail(protocol);
};
