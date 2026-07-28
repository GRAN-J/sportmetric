// =============================================================================
// Tests del servicio de Analitica (Frontend)
// =============================================================================

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/apiClient', () => ({
  apiGet: vi.fn().mockResolvedValue({ data: {} }),
}));

import { apiGet } from '../../services/apiClient';
import {
  getSummary,
  getActivity,
  getTopProtocols,
} from '../../services/analyticsService';

describe('analyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSummary', () => {
    it('llama a /api/analytics/summary', async () => {
      await getSummary();

      expect(apiGet).toHaveBeenCalledWith('/api/analytics/summary', {});
    });

    it('reenvia las opciones (signal, headers)', async () => {
      const signal = new AbortController().signal;
      await getSummary({ signal });

      expect(apiGet).toHaveBeenCalledWith('/api/analytics/summary', { signal });
    });
  });

  describe('getActivity', () => {
    it('llama a /api/analytics/activity', async () => {
      await getActivity();

      expect(apiGet).toHaveBeenCalledWith('/api/analytics/activity', {});
    });
  });

  describe('getTopProtocols', () => {
    it('llama a /api/analytics/top-protocols', async () => {
      await getTopProtocols();

      expect(apiGet).toHaveBeenCalledWith('/api/analytics/top-protocols', {});
    });
  });
});
