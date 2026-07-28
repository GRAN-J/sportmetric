// =============================================================================
// Tests del servicio de Formularios (Frontend)
// =============================================================================

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/apiClient', () => ({
  apiGet: vi.fn().mockResolvedValue({ data: {} }),
  apiPost: vi.fn().mockResolvedValue({ data: {} }),
}));

import { apiGet, apiPost } from '../../services/apiClient';
import {
  getFormSchema,
  saveEvaluation,
  getStudentHistory,
} from '../../services/formService';

describe('formService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFormSchema', () => {
    it('agrega parametro de cache-busting _t con la fecha actual', async () => {
      const before = Date.now();
      await getFormSchema('medicion-de-la-talla');
      const after = Date.now();

      const calledUrl = apiGet.mock.calls[0][0];
      expect(calledUrl).toMatch(/^\/api\/forms\/medicion-de-la-talla\?_t=\d+$/);

      const timestamp = Number(calledUrl.split('_t=')[1]);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('reenvia las opciones al cliente HTTP', async () => {
      const signal = new AbortController().signal;
      await getFormSchema('medicion-de-la-talla', { signal });

      expect(apiGet).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/forms\//), {
        signal,
      });
    });

    it('cada llamada genera un _t diferente', async () => {
      await getFormSchema('a');
      await new Promise((r) => setTimeout(r, 5));
      await getFormSchema('a');

      const url1 = apiGet.mock.calls[0][0];
      const url2 = apiGet.mock.calls[1][0];
      expect(url1).not.toBe(url2);
    });
  });

  describe('saveEvaluation', () => {
    it('envia POST /api/evaluations con el payload completo', async () => {
      const payload = {
        protocolId: 'medicion-de-la-talla',
        results: { id_estudiante: '123', talla_cm: 132 },
      };

      await saveEvaluation(payload);

      expect(apiPost).toHaveBeenCalledWith('/api/evaluations', payload);
    });
  });

  describe('getStudentHistory', () => {
    it('construye la URL con el id_estudiante', async () => {
      await getStudentHistory('2929281829');

      expect(apiGet).toHaveBeenCalledWith('/api/evaluations/student/2929281829');
    });
  });
});
