// =============================================================================
// Tests de la pagina de restablecimiento de contrasena (paso 2)
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../services/authService', () => ({
  resetPassword: vi.fn(),
}));

import { resetPassword } from '../../services/authService';
import ResetPassword from '../../pages/ResetPassword';

const renderReset = (initialPath = '/reset-password?token=valid-token') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<div>Pagina de login</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el titulo y los campos de contrasena cuando hay token', () => {
    renderReset();
    expect(screen.getByRole('heading', { name: /restablecer contraseña/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /restablecer contraseña/i })
    ).toBeInTheDocument();
  });

  it('muestra un mensaje claro cuando falta el token en la URL', () => {
    renderReset('/reset-password');
    expect(
      screen.getByText(/el enlace de recuperacion no es valido o ha expirado/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /restablecer contraseña/i })
    ).toBeDisabled();
  });

  it('valida que la contrasena tenga al menos 8 caracteres', async () => {
    resetPassword.mockResolvedValue({ message: 'ok' });

    renderReset();
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /restablecer contraseña/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/al menos 8 caracteres/i);
    });
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('valida que las contrasenas coincidan', async () => {
    resetPassword.mockResolvedValue({ message: 'ok' });

    renderReset();
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'password1' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'password2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /restablecer contraseña/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/las contraseñas no coinciden/i);
    });
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('envia la nueva contrasena al servicio cuando la validacion pasa', async () => {
    resetPassword.mockResolvedValue({ message: 'ok' });

    renderReset();
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /restablecer contraseña/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith('valid-token', 'newPassword123');
    });

    await waitFor(() => {
      expect(
        screen.getByText(/tu contraseña fue restablecida correctamente/i)
      ).toBeInTheDocument();
    });
  });

  it('muestra el error del backend cuando el token es invalido', async () => {
    resetPassword.mockRejectedValue(new Error('Token de recuperación inválido o expirado'));

    renderReset();
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /restablecer contraseña/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Token de recuperación inválido o expirado'
      );
    });
  });
});
