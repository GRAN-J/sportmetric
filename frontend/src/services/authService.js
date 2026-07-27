// =============================================================================
// Servicio de Autenticación (Frontend)
// =============================================================================
// Gestiona el estado de la sesión, login, logout y persistencia del usuario.
// =============================================================================

import { apiPost, setTokenGetter } from './apiClient';

const USER_KEY = 'sportmetric_user';
let accessToken = null;

// Registramos el getter en el cliente API para que use el token en las cabeceras
setTokenGetter(() => accessToken);

/**
 * Obtiene el token de acceso actual (en memoria)
 */
export const getAccessToken = () => accessToken;

/**
 * Obtiene la información del usuario persistida
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Verifica si hay una sesión activa
 */
export const isAuthenticated = () => !!getUser() && !!accessToken;

/**
 * Inicia sesión en el sistema
 */
export const login = async (email, password) => {
  const data = await apiPost('/api/auth/login', { email, password });
  
  // El backend devuelve { user, accessToken }
  // El refresh token se maneja automáticamente vía cookies (httpOnly)
  accessToken = data.accessToken;
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  
  return data.user;
};

/**
 * Cierra la sesión
 */
export const logout = async () => {
  try {
    await apiPost('/api/auth/logout');
  } catch (error) {
    console.error('Error al cerrar sesión en el servidor:', error);
  } finally {
    accessToken = null;
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  }
};

/**
 * Intenta renovar el access token al arrancar la app
 */
export const checkAuthStatus = async () => {
  try {
    const data = await apiPost('/api/auth/refresh');
    accessToken = data.accessToken;
    return true;
  } catch (_error) {
    accessToken = null;
    localStorage.removeItem(USER_KEY);
    return false;
  }
};
