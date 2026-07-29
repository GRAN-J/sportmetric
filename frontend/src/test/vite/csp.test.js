import { describe, it, expect, vi } from 'vitest';
import { buildCsp, cspPlugin } from '../../../vite/csp.js';

describe('buildCsp', () => {
  // ---------------------------------------------------------------------------
  // Defaults sin variables: la CSP debe ser segura y no romper el dev local.
  // ---------------------------------------------------------------------------
  it('genera una CSP con defaults sensatos cuando no hay variables', () => {
    const csp = buildCsp({});

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    // connect-src debe incluir localhost para que el dev con proxy funcione.
    expect(csp).toContain('http://localhost:3001');
    expect(csp).toContain('http://127.0.0.1:3001');
    expect(csp).toContain('ws://localhost:5173');
    // img-src por defecto solo self + data:.
    expect(csp).toMatch(/img-src 'self' data:/);
  });

  it('NO incluye URLs hardcodeadas por proveedor en la CSP por defecto', () => {
    const csp = buildCsp({});

    // Ninguna URL especifica de un proveedor en los defaults.
    expect(csp).not.toContain('vercel.app');
    expect(csp).not.toContain('onrender.com');
    expect(csp).not.toContain('netlify.app');
    expect(csp).not.toContain('railway.app');
  });

  // ---------------------------------------------------------------------------
  // Inyeccion del origin del backend a partir de VITE_API_BASE_URL.
  // ---------------------------------------------------------------------------
  it('inyecta el origin del backend en connect-src cuando VITE_API_BASE_URL es absoluta', () => {
    const csp = buildCsp({ VITE_API_BASE_URL: 'https://api.mi-dominio.com' });

    expect(csp).toContain('https://api.mi-dominio.com');
    // El path NO debe incluirse, solo el origin.
    expect(csp).not.toContain('https://api.mi-dominio.com/v1');
  });

  it('ignora VITE_API_BASE_URL invalida sin romper la generacion', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const csp = buildCsp({ VITE_API_BASE_URL: 'esto-no-es-una-url' });

    expect(warnSpy).toHaveBeenCalled();
    // La CSP se genera igual, solo no se agrega el origin.
    expect(csp).toContain("default-src 'self'");

    warnSpy.mockRestore();
  });

  it('omite el origin del backend cuando VITE_API_BASE_URL esta vacia', () => {
    const csp = buildCsp({ VITE_API_BASE_URL: '' });

    // connect-src sigue presente pero sin un origin de produccion.
    expect(csp).toMatch(/connect-src 'self'/);
  });

  // ---------------------------------------------------------------------------
  // Variables de extension: deben agregarse a las directivas correspondientes.
  // ---------------------------------------------------------------------------
  it('agrega origenes extra a connect-src desde VITE_CSP_EXTRA_CONNECT_SRC', () => {
    const csp = buildCsp({
      VITE_CSP_EXTRA_CONNECT_SRC: 'https://analytics.example.com, https://cdn.example.com',
    });

    expect(csp).toContain('https://analytics.example.com');
    expect(csp).toContain('https://cdn.example.com');
  });

  it('agrega origenes extra a img-src desde VITE_CSP_EXTRA_IMG_SRC', () => {
    const csp = buildCsp({
      VITE_CSP_EXTRA_IMG_SRC: 'https://images.example.com',
    });

    expect(csp).toContain('https://images.example.com');
  });

  it('agrega origenes extra a script-src desde VITE_CSP_EXTRA_SCRIPT_SRC', () => {
    const csp = buildCsp({
      VITE_CSP_EXTRA_SCRIPT_SRC: 'https://cdn.jsdelivr.net',
    });

    expect(csp).toContain('https://cdn.jsdelivr.net');
  });

  it('maneja correctamente valores con espacios y entradas vacias en las CSV', () => {
    const csp = buildCsp({
      VITE_CSP_EXTRA_CONNECT_SRC: ' https://a.com ,, https://b.com ,',
    });

    expect(csp).toContain('https://a.com');
    expect(csp).toContain('https://b.com');
    // No debe haber dobles espacios en connect-src.
    const connectSrc = csp.split(';').find((d) => d.trim().startsWith('connect-src'));
    expect(connectSrc).toBeDefined();
    expect(connectSrc).not.toMatch(/ {2}/);
  });
});

describe('cspPlugin', () => {
  it('reemplaza el placeholder __CSP__ en el HTML', () => {
    const plugin = cspPlugin();
    const handler = plugin.transformIndexHtml.handler;

    const html = '<meta http-equiv="Content-Security-Policy" content="__CSP__">';
    const result = handler(html);

    expect(result).not.toContain('__CSP__');
    expect(result).toContain("default-src 'self'");
  });

  it('no modifica el HTML cuando no hay placeholder', () => {
    const plugin = cspPlugin();
    const handler = plugin.transformIndexHtml.handler;

    const html = '<html><head><meta charset="utf-8"></head></html>';
    const result = handler(html);

    expect(result).toBe(html);
  });
});
