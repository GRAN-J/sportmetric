// =============================================================================
// Tests de la pagina EvaluationHistory
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../services/formService', () => ({
  getStudentHistory: vi.fn(),
}));

vi.mock('../../shared/utils/exportUtils', () => ({
  exportEvaluationToPDF: vi.fn(),
  exportEvaluationsToCSV: vi.fn(),
}));

import { getStudentHistory } from '../../services/formService';
import EvaluationHistory from '../../pages/EvaluationHistory';

const renderHistory = (studentId = 'student-123') =>
  render(
    <MemoryRouter initialEntries={[`/history/${studentId}`]}>
      <Routes>
        <Route path="/history/:studentId" element={<EvaluationHistory />} />
      </Routes>
    </MemoryRouter>
  );

describe('EvaluationHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el titulo y el boton de exportar', async () => {
    getStudentHistory.mockResolvedValue([]);

    renderHistory();

    await waitFor(() => {
      expect(screen.getByText('Historial de Evaluaciones')).toBeInTheDocument();
    });
    expect(screen.getByText(/exportar excel/i)).toBeInTheDocument();
  });

  it('carga el historial del estudiante segun el parametro de la URL', async () => {
    getStudentHistory.mockResolvedValue([]);

    renderHistory('2929281829');

    await waitFor(() => {
      expect(getStudentHistory).toHaveBeenCalledWith('2929281829');
    });
  });

  it('muestra mensaje vacio cuando no hay evaluaciones', async () => {
    getStudentHistory.mockResolvedValue([]);

    renderHistory();

    await waitFor(() => {
      expect(
        screen.getByText(/no se encontraron evaluaciones/i)
      ).toBeInTheDocument();
    });
  });

  it('muestra las evaluaciones en la tabla cuando las hay', async () => {
    getStudentHistory.mockResolvedValue([
      {
        id: '1',
        protocolId: 'medicion-de-la-talla',
        date: '2026-07-28T15:00:00Z',
        protocol: { title: 'Medición de la Talla' },
        results: { id_estudiante: '1', evaluado: 'Juan', talla_cm: 132 },
      },
    ]);

    renderHistory();

    await waitFor(() => {
      // El protocolo aparece tambien en el <select> de filtro, asi que usamos getAllByText
      expect(screen.getAllByText('Medición de la Talla').length).toBeGreaterThan(0);
    });
  });
});
