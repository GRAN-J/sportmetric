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

const getAllProtocolsMeta = async () => {
  if (protocolMetaCache) {
    return protocolMetaCache;
  }

  if (!isApiDataSource()) {
    protocolMetaCache = protocolListSorted.map(localListToMeta);
    return protocolMetaCache;
  }

  const protocols = await apiGet('/api/protocols');
  protocolMetaCache = protocols
    .map(mapApiProtocolListItem)
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);

  return protocolMetaCache;
};

/**
 * Obtiene la lista de protocolos para una categoría específica.
 * Si la categoría es `all`, devuelve todos.
 */
export const getProtocolsByCategory = async (categoryId) => {
  const protocols = await getAllProtocolsMeta();

  if (categoryId === 'all') {
    return protocols;
  }

  return protocols.filter((protocol) => protocol.category === categoryId);
};

/**
 * Obtiene el ID del siguiente protocolo dentro de la misma categoría.
 */
export const getNextProtocolId = async (currentProtocolId, categoryId) => {
  const protocols = await getProtocolsByCategory(categoryId);
  const currentIndex = protocols.findIndex((protocol) => protocol.id === currentProtocolId);

  if (currentIndex !== -1 && currentIndex < protocols.length - 1) {
    return protocols[currentIndex + 1].id;
  }

  return null;
};

/**
 * Obtiene el detalle completo de un protocolo por su ID.
 */
export const getProtocolById = async (protocolId) => {
  if (!isApiDataSource()) {
    return protocolById.get(protocolId) || null;
  }

  const protocol = await apiGet(`/api/protocols/${protocolId}`);
  return mapApiProtocolDetail(protocol);
};
