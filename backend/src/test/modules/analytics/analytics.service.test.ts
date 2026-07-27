// =============================================================================
// Tests del servicio de Analitica
// =============================================================================
// Verifica los tres endpoints del dashboard: stats, actividad mensual y top.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { count: vi.fn() },
    protocol: { count: vi.fn(), findMany: vi.fn() },
    evaluation: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
    category: { count: vi.fn() },
  },
}));

vi.mock('../../../config/database', () => ({
  default: prismaMock,
}));

import {
  getGeneralStats,
  getEvaluationsByMonth,
  getTopProtocols,
} from '../../../modules/analytics/services/analytics.service';

describe('analytics service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGeneralStats', () => {
    it('retorna el conteo total de cada entidad del sistema', async () => {
      prismaMock.user.count.mockResolvedValue(5);
      prismaMock.protocol.count.mockResolvedValue(12);
      prismaMock.evaluation.count.mockResolvedValue(120);
      prismaMock.category.count.mockResolvedValue(6);

      const stats = await getGeneralStats();

      expect(stats).toEqual({
        users: 5,
        protocols: 12,
        evaluations: 120,
        categories: 6,
      });
    });

    it('ejecuta las 4 cuentas en paralelo', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.protocol.count.mockResolvedValue(0);
      prismaMock.evaluation.count.mockResolvedValue(0);
      prismaMock.category.count.mockResolvedValue(0);

      await getGeneralStats();

      expect(prismaMock.user.count).toHaveBeenCalled();
      expect(prismaMock.protocol.count).toHaveBeenCalled();
      expect(prismaMock.evaluation.count).toHaveBeenCalled();
      expect(prismaMock.category.count).toHaveBeenCalled();
    });
  });

  describe('getEvaluationsByMonth', () => {
    it('agrupa las evaluaciones por mes de los ultimos 6 meses', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([
        { date: new Date('2026-01-15') },
        { date: new Date('2026-01-20') },
        { date: new Date('2026-02-10') },
      ]);

      const stats = await getEvaluationsByMonth();

      const ene = stats.find((s) => s.name === 'Ene');
      const feb = stats.find((s) => s.name === 'Feb');
      expect(ene?.total).toBe(2);
      expect(feb?.total).toBe(1);
    });

    it('retorna un array vacio si no hay evaluaciones', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      const stats = await getEvaluationsByMonth();

      expect(stats).toEqual([]);
    });

    it('filtra por fecha >= 6 meses atras', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      await getEvaluationsByMonth();

      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { date: { gte: expect.any(Date) } },
          select: { date: true },
        })
      );
    });
  });

  describe('getTopProtocols', () => {
    it('combina el groupBy con los titulos de los protocolos', async () => {
      prismaMock.evaluation.groupBy.mockResolvedValue([
        { protocolId: 'medicion-de-la-talla', _count: { id: 30 } },
        { protocolId: 'medicion-del-peso', _count: { id: 20 } },
      ]);
      prismaMock.protocol.findMany.mockResolvedValue([
        { id: 'medicion-de-la-talla', title: 'Medición de la Talla' },
        { id: 'medicion-del-peso', title: 'Medición del Peso' },
      ]);

      const top = await getTopProtocols();

      expect(top).toEqual([
        { name: 'Medición de la Talla', value: 30 },
        { name: 'Medición del Peso', value: 20 },
      ]);
    });

    it('usa el id del protocolo como fallback si no encuentra el titulo', async () => {
      prismaMock.evaluation.groupBy.mockResolvedValue([
        { protocolId: 'protocolo-borrado', _count: { id: 5 } },
      ]);
      prismaMock.protocol.findMany.mockResolvedValue([]);

      const top = await getTopProtocols();

      expect(top).toEqual([{ name: 'protocolo-borrado', value: 5 }]);
    });

    it('limita el top a 5 resultados', async () => {
      prismaMock.evaluation.groupBy.mockResolvedValue([]);
      prismaMock.protocol.findMany.mockResolvedValue([]);

      await getTopProtocols();

      expect(prismaMock.evaluation.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });
});
