// =============================================================================
// Servicio de Evaluaciones (Frontend - Panel Admin)
// =============================================================================
// Centraliza las llamadas al backend para gestionar registros de evaluación.
// =============================================================================

import { apiGet, apiPatch, apiDelete } from './apiClient';

/**
 * Lista todas las evaluaciones con filtros opcionales
 */
export const listEvaluations = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.protocolId) params.set('protocolId', filters.protocolId);
  if (filters.search) params.set('search', filters.search);
  const query = params.toString();
  return apiGet(`/api/evaluations${query ? `?${query}` : ''}`);
};

/**
 * Obtiene el detalle de una evaluación específica
 */
export const getEvaluation = async (id) => {
  return apiGet(`/api/evaluations/${id}`);
};

/**
 * Actualiza los datos editables de una evaluación
 */
export const updateEvaluation = async (id, data) => {
  return apiPatch(`/api/evaluations/${id}`, data);
};

/**
 * Elimina una evaluación
 */
export const deleteEvaluation = async (id) => {
  return apiDelete(`/api/evaluations/${id}`);
};
