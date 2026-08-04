// =============================================================================
// Tests de la pagina de recuperacion de contrasena (paso 1)
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/authService', () => ({
  forgotPassword: vi.fn(),
}));

import { forgotPassword } from '../../services/authService';
import ForgotPassword from '../../pages/ForgotPassword';

const renderForgot = () =>
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el titulo, la descripcion y el campo de email', () => {
    renderForgot();
    expect(screen.getByRole('heading', { name: /olvidaste tu contraseña/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electronico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar instrucciones/i })).toBeInTheDocument();
  });

  it('muestra un enlace para volver al inicio de sesion', () => {
    renderForgot();
    const back = screen.getByRole('link', { name: /volver al inicio de sesion/i });
    expect(back).toHaveAttribute('href', '/login');
  });

  it('envia el correo y muestra mensaje de exito generico', async () => {
    forgotPassword.mockResolvedValue({ message: 'ok' });

    renderForgot();
    fireEvent.change(screen.getByLabelText('Correo Electronico'), {
      target: { value: 'user@x.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('user@x.com');
    });

    await waitFor(() => {
      expect(
        screen.getByText(/si el correo esta registrado, recibiras las instrucciones/i)
      ).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error si la peticion falla', async () => {
    forgotPassword.mockRejectedValue(new Error('No se pudo conectar con el servidor'));

    renderForgot();
    fireEvent.change(screen.getByLabelText('Correo Electronico'), {
      target: { value: 'user@x.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar instrucciones/i }));

    await waitFor(() => {
      expect(screen.getByText('No se pudo conectar con el servidor')).toBeInTheDocument();
    });
  });
});
