// =============================================================================
// Tests del cliente HTTP (XMLHttpRequest)
// =============================================================================
// Valida el cliente HTTP real mockeando únicamente la factoría de XHR
// (inyección de dependencias). Esto preserva la lógica de la promesa,
// el manejo de errores y la propagación del AbortSignal.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Implementación mockeada de XMLHttpRequest. Simula la API mínima que
// apiClient.js necesita: open, setRequestHeader, addEventListener, send,
// abort, onload, onerror, ontimeout, status, responseText, getResponseHeader.
class MockXHR {
  constructor() {
    this._method = null;
    this._url = null;
    this._headers = {};
    this._listeners = {};
    this._aborted = false;
    this.status = 0;
    this.responseText = '';
    this._responseHeaders = {};
    this.onload = null;
    this.onerror = null;
    this.ontimeout = null;
  }

  open(method, url) {
    this._method = method;
    this._url = url;
  }

  setRequestHeader(name, value) {
    this._headers[name] = value;
  }

  getResponseHeader(name) {
    const key = name.toLowerCase();
    return this._responseHeaders[key] ?? null;
  }

  addEventListener(event, handler) {
    this._listeners[event] = handler;
  }

  abort() {
    this._aborted = true;
  }

  send() {
    // Entrega la respuesta en el siguiente microtask para simular la
    // asincronía real de XHR sin depender de timers del entorno.
    Promise.resolve().then(() => this._deliver());
  }

  _deliver() {
    if (this._aborted) return;
    const next = pendingResponse.shift();
    if (!next) {
      throw new Error('MockXHR: no hay respuesta encolada para esta petición.');
    }
    this.status = next.status;
    this.responseText = next.body;
    this._responseHeaders = { 'content-type': next.contentType };
    if (typeof this.onload === 'function') this.onload();
  }
}

const pendingResponse = [];

const queueResponse = (response) => {
  pendingResponse.push({
    status: response.status ?? 200,
    body: response.body ?? '',
    contentType: response.contentType ?? 'application/json',
  });
};

// Mockea SOLO la factoría. El módulo apiClient sigue siendo el real y se
// ejecuta tal cual en producción; solo cambiamos el XHR que usa.
vi.mock('../../services/xhrFactory', () => ({
  createXHR: vi.fn(),
}));

import { createXHR } from '../../services/xhrFactory';
import { apiGet } from '../../services/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    pendingResponse.length = 0;
    createXHR.mockImplementation(() => new MockXHR());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('expone una URL base vacía por defecto (usa el proxy de Vite)', async () => {
    const mod = await import('../../services/apiClient');
    expect(mod.API_BASE_URL).toBe('');
  });

  it('resuelve con payload.data cuando la API responde con el wrapper estándar', async () => {
    queueResponse({
      status: 200,
      body: JSON.stringify({ data: { id: 'medicion-del-peso' } }),
    });

    const payload = await apiGet('/api/protocols/medicion-del-peso');

    expect(payload).toEqual({ id: 'medicion-del-peso' });
    expect(createXHR).toHaveBeenCalledTimes(1);
  });

  it('rechaza con el mensaje específico del backend cuando la respuesta falla', async () => {
    queueResponse({
      status: 401,
      body: JSON.stringify({ error: { message: 'No autorizado' } }),
    });

    await expect(apiGet('/api/private')).rejects.toThrow('No autorizado');
  });

  it('devuelve el payload completo cuando la respuesta no trae data', async () => {
    queueResponse({
      status: 200,
      body: JSON.stringify({ success: true, message: 'Sin wrapper data' }),
    });

    await expect(apiGet('/api/health')).resolves.toEqual({
      success: true,
      message: 'Sin wrapper data',
    });
  });

  it('rechaza con mensaje del estado HTTP si el backend falla sin detalle', async () => {
    queueResponse({ status: 500, body: '{}' });

    await expect(apiGet('/api/fail')).rejects.toThrow('Error HTTP 500');
  });

  it('rechaza con AbortError cuando la señal ya está cancelada', async () => {
    queueResponse({ status: 200, body: '{}' });

    const controller = new AbortController();
    controller.abort();

    await expect(apiGet('/api/categories', { signal: controller.signal })).rejects.toThrow(
      'Cancelado'
    );
  });

  it('tolera respuestas con JSON inválido y retorna null si la petición fue exitosa', async () => {
    queueResponse({ status: 200, body: 'no es json' });

    await expect(apiGet('/api/empty')).resolves.toBeNull();
  });
});
