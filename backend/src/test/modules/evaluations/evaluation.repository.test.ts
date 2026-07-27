// =============================================================================
// Tests del repositorio de Evaluaciones
// =============================================================================
// Verifica que el repositorio construye correctamente las queries de Prisma
// para create, findAll, findByStudent, findById, update y remove.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    evaluation: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../../../config/database', () => ({
  default: prismaMock,
}));

import {
  create,
  findAll,
  findByStudent,
  findById,
  update,
  remove,
} from '../../../modules/evaluations/repositories/evaluation.repository';

describe('evaluation repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('crea una evaluacion publica con los campos de la Ficha Tecnica base en JSONB', async () => {
      prismaMock.evaluation.create.mockResolvedValue({
        id: 'ev-1',
        protocolId: 'medicion-de-la-talla',
        results: {
          id_estudiante: '2929281829',
          evaluado: 'juan pancho feliz',
          evaluador: 'armando ejecutivo',
          talla_cm: 132,
        },
        notes: 'Sin novedad',
        date: new Date('2026-07-28'),
      });

      const data = {
        protocolId: 'medicion-de-la-talla',
        results: {
          id_estudiante: '2929281829',
          evaluado: 'juan pancho feliz',
          evaluador: 'armando ejecutivo',
          talla_cm: 132,
        },
        notes: 'Sin novedad',
      };

      await create(data);

      expect(prismaMock.evaluation.create).toHaveBeenCalledWith({
        data: {
          protocolId: 'medicion-de-la-talla',
          results: data.results,
          notes: 'Sin novedad',
          date: expect.any(Date),
        },
        include: {
          protocol: { select: { id: true, title: true, categoryId: true } },
        },
      });
    });

    it('acepta fecha personalizada y la persiste tal cual', async () => {
      prismaMock.evaluation.create.mockResolvedValue({ id: 'ev-2' });

      const customDate = new Date('2026-01-15T10:00:00Z');
      await create({
        protocolId: 'medicion-de-la-talla',
        results: {},
        date: customDate,
      });

      expect(prismaMock.evaluation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ date: customDate }),
        })
      );
    });
  });

  describe('findAll', () => {
    it('lista todas las evaluaciones sin filtros, ordenadas por fecha descendente', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      await findAll();

      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { date: 'desc' },
        include: {
          protocol: { select: { id: true, title: true, categoryId: true } },
        },
      });
    });

    it('filtra por protocolId cuando se proporciona', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      await findAll({ protocolId: 'medicion-de-la-talla' });

      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ protocolId: 'medicion-de-la-talla' }),
        })
      );
    });

    it('busca en el JSONB de results cuando se pasa search', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      await findAll({ search: 'juan' });

      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { notes: { contains: 'juan', mode: 'insensitive' } },
              { results: { path: ['id_estudiante'], string_contains: 'juan' } },
              { results: { path: ['evaluado'], string_contains: 'juan' } },
              { results: { path: ['evaluador'], string_contains: 'juan' } },
              { protocol: { title: { contains: 'juan', mode: 'insensitive' } } },
            ]),
          }),
        })
      );
    });

    it('ignora search cuando es solo espacios en blanco', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      await findAll({ search: '   ' });

      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { date: 'desc' },
        include: {
          protocol: { select: { id: true, title: true, categoryId: true } },
        },
      });
    });

    it('combina protocolId y search cuando ambos se pasan', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      await findAll({ protocolId: 'medicion-de-la-talla', search: 'juan' });

      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            protocolId: 'medicion-de-la-talla',
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('findByStudent', () => {
    it('busca evaluaciones por id_estudiante en el JSONB', async () => {
      prismaMock.evaluation.findMany.mockResolvedValue([]);

      await findByStudent('2929281829');

      expect(prismaMock.evaluation.findMany).toHaveBeenCalledWith({
        where: { results: { path: ['id_estudiante'], equals: '2929281829' } },
        orderBy: { date: 'desc' },
        include: {
          protocol: { select: { id: true, title: true } },
        },
      });
    });
  });

  describe('findById', () => {
    it('busca una evaluacion con su protocolo', async () => {
      prismaMock.evaluation.findUnique.mockResolvedValue({
        id: 'ev-1',
        results: {},
        protocol: { id: 'medicion-de-la-talla' },
      });

      await findById('ev-1');

      expect(prismaMock.evaluation.findUnique).toHaveBeenCalledWith({
        where: { id: 'ev-1' },
        include: { protocol: true },
      });
    });
  });

  describe('update', () => {
    it('actualiza los resultados y notas de una evaluacion existente', async () => {
      prismaMock.evaluation.update.mockResolvedValue({ id: 'ev-1' });

      await update('ev-1', { results: { talla_cm: 140 }, notes: 'actualizado' });

      expect(prismaMock.evaluation.update).toHaveBeenCalledWith({
        where: { id: 'ev-1' },
        data: { results: { talla_cm: 140 }, notes: 'actualizado', date: undefined },
        include: {
          protocol: { select: { id: true, title: true, categoryId: true } },
        },
      });
    });
  });

  describe('remove', () => {
    it('elimina una evaluacion por id', async () => {
      prismaMock.evaluation.delete.mockResolvedValue({ id: 'ev-1' });

      await remove('ev-1');

      expect(prismaMock.evaluation.delete).toHaveBeenCalledWith({
        where: { id: 'ev-1' },
      });
    });
  });
});
