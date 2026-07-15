import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Welcome from '../../pages/Welcome';

describe('Welcome', () => {
  it('muestra la pantalla inicial y permite navegar a categorías', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/categories" element={<div>Categorías cargadas</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Bienvenido a/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Comenzar/i }));

    expect(await screen.findByText('Categorías cargadas')).toBeInTheDocument();
  });

  it('permite navegar a la lista global de protocolos', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/category/all" element={<div>Protocolos globales</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Ver Protocolos/i }));

    expect(await screen.findByText('Protocolos globales')).toBeInTheDocument();
  });
});
