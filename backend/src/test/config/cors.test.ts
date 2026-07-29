import { describe, it, expect, beforeEach, vi } from 'vitest';

// -----------------------------------------------------------------------------
// Mock del módulo de env ANTES de importar cors.
// vi.hoisted ejecuta la fábrica antes que los `import`, lo cual es necesario
// porque parseOriginRules() lee env.ALLOWED_ORIGINS al cargar el módulo.
// -----------------------------------------------------------------------------
const { mockEnv } = vi.hoisted(() => ({
  mockEnv: { ALLOWED_ORIGINS: undefined as string | undefined, FRONTEND_URL: 'http://localhost:5173' },
}));

vi.mock('../../config/env', () => ({
  env: mockEnv,
}));

// Importamos después del mock.
const { corsConfig } = await import('../../config/cors');

const resolveOrigin = (origin?: string) =>
  new Promise<{ error: Error | null; allowed: unknown }>((resolve) => {
    const originHandler = corsConfig.origin as (
      origin: string | undefined,
      callback: (error: Error | null, allowed?: unknown) => void
    ) => void;

    originHandler(origin, (error, allowed) => resolve({ error, allowed }));
  });

describe('corsConfig', () => {
  beforeEach(() => {
    // Reiniciamos el mock para que cada test configure sus reglas.
    mockEnv.ALLOWED_ORIGINS = undefined;
    mockEnv.FRONTEND_URL = 'http://localhost:5173';
  });

  // ---------------------------------------------------------------------------
  // Casos base (sin origin y origen exacto por defecto).
  // ---------------------------------------------------------------------------
  it('permite solicitudes sin cabecera origin', async () => {
    const result = await resolveOrigin(undefined);

    expect(result.error).toBeNull();
    expect(result.allowed).toBe(true);
  });

  it('permite los orígenes configurados en el entorno (exacto)', async () => {
    mockEnv.ALLOWED_ORIGINS = 'https://app.ejemplo.com';
    const result = await resolveOrigin('https://app.ejemplo.com');

    expect(result.error).toBeNull();
    expect(result.allowed).toBe(true);
  });

  it('usa FRONTEND_URL como fallback cuando no hay ALLOWED_ORIGINS', async () => {
    mockEnv.ALLOWED_ORIGINS = undefined;
    mockEnv.FRONTEND_URL = 'http://localhost:5173';

    const result = await resolveOrigin('http://localhost:5173');

    expect(result.error).toBeNull();
    expect(result.allowed).toBe(true);
  });

  it('bloquea orígenes no autorizados', async () => {
    mockEnv.ALLOWED_ORIGINS = 'https://app.ejemplo.com';

    const result = await resolveOrigin('https://origen-no-autorizado.test');

    expect(result.allowed).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });

  // ---------------------------------------------------------------------------
  // Casos con wildcard de subdominio (*.vercel.app).
  // ---------------------------------------------------------------------------
  it('permite cualquier subdominio cuando se declara un wildcard *.vercel.app', async () => {
    mockEnv.ALLOWED_ORIGINS = 'https://sportmetric.vercel.app,*.vercel.app';

    const r1 = await resolveOrigin('https://sportmetric-git-main-gran-js-projects.vercel.app');
    const r2 = await resolveOrigin('https://otro-proyecto.vercel.app');

    expect(r1.error).toBeNull();
    expect(r1.allowed).toBe(true);
    expect(r2.error).toBeNull();
    expect(r2.allowed).toBe(true);
  });

  it('NO permite dominios que solo terminan igual pero sin punto antes del sufijo', async () => {
    // "malicious-vercel.app" termina con "vercel.app" pero NO con ".vercel.app".
    mockEnv.ALLOWED_ORIGINS = '*.vercel.app';

    const result = await resolveOrigin('https://malicious-vercel.app');

    expect(result.allowed).toBeUndefined();
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });

  it('NO permite dominios que usan el sufijo como sub-string del TLD superior', async () => {
    // "sportmetric.vercel.app.evil.com" no debe pasar el filtro de wildcard.
    mockEnv.ALLOWED_ORIGINS = '*.vercel.app';

    const result = await resolveOrigin('https://sportmetric.vercel.app.evil.com');

    expect(result.allowed).toBeUndefined();
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });

  it('NO permite el apex domain sin subdominio', async () => {
    // "https://vercel.app" no debe pasar *.vercel.app porque NO tiene subdominio.
    mockEnv.ALLOWED_ORIGINS = '*.vercel.app';

    const result = await resolveOrigin('https://vercel.app');

    expect(result.allowed).toBeUndefined();
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });

  // ---------------------------------------------------------------------------
  // Wildcard total (solo para dev).
  // ---------------------------------------------------------------------------
  it('permite cualquier origen cuando se usa "*"', async () => {
    mockEnv.ALLOWED_ORIGINS = '*';

    const result = await resolveOrigin('https://cualquier-cosa.test');

    expect(result.error).toBeNull();
    expect(result.allowed).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Mezcla de reglas.
  // ---------------------------------------------------------------------------
  it('soporta combinar orígenes exactos y wildcards en la misma lista', async () => {
    mockEnv.ALLOWED_ORIGINS = 'http://localhost:5173,*.vercel.app,https://staging.ejemplo.com';

    const a = await resolveOrigin('http://localhost:5173');
    const b = await resolveOrigin('https://sportmetric-git-dev-gran-js-projects.vercel.app');
    const c = await resolveOrigin('https://staging.ejemplo.com');
    const d = await resolveOrigin('https://bloqueado.test');

    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(c.allowed).toBe(true);
    expect(d.allowed).toBeUndefined();
    expect(d.error?.message).toContain('Origen no permitido por CORS');
  });
});
