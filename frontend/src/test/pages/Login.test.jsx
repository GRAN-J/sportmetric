// =============================================================================
// Tests de la pagina de Login
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
}));

import { login } from '../../services/authService';
import Login from '../../pages/Login';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza titulo y campos de email y password', () => {
    renderLogin();
    expect(screen.getByText('SportMetric Academic')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra el enlace para recuperar contrasena', () => {
    renderLogin();
    const link = screen.getByRole('link', { name: /olvidaste tu contraseña/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/forgot-password');
  });

  it('muestra mensaje de error cuando el login falla', async () => {
    login.mockRejectedValue(new Error('Credenciales inválidas'));

    renderLogin();
    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'wrong@x.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'bad' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  it('usa el mensaje por defecto si el error no tiene mensaje', async () => {
    login.mockRejectedValue({});

    renderLogin();
    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'wrong@x.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'bad' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/verifica tus credenciales/i)
      ).toBeInTheDocument();
    });
  });

  it('llama al servicio de login con email y password', async () => {
    login.mockResolvedValue();

    renderLogin();
    fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
      target: { value: 'admin@x.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'secret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('admin@x.com', 'secret');
    });
  });
});
