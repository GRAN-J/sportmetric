// =============================================================================
// Test de ProtocolDataRegistry (aislado)
// =============================================================================
// Solo renderiza el DynamicForm y verifica el flujo del esquema.
// =============================================================================

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

const { getFormSchema, saveEvaluation } = vi.hoisted(() => ({
  getFormSchema: vi.fn(),
  saveEvaluation: vi.fn(),
}));

vi.mock('../../../services/formService', () => ({
  getFormSchema,
  saveEvaluation,
}));

import ProtocolDataRegistry from '../../../pages/protocol/ProtocolDataRegistry';

const protocol = {
  id: 'medicion-del-peso',
  title: 'Medición del peso',
};

describe('ProtocolDataRegistry', () => {
  beforeEach(() => {
    getFormSchema.mockReset();
    saveEvaluation.mockReset();
  });

  it('carga el esquema del backend y muestra los campos base', async () => {
    getFormSchema.mockResolvedValue({
      isGeneric: true,
      fields: [
        { name: 'id_estudiante', label: 'ID del estudiante', type: 'text', required: true },
        { name: 'evaluado', label: 'Nombre del evaluado', type: 'text', required: true },
        { name: 'evaluador', label: 'Nombre del evaluador', type: 'text', required: true },
      ],
    });

    const { container } = render(<ProtocolDataRegistry protocol={protocol} />);

    await waitFor(() => {
      expect(getFormSchema).toHaveBeenCalled();
    });

    // Buscamos los inputs directamente por atributo `name` para evitar
    // ambigüedades con el texto del label (que incluye un asterisco).
    await waitFor(() => {
      expect(container.querySelector('input[name="id_estudiante"]')).not.toBeNull();
    });
    expect(container.querySelector('input[name="evaluado"]')).not.toBeNull();
    expect(container.querySelector('input[name="evaluador"]')).not.toBeNull();
  });

  it('envía los datos al backend al hacer submit', async () => {
    getFormSchema.mockResolvedValue({
      isGeneric: true,
      fields: [
        { name: 'id_estudiante', label: 'ID del estudiante', type: 'text', required: true },
        { name: 'evaluado', label: 'Nombre del evaluado', type: 'text', required: true },
        { name: 'evaluador', label: 'Nombre del evaluador', type: 'text', required: true },
      ],
    });
    saveEvaluation.mockResolvedValue({ id: 'eval-1' });

    const { container } = render(<ProtocolDataRegistry protocol={protocol} />);

    await waitFor(() => {
      expect(getFormSchema).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(container.querySelector('input[name="id_estudiante"]')).not.toBeNull();
    });

    fireEvent.change(container.querySelector('input[name="id_estudiante"]'), {
      target: { value: 'EST-2024-001' },
    });
    fireEvent.change(container.querySelector('input[name="evaluado"]'), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(container.querySelector('input[name="evaluador"]'), {
      target: { value: 'Ana Docente' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Evaluación/i }));

    await waitFor(() => {
      expect(saveEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({
          results: expect.objectContaining({
            id_estudiante: 'EST-2024-001',
            evaluado: 'Juan Pérez',
            evaluador: 'Ana Docente',
          }),
        })
      );
    });
  });

  it('muestra mensaje de error si el backend falla', async () => {
    getFormSchema.mockRejectedValue(new Error('No se pudo conectar'));

    render(<ProtocolDataRegistry protocol={protocol} />);

    expect(
      await screen.findByText(/no se pudo cargar la estructura del formulario/i)
    ).toBeInTheDocument();
  });
});
