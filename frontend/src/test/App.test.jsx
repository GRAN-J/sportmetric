import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App', () => {
  it('redirige rutas desconocidas a la pantalla de bienvenida', async () => {
    render(
      <MemoryRouter initialEntries={['/ruta-inexistente']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Bienvenido a/i)).toBeInTheDocument();
  });
});
