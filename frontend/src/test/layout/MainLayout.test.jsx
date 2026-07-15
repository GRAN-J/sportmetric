import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';

describe('MainLayout', () => {
  it('renderiza encabezado, navegación inferior y contenido anidado', async () => {
    render(
      <MemoryRouter initialEntries={['/categories']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/categories" element={<div>Contenido principal</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByAltText('Logo principal de SportMetric Academic')).toBeInTheDocument();
    expect(screen.getByText('Contenido principal')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Categorías/i })).toHaveLength(2);
  });

  it('oculta la navegación inferior en detalle de protocolo', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/protocol/medicion-del-peso/objective']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/protocol/:protocolId/:section" element={<div>Detalle</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Detalle')).toBeInTheDocument();
    expect(container.querySelector('nav.fixed')).toHaveClass('translate-y-full');
  });
});
