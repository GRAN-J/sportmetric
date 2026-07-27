// =============================================================================
// Servicio de Analítica
// =============================================================================
// Carga estadísticas y métricas desde el backend para el panel administrativo.
// =============================================================================

import { apiGet } from './apiClient';

/**
 * Obtiene el resumen general de estadísticas del sistema.
 * @returns {Promise<{users: number, protocols: number, evaluations: number, categories: number}>}
 */
export const getSummary = async (options = {}) => {
  return apiGet('/api/analytics/summary', options);
};

/**
 * Obtiene la actividad de evaluaciones por mes (últimos 6 meses).
 * @returns {Promise<Array<{name: string, total: number}>>}
 */
export const getActivity = async (options = {}) => {
  return apiGet('/api/analytics/activity', options);
};

/**
 * Obtiene los protocolos más utilizados.
 * @returns {Promise<Array<{name: string, value: number}>>}
 */
export const getTopProtocols = async (options = {}) => {
  return apiGet('/api/analytics/top-protocols', options);
};
