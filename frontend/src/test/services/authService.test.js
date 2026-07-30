// =============================================================================
// Tests del servicio de Autenticacion (Frontend)
// =============================================================================
// Verifica login, logout, refresh, persistencia del usuario y la inclusion
// del Bearer token en las cabeceras.
// =============================================================================

import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../services/apiClient', () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  setTokenGetter: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
  onUnauthorized: null,
}));

import { apiPost } from '../../services/apiClient';

// Importamos el modulo bajo prueba DESPUES de los mocks
const authService = await import('../../services/authService');

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('retorna null si no hay usuario persistido', () => {
      expect(authService.getUser()).toBeNull();
    });

    it('retorna el usuario persistido en localStorage', () => {
      const user = { id: 'u-1', email: 'a@x.com', role: 'ADMIN' };
      localStorage.setItem('sportmetric_user', JSON.stringify(user));

      expect(authService.getUser()).toEqual(user);
    });
  });

  describe('isAuthenticated', () => {
    it('retorna false sin usuario y sin token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('envia credenciales al endpoint /api/auth/login', async () => {
      apiPost.mockResolvedValue({
        accessToken: 'access-1',
        user: { id: 'u-1', email: 'a@x.com', role: 'ADMIN' },
      });

      await authService.login('a@x.com', 'secret');

      expect(apiPost).toHaveBeenCalledWith('/api/auth/login', {
        email: 'a@x.com',
        password: 'secret',
      });
    });

    it('persiste el usuario y deja el token en memoria', async () => {
      apiPost.mockResolvedValue({
        accessToken: 'access-1',
        user: { id: 'u-1', email: 'a@x.com', role: 'ADMIN' },
      });

      const user = await authService.login('a@x.com', 'secret');

      expect(user).toEqual({ id: 'u-1', email: 'a@x.com', role: 'ADMIN' });
      expect(JSON.parse(localStorage.getItem('sportmetric_user'))).toEqual(user);
      expect(authService.getAccessToken()).toBe('access-1');
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('intenta cerrar sesion en el servidor y limpia el estado local', async () => {
      apiPost.mockResolvedValue();
      localStorage.setItem(
        'sportmetric_user',
        JSON.stringify({ id: 'u-1', role: 'ADMIN' })
      );

      // Spy de window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      await authService.logout();

      expect(apiPost).toHaveBeenCalledWith('/api/auth/logout');
      expect(localStorage.getItem('sportmetric_user')).toBeNull();
      expect(authService.getAccessToken()).toBeNull();

      window.location = originalLocation;
    });

    it('limpia la sesion local incluso si el servidor falla', async () => {
      apiPost.mockRejectedValue(new Error('server down'));
      localStorage.setItem(
        'sportmetric_user',
        JSON.stringify({ id: 'u-1', role: 'ADMIN' })
      );

      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await authService.logout();

      expect(localStorage.getItem('sportmetric_user')).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      window.location = originalLocation;
    });
  });

  describe('checkAuthStatus', () => {
    it('NO llama al backend si no hay usuario persistido (check optimista)', async () => {
      // OPTIMIZACION: si no hay sesion local, no se gasta una request en
      // el endpoint /api/auth/refresh. Esto evita la demora del
      // "Verificando sesion..." para visitantes que recien llegan.
      const result = await authService.checkAuthStatus();

      expect(apiPost).not.toHaveBeenCalled();
      expect(result).toBe(false);
      expect(authService.getAccessToken()).toBeNull();
    });

    it('renueva el access token al llamar al endpoint /api/auth/refresh', async () => {
      // Solo se renueva si hay un usuario persistido (sesion previa).
      localStorage.setItem(
        'sportmetric_user',
        JSON.stringify({ id: 'u-1', email: 'a@x.com', role: 'ADMIN' })
      );
      apiPost.mockResolvedValue({ accessToken: 'new-access' });

      const result = await authService.checkAuthStatus();

      expect(apiPost).toHaveBeenCalledWith('/api/auth/refresh');
      expect(result).toBe(true);
      expect(authService.getAccessToken()).toBe('new-access');
    });

    it('retorna false y limpia el token si el refresh falla', async () => {
      localStorage.setItem(
        'sportmetric_user',
        JSON.stringify({ id: 'u-1', email: 'a@x.com', role: 'ADMIN' })
      );
      apiPost.mockRejectedValue(new Error('expired'));

      const result = await authService.checkAuthStatus();

      expect(apiPost).toHaveBeenCalledWith('/api/auth/refresh');
      expect(result).toBe(false);
      expect(authService.getAccessToken()).toBeNull();
      expect(localStorage.getItem('sportmetric_user')).toBeNull();
    });
  });
});
