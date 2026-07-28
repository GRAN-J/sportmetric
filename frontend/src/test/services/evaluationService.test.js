// =============================================================================
// Tests del servicio de Evaluaciones (Frontend)
// =============================================================================
// Verifica que el servicio construye correctamente las URLs y los query params.
// =============================================================================

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/apiClient', () => ({
  apiGet: vi.fn().mockResolvedValue({ data: [] }),
  apiPatch: vi.fn().mockResolvedValue({ data: {} }),
  apiDelete: vi.fn().mockResolvedValue({ data: null }),
}));

import { apiGet, apiPatch, apiDelete } from '../../services/apiClient';
import {
  listEvaluations,
  getEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from '../../services/evaluationService';

describe('evaluationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listEvaluations', () => {
    it('construye la URL sin query params cuando no hay filtros', async () => {
      await listEvaluations();

      expect(apiGet).toHaveBeenCalledWith('/api/evaluations');
    });

    it('agrega protocolId al query string cuando se proporciona', async () => {
      await listEvaluations({ protocolId: 'medicion-de-la-talla' });

      expect(apiGet).toHaveBeenCalledWith(
        '/api/evaluations?protocolId=medicion-de-la-talla'
      );
    });

    it('agrega search al query string cuando se proporciona', async () => {
      await listEvaluations({ search: 'juan' });

      expect(apiGet).toHaveBeenCalledWith('/api/evaluations?search=juan');
    });

    it('combina protocolId y search con & cuando ambos se pasan', async () => {
      await listEvaluations({ protocolId: 'medicion-de-la-talla', search: 'juan' });

      expect(apiGet).toHaveBeenCalledWith(
        '/api/evaluations?protocolId=medicion-de-la-talla&search=juan'
      );
    });
  });

  describe('getEvaluation', () => {
    it('obtiene una evaluacion por id', async () => {
      await getEvaluation('ev-123');

      expect(apiGet).toHaveBeenCalledWith('/api/evaluations/ev-123');
    });
  });

  describe('updateEvaluation', () => {
    it('envia PATCH con el id y los datos', async () => {
      await updateEvaluation('ev-1', { notes: 'actualizado' });

      expect(apiPatch).toHaveBeenCalledWith('/api/evaluations/ev-1', { notes: 'actualizado' });
    });
  });

  describe('deleteEvaluation', () => {
    it('envia DELETE con el id', async () => {
      await deleteEvaluation('ev-1');

      expect(apiDelete).toHaveBeenCalledWith('/api/evaluations/ev-1');
    });
  });
});
