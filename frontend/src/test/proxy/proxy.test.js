import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

/* global process */

// Importamos la logica del proxy reverso (serverless function de Vercel)
// desde la raiz del proyecto, donde Vercel lo deploya automaticamente.
import proxyModule from '../../../../api/proxy.js';

const { buildTarget, default: handler, config } = proxyModule;

describe('buildTarget (logica pura del proxy)', () => {
  it('construye la URL destino reemplazando /api por la URL del backend', () => {
    const incomingUrl = new URL('https://app.vercel.app/api/users?page=1');
    const result = buildTarget(incomingUrl, 'https://api.mi-dominio.com', []);

    expect(result.ok).toBe(true);
    expect(result.target).toBe('https://api.mi-dominio.com/users?page=1');
  });

  it('conserva la query string', () => {
    const incomingUrl = new URL('https://app.vercel.app/api/foo?a=1&b=2');
    const result = buildTarget(incomingUrl, 'https://api.com', []);

    expect(result.target).toBe('https://api.com/foo?a=1&b=2');
  });

  it('tolera que la URL del backend tenga slash final', () => {
    const incomingUrl = new URL('https://app.vercel.app/api/foo');
    const result = buildTarget(incomingUrl, 'https://api.com/', []);

    expect(result.target).toBe('https://api.com/foo');
  });

  it('asegura que el path empieza con / despues de quitar /api', () => {
    const incomingUrl = new URL('https://app.vercel.app/api');
    const result = buildTarget(incomingUrl, 'https://api.com', []);

    expect(result.ok).toBe(true);
    expect(result.target).toBe('https://api.com/');
  });

  it('rechaza cuando BACKEND_URL no esta configurada', () => {
    const incomingUrl = new URL('https://app.vercel.app/api/foo');
    const result = buildTarget(incomingUrl, '', []);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
  });

  it('bloquea paths que coinciden con la lista de PROXY_BLOCKED_PATHS', () => {
    const incomingUrl = new URL('https://app.vercel.app/api/admin/internal');
    const result = buildTarget(incomingUrl, 'https://api.com', ['/admin/internal']);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
  });

  it('bloquea sub-paths dentro de un path bloqueado', () => {
    const incomingUrl = new URL('https://app.vercel.app/api/admin/internal/users');
    const result = buildTarget(incomingUrl, 'https://api.com', ['/admin/internal']);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
  });

  it('permite paths que NO estan en la lista de bloqueados', () => {
    const incomingUrl = new URL('https://app.vercel.app/api/public');
    const result = buildTarget(incomingUrl, 'https://api.com', ['/admin/internal']);

    expect(result.ok).toBe(true);
    expect(result.target).toBe('https://api.com/public');
  });
});

describe('handler (integracion con fetch mockeado)', () => {
  const originalEnv = { ...process.env };
  let fetchSpy;

  beforeEach(() => {
    process.env.BACKEND_URL = 'https://api.mi-dominio.com';
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('configura el runtime edge', () => {
    expect(config.runtime).toBe('edge');
  });

  it('responde 204 a OPTIONS (preflight) sin reenviar al backend', async () => {
    const request = new Request('https://app.vercel.app/api/foo', { method: 'OPTIONS' });
    const response = await handler(request);

    expect(response.status).toBe(204);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reenvia un GET al backend con la URL transformada', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const request = new Request('https://app.vercel.app/api/users?page=1', { method: 'GET' });
    const response = await handler(request);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0];
    expect(calledUrl).toBe('https://api.mi-dominio.com/users?page=1');
    expect(calledInit.method).toBe('GET');
    const headers = calledInit.headers;
    expect(headers.get('X-Forwarded-By')).toBe('vercel-edge-proxy');

    expect(response.status).toBe(200);
  });

  it('reenvia el body en metodos que no son GET/HEAD', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ created: true }), { status: 201 })
    );

    const request = new Request('https://app.vercel.app/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ana' }),
    });

    const response = await handler(request);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, calledInit] = fetchSpy.mock.calls[0];
    expect(calledInit.method).toBe('POST');
    expect(calledInit.body).toBe(JSON.stringify({ name: 'Ana' }));
    expect(response.status).toBe(201);
  });

  it('reenvia headers personalizados del backend al cliente', async () => {
    fetchSpy.mockResolvedValue(
      new Response('hello', {
        status: 200,
        headers: { 'X-Custom-Header': 'valor', 'Content-Type': 'text/plain' },
      })
    );

    const request = new Request('https://app.vercel.app/api/foo', { method: 'GET' });
    const response = await handler(request);

    expect(response.headers.get('X-Custom-Header')).toBe('valor');
    expect(response.headers.get('Content-Type')).toBe('text/plain');
  });

  it('omite headers hop-by-hop (connection, transfer-encoding) en la respuesta', async () => {
    fetchSpy.mockResolvedValue(
      new Response('hello', {
        status: 200,
        headers: {
          Connection: 'close',
          'Transfer-Encoding': 'chunked',
          'Content-Type': 'text/plain',
        },
      })
    );

    const request = new Request('https://app.vercel.app/api/foo', { method: 'GET' });
    const response = await handler(request);

    expect(response.headers.get('Connection')).toBeNull();
    expect(response.headers.get('Transfer-Encoding')).toBeNull();
  });

  it('devuelve 502 cuando el backend no responde', async () => {
    fetchSpy.mockRejectedValue(new Error('connection refused'));

    const request = new Request('https://app.vercel.app/api/foo', { method: 'GET' });
    const response = await handler(request);

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe('Proxy error');
  });

  it('devuelve 500 cuando BACKEND_URL no esta configurada', async () => {
    delete process.env.BACKEND_URL;

    const request = new Request('https://app.vercel.app/api/foo', { method: 'GET' });
    const response = await handler(request);

    expect(response.status).toBe(500);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('bloquea paths prohibidos via PROXY_BLOCKED_PATHS', async () => {
    process.env.PROXY_BLOCKED_PATHS = '/admin/internal';

    const request = new Request('https://app.vercel.app/api/admin/internal', { method: 'GET' });
    const response = await handler(request);

    expect(response.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
