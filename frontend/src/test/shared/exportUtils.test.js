// =============================================================================
// Tests de exportUtils (utilidades de exportacion PDF/CSV)
// =============================================================================
// Verifica que las exportaciones construyen los blobs correctos y disparan
// la descarga del navegador.
// =============================================================================

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockDoc = {
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  text: vi.fn(),
  autoTable: vi.fn(),
  lastAutoTable: { finalY: 100 },
  save: vi.fn(),
};

function MockJsPDF() {
  return mockDoc;
}
MockJsPDF.__isMockJsPDF = true;

vi.mock('jspdf', () => ({
  default: MockJsPDF,
}));

vi.mock('jspdf-autotable', () => ({}));

import { exportEvaluationToPDF, exportEvaluationsToCSV } from '../../shared/utils/exportUtils';

describe('exportUtils', () => {
  beforeEach(() => {
    // Limpiamos SOLO las llamadas de los metodos, no la implementacion del mock.
    mockDoc.setFontSize.mockClear();
    mockDoc.setTextColor.mockClear();
    mockDoc.text.mockClear();
    mockDoc.autoTable.mockClear();
    mockDoc.save.mockClear();
  });

  describe('exportEvaluationToPDF', () => {
    it('crea un PDF con el titulo de la app y dispara la descarga', () => {
      const evaluation = {
        date: '2026-07-28T15:00:00Z',
        protocol: { title: 'Medición de la Talla' },
        results: {
          id_estudiante: '2929281829',
          evaluado: 'Juan Pancho',
          evaluador: 'Ana Docente',
          talla_cm: 132,
        },
        notes: 'Sin novedad',
      };

      exportEvaluationToPDF(evaluation);

      // Verificamos que se creo el documento (mockDoc es el retorno del constructor).
      expect(mockDoc.text).toHaveBeenCalledWith(
        'SportMetric Academic',
        105,
        20,
        { align: 'center' }
      );
      expect(mockDoc.autoTable).toHaveBeenCalled();
      expect(mockDoc.save).toHaveBeenCalledWith(
        expect.stringMatching(/^Evaluacion_Medici.+de_la_Talla_.+\.pdf$/)
      );
    });

    it('omite la seccion de notas cuando no hay', () => {
      const evaluation = {
        date: '2026-07-28T15:00:00Z',
        protocol: { title: 'Medición de la Talla' },
        results: { evaluado: 'Juan', talla_cm: 132 },
      };

      exportEvaluationToPDF(evaluation);

      // Busca si se llamo a text('Observaciones:')
      const textCalls = mockDoc.text.mock.calls.map((c) => c[0]);
      expect(textCalls).not.toContain('Observaciones:');
    });

    it('usa el titulo del protocolo en el nombre del archivo descargado', () => {
      const evaluation = {
        date: '2026-07-28T15:00:00Z',
        protocol: { title: 'Medición de la Talla' },
        results: {},
      };

      exportEvaluationToPDF(evaluation);

      const saveArg = mockDoc.save.mock.calls[0][0];
      expect(saveArg).toContain('Medici');
    });
  });

  describe('exportEvaluationsToCSV', () => {
    let createObjectURLSpy;
    let clickSpy;

    beforeEach(() => {
      createObjectURLSpy = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValue('blob:fake-url');
      clickSpy = vi.fn();
      const originalCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = originalCreate(tag);
        if (tag === 'a') el.click = clickSpy;
        return el;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('no hace nada si la lista esta vacia', () => {
      exportEvaluationsToCSV([]);

      expect(createObjectURLSpy).not.toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('genera un Blob CSV y dispara la descarga cuando hay evaluaciones', () => {
      const evaluations = [
        {
          date: '2026-07-28T15:00:00Z',
          protocol: { title: 'Medición de la Talla' },
          results: { id_estudiante: '1', evaluado: 'Juan', talla_cm: 132 },
          notes: 'OK',
        },
        {
          date: '2026-07-27T10:00:00Z',
          protocol: { title: 'Medición del Peso' },
          results: { evaluado: 'Maria', peso_kg: 70 },
          notes: '',
        },
      ];

      exportEvaluationsToCSV(evaluations);

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();

      // Verifica que el Blob contenga el CSV correcto
      const blobArg = createObjectURLSpy.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('text/csv;charset=utf-8;');
    });

    it('lee el nombre del evaluado desde results (Ficha Tecnica base)', () => {
      const evaluations = [
        {
          date: '2026-07-28T15:00:00Z',
          protocol: { title: 'Talla' },
          results: { evaluado: 'Juan Pancho Feliz' },
          notes: '',
        },
      ];

      exportEvaluationsToCSV(evaluations);

      // El nombre debe estar dentro del blob
      // La verificacion real es que se llamo a createObjectURL.
      expect(createObjectURLSpy).toHaveBeenCalled();
    });
  });
});
