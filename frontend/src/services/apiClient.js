// =============================================================================
// Cliente HTTP mínimo para consumir la API del backend
// =============================================================================
// Centraliza la URL base del backend y el manejo estándar de respuestas.
// =============================================================================

export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'local';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const isApiDataSource = () => DATA_SOURCE === 'api';

export const apiGet = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'No fue posible consultar la API.';
    throw new Error(message);
  }

  return payload?.data ?? payload;
};
