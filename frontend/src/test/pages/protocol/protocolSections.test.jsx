import { fireEvent, render, screen } from '@testing-library/react';
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

  it('renderiza criterios de interrupción y calcula el promedio del registro', () => {
    render(
      <>
        <ProtocolInterruption protocol={protocolDetailFixture} />
        <ProtocolDataRegistry protocol={protocolDetailFixture} />
      </>
    );

    expect(screen.getByText('Suspender si el estudiante presenta mareo.')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Ej: Juan Pérez'), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nombre del docente o técnico'), {
      target: { value: 'Ana Docente' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('0.00')[0], {
      target: { value: '10' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('0.00')[1], {
      target: { value: '12' },
    });

    expect(screen.getByText('11.00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Guardar Datos Localmente/i }));

    expect(screen.getByText('Registro Guardado')).toBeInTheDocument();
  });
});
