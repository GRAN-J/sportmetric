// =============================================================================
// Cliente HTTP mínimo para consumir la API del backend
// =============================================================================
// Centraliza la URL base del backend y el manejo estándar de respuestas.
// =============================================================================

export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'local';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const isApiDataSource = () => DATA_SOURCE === 'api';

const parseApiPayload = async (response) => {
  const contentType = response.headers?.get?.('content-type') || '';

  if (!contentType || contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return null;
};

export const apiGet = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: options.signal,
  });

  const payload = await parseApiPayload(response);

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'No fue posible consultar la API.';
    throw new Error(message);
  }

  return payload?.data ?? payload;
};
