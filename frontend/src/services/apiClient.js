// =============================================================================
// Cliente HTTP para consumir la API del backend
// =============================================================================
// Centraliza URL, autenticación, manejo de errores y compatibilidad con
// extensiones de Chrome que rompen `fetch` (ej. Grammarly).
// Implementación con XMLHttpRequest para máxima compatibilidad.
// =============================================================================

import { createXHR } from './xhrFactory';

export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'local';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export const isApiDataSource = () => DATA_SOURCE === 'api';

let tokenGetter = () => null;

export const setTokenGetter = (fn) => {
  tokenGetter = fn;
};

/**
 * Realiza una petición HTTP genérica usando XMLHttpRequest.
 * @param {string} method Método HTTP (GET, POST, PATCH, DELETE).
 * @param {string} path Ruta del endpoint (ej. '/api/users').
 * @param {object} body Cuerpo a enviar (opcional).
 * @param {object} options Opciones adicionales (headers, signal).
 * @returns {Promise<any>} Datos parseados (response.data).
 */
const apiRequest = (method, path, body = null, options = {}) => {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      return reject(new DOMException('Cancelado', 'AbortError'));
    }

    const xhr = createXHR();
    xhr.open(method, `${API_BASE_URL}${path}`, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', 'application/json');

    const token = tokenGetter();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, String(value));
      });
    }

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new DOMException('Cancelado', 'AbortError'));
      });
    }

    xhr.onload = () => {
      const contentType = xhr.getResponseHeader('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson && xhr.responseText ? safeJsonParse(xhr.responseText) : null;

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload?.data ?? payload);
      } else {
        const message = payload?.error?.message || payload?.message || `Error HTTP ${xhr.status}`;
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new TypeError('Failed to fetch'));
    xhr.ontimeout = () => reject(new TypeError('Timeout'));
    xhr.send(body ? JSON.stringify(body) : null);
  });
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const apiGet = (path, options = {}) => apiRequest('GET', path, null, options);
export const apiPost = (path, body, options = {}) => apiRequest('POST', path, body, options);
export const apiPatch = (path, body, options = {}) => apiRequest('PATCH', path, body, options);
export const apiDelete = (path, options = {}) => apiRequest('DELETE', path, null, options);
