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
 * Intenta renovar el access token al arrancar la app.
 *
 * OPTIMIZACION: si NO hay un usuario persistido en localStorage, no se hace
 * ninguna request al backend (no hay sesion que renovar). Esto evita la
 * demora del "Verificando sesion..." para visitantes que recien llegan
 * o usuarios que recargan la pagina de Welcome / Login.
 *
 * Si la renovacion falla, se limpia la sesion local y se devuelve false
 * (las rutas protegidas redirigen al login).
 */
export const checkAuthStatus = async () => {
  if (!getUser()) {
    accessToken = null;
    return false;
  }

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

/**
 * Solicita el envio de instrucciones de recuperacion al correo indicado.
 * Por seguridad, la API siempre responde 200 sin revelar si el correo
 * existe. La UI muestra el mismo mensaje de exito en ambos casos.
 */
export const forgotPassword = async (email) => {
  return apiPost('/api/auth/forgot-password', { email });
};

/**
 * Restablece la contrasena usando el token recibido por correo.
 * El token se valida en el backend junto con la nueva contrasena.
 */
export const resetPassword = async (token, newPassword) => {
  return apiPost('/api/auth/reset-password', { token, newPassword });
};
