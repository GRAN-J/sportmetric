import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Se define el mock en `vi.hoisted` para que esté disponible ANTES de que
// Vitest procese los `import` estáticos. Esto evita el race condition típico
// entre `vi.mock` y los imports.
const { getFormSchema, saveEvaluation } = vi.hoisted(() => ({
  getFormSchema: vi.fn(),
  saveEvaluation: vi.fn(),
}));

vi.mock('../../../services/formService', () => ({
  getFormSchema,
  saveEvaluation,
}));

import ProtocolObjective from '../../../pages/protocol/ProtocolObjective';
import ProtocolMaterials from '../../../pages/protocol/ProtocolMaterials';
import ProtocolDescription from '../../../pages/protocol/ProtocolDescription';
import ProtocolChecklist from '../../../pages/protocol/ProtocolChecklist';
import ProtocolSteps from '../../../pages/protocol/ProtocolSteps';
import ProtocolInterruption from '../../../pages/protocol/ProtocolInterruption';
import ProtocolDataRegistry from '../../../pages/protocol/ProtocolDataRegistry';
import { protocolDetailFixture } from '../../fixtures';

describe('protocol sections', () => {
  it('renderiza el objetivo y la descripción del protocolo', () => {
    render(
      <>
        <ProtocolObjective protocol={protocolDetailFixture} />
        <ProtocolDescription protocol={protocolDetailFixture} />
      </>
    );

    expect(screen.getByText('Objetivo del Protocolo')).toBeInTheDocument();
    expect(screen.getByText(protocolDetailFixture.objective)).toBeInTheDocument();
    expect(screen.getByText('Descripción General')).toBeInTheDocument();
    expect(screen.getByText(protocolDetailFixture.description)).toBeInTheDocument();
  });

  it('renderiza materiales y reemplaza imágenes rotas por placeholders', () => {
    render(<ProtocolMaterials protocol={protocolDetailFixture} />);

    const image = screen.getByAltText('Báscula SECA');
    fireEvent.error(image);

    expect(image.getAttribute('src')).toContain('data:image/svg+xml');
  });

  it('permite marcar ítems del checklist', () => {
    render(<ProtocolChecklist protocol={protocolDetailFixture} />);

    fireEvent.click(screen.getByText('Verificar calibración'));

    expect(screen.getByText('Verificar calibración')).toHaveClass('line-through');
  });

  it('permite navegar pasos y mostrar el estado de error del video', async () => {
    render(<ProtocolSteps protocol={protocolDetailFixture} />);

    const video = document.querySelector('video');
    expect(video).not.toBeNull();

    fireEvent.error(video);

    expect(screen.getByText(/El video de este paso aun no esta disponible/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir al siguiente paso' }));

    expect(await screen.findByText('Registrar la medición.')).toBeInTheDocument();
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
  });

  it('renderiza criterios de interrupción y muestra el DynamicForm con los campos base', async () => {
    // El backend siempre devuelve los 3 campos base + personalizados.
    getFormSchema.mockResolvedValue({
      isGeneric: true,
      fields: [
        { name: 'id_estudiante', label: 'ID del estudiante', type: 'text', required: true },
        { name: 'evaluado', label: 'Nombre del evaluado', type: 'text', required: true },
        { name: 'evaluador', label: 'Nombre del evaluador', type: 'text', required: true },
      ],
    });
    saveEvaluation.mockResolvedValue({ id: 'eval-1' });

    const { container } = render(
      <>
        <ProtocolInterruption protocol={protocolDetailFixture} />
        <ProtocolDataRegistry protocol={protocolDetailFixture} />
      </>
    );

    expect(screen.getByText('Suspender si el estudiante presenta mareo.')).toBeInTheDocument();

    await waitFor(() => {
      expect(getFormSchema).toHaveBeenCalled();
    });

    // Buscamos los inputs por atributo `name` para evitar ambigüedades.
    await waitFor(() => {
      expect(container.querySelector('input[name="id_estudiante"]')).not.toBeNull();
    });
    expect(container.querySelector('input[name="evaluado"]')).not.toBeNull();
    expect(container.querySelector('input[name="evaluador"]')).not.toBeNull();
    expect(screen.getByText(/formulario base/i)).toBeInTheDocument();

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
});
