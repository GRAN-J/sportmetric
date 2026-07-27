// =============================================================================
// Servicio de Formularios y Evaluaciones (Frontend)
// =============================================================================

import { apiGet, apiPost } from './apiClient';

/**
 * Obtiene el esquema de campos para un protocolo específico.
 * Se añade un parámetro de cache-busting (`_t`) para evitar respuestas
 * cacheadas por el navegador o proxies intermedios.
 */
export const getFormSchema = async (protocolId, options = {}) => {
  const url = `/api/forms/${protocolId}?_t=${Date.now()}`;
  return apiGet(url, options);
};

/**
 * Registra una nueva evaluación
 */
export const saveEvaluation = async (evaluationData) => {
  return apiPost('/api/evaluations', evaluationData);
};

/**
 * Obtiene el historial de evaluaciones de un estudiante
 */
export const getStudentHistory = async (studentId) => {
  return apiGet(`/api/evaluations/student/${studentId}`);
};
