import { describe, it, expect, beforeEach, vi } from 'vitest';

// Importamos el sujeto bajo prueba. vi.mock de '../../config/env' se eleva
// antes de resolver este import, por lo que corsConfig leera el env mockeado.
import { corsConfig } from '../../config/cors';

// -----------------------------------------------------------------------------
// Mock del modulo de env ANTES de importar cors.
// vi.hoisted ejecuta la fabrica antes que los `import`, lo cual es necesario
// porque getOriginRules() lee env.ALLOWED_ORIGINS al resolver cada request.
// -----------------------------------------------------------------------------
const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {
    ALLOWED_ORIGINS: undefined as string | undefined,
    FRONTEND_URL: 'http://localhost:5173',
    NODE_ENV: 'development' as 'development' | 'production' | 'test',
  },
}));

vi.mock('../../config/env', () => ({
  env: mockEnv,
}));

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
    mockEnv.ALLOWED_ORIGINS = undefined;
    mockEnv.FRONTEND_URL = 'http://localhost:5173';
    mockEnv.NODE_ENV = 'development';
  });

  // ---------------------------------------------------------------------------
  // Casos base.
  // ---------------------------------------------------------------------------
  it('permite solicitudes sin cabecera origin', async () => {
    const result = await resolveOrigin(undefined);

    expect(result.error).toBeNull();
    expect(result.allowed).toBe(true);
  });

  it('permite los origenes exactos configurados en el entorno', async () => {
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

  it('bloquea origenes no autorizados', async () => {
    mockEnv.ALLOWED_ORIGINS = 'https://app.ejemplo.com';

    const result = await resolveOrigin('https://origen-no-autorizado.test');

    expect(result.allowed).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });

  // ---------------------------------------------------------------------------
  // Wildcard con prefijo (forma SEGURA recomendada para Vercel):
  //   "sportmetric-*.vercel.app" -> solo subdominios que EMPIECEN por
  //   "sportmetric-" y TERMINEN en ".vercel.app".
  // ---------------------------------------------------------------------------
  it('permite previews del proyecto con wildcard con prefijo', async () => {
    mockEnv.ALLOWED_ORIGINS = 'https://sportmetric.vercel.app,sportmetric-*.vercel.app';

    const main = await resolveOrigin('https://sportmetric-git-main-gran-js-projects.vercel.app');
    const dev = await resolveOrigin('https://sportmetric-git-dev-gran-js-projects.vercel.app');

    expect(main.allowed).toBe(true);
    expect(dev.allowed).toBe(true);
  });

  it('BLOQUEA otros proyectos de Vercel y otros dominios con patron con prefijo', async () => {
    // Caso de seguridad CRITICO: con prefijo "sportmetric-", OTROS proyectos
    // de Vercel (incluso los de otros usuarios) NO deben poder acceder.
    mockEnv.ALLOWED_ORIGINS = 'https://sportmetric.vercel.app,sportmetric-*.vercel.app';

    const otroVercel = await resolveOrigin('https://attacker-app.vercel.app');
    const otroTld = await resolveOrigin('https://sportmetric.attacker.com');
    const dominioAjeno = await resolveOrigin('https://attacker.com');

    expect(otroVercel.allowed).toBeUndefined();
    expect(otroVercel.error?.message).toContain('Origen no permitido por CORS');
    expect(otroTld.allowed).toBeUndefined();
    expect(dominioAjeno.allowed).toBeUndefined();
  });

  it('BLOQUEA dominios que usan el prefijo como sub-string fuera del TLD', async () => {
    // "sportmetric-anything.evil.com" no debe pasar porque el sufijo
    // forzado es ".vercel.app", no ".evil.com".
    mockEnv.ALLOWED_ORIGINS = 'sportmetric-*.vercel.app';

    const result = await resolveOrigin('https://sportmetric-foo.evil.com');

    expect(result.allowed).toBeUndefined();
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });

  it('BLOQUEA el apex domain sin subdominio aunque el patron tenga "*"', async () => {
    // "https://vercel.app" NO debe pasar "sportmetric-*.vercel.app" porque
    // el hostname no empieza por "sportmetric-".
    mockEnv.ALLOWED_ORIGINS = 'sportmetric-*.vercel.app';

    const result = await resolveOrigin('https://vercel.app');

    expect(result.allowed).toBeUndefined();
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });

  // ---------------------------------------------------------------------------
  // Wildcard SIN prefijo (forma PELIGROSA): documentamos el riesgo.
  // ---------------------------------------------------------------------------
  it('ADVERTENCIA: "*.vercel.app" permite CUALQUIER subdominio de vercel.app', async () => {
    // Esto es el riesgo que el patron con prefijo soluciona. Lo dejamos
    // documentado para que cualquier cambio futuro que rompa este test
    // sea evidente.
    mockEnv.ALLOWED_ORIGINS = '*.vercel.app';

    const ok = await resolveOrigin('https://sportmetric.vercel.app');
    const evil = await resolveOrigin('https://otro-proyecto-de-atacante.vercel.app');

    expect(ok.allowed).toBe(true);
    // NOTA: la regla *.vercel.app SI permite este origin. Si se quiere
    // bloquear, hay que usar la variante con prefijo: "sportmetric-*.vercel.app".
    expect(evil.allowed).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Validacion de entradas malformadas.
  // ---------------------------------------------------------------------------
  it('ignora entradas invalidas y sigue aplicando las validas', async () => {
    // "sportmetric-*vercel.app" -> invalido: el sufijo no empieza con "."
    // "https://app.valido.com"  -> valido: origen exacto
    mockEnv.ALLOWED_ORIGINS = 'sportmetric-*vercel.app,https://app.valido.com';

    const valido = await resolveOrigin('https://app.valido.com');
    // Esta URL habria matcheado con la entrada invalida SI hubiera sido valida.
    // Como la descartamos, NO debe estar permitida.
    const noMatch = await resolveOrigin('https://sportmetric-foo.vercel.app');

    expect(valido.allowed).toBe(true);
    expect(noMatch.allowed).toBeUndefined();
    expect(noMatch.error?.message).toContain('Origen no permitido por CORS');
  });

  it('rechaza entradas con multiples asteriscos', async () => {
    // "a.*.b.*.c" tiene dos asteriscos, es ambiguo y se descarta.
    mockEnv.ALLOWED_ORIGINS = 'a.*.b.*.c,https://app.valido.com';

    const ambiguo = await resolveOrigin('https://a.x.b.y.c');
    const exacto = await resolveOrigin('https://app.valido.com');

    expect(ambiguo.allowed).toBeUndefined();
    expect(exacto.allowed).toBe(true);
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
  // Politica de produccion: sin ALLOWED_ORIGINS, no se permite NINGUN
  // origen cross-origin. Esto es la postura segura cuando el frontend
  // habla same-origin via proxy reverso (ver api/proxy.js).
  // ---------------------------------------------------------------------------
  it('produccion sin ALLOWED_ORIGINS bloquea cualquier origen cross-origin', async () => {
    mockEnv.NODE_ENV = 'production';
    mockEnv.ALLOWED_ORIGINS = undefined;

    const vercel = await resolveOrigin('https://sportmetric.vercel.app');
    const localhost = await resolveOrigin('http://localhost:5173');

    expect(vercel.allowed).toBeUndefined();
    expect(localhost.allowed).toBeUndefined();
  });

  it('produccion sin ALLOWED_ORIGINS sigue permitiendo requests sin Origin', async () => {
    // Esto es importante para que herramientas como Postman, curl y health
    // checks puedan seguir accediendo al backend.
    mockEnv.NODE_ENV = 'production';
    mockEnv.ALLOWED_ORIGINS = undefined;

    const result = await resolveOrigin(undefined);

    expect(result.allowed).toBe(true);
  });

  it('produccion con ALLOWED_ORIGINS explicito aplica la lista', async () => {
    // El operador PUEDE permitir cross-origin explicito si lo necesita,
    // pero debe declararlo conscientemente.
    mockEnv.NODE_ENV = 'production';
    mockEnv.ALLOWED_ORIGINS = 'https://app.externo.com';

    const externo = await resolveOrigin('https://app.externo.com');
    const otro = await resolveOrigin('https://otro.com');

    expect(externo.allowed).toBe(true);
    expect(otro.allowed).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Combinacion de reglas (caso real de produccion).
  // ---------------------------------------------------------------------------
  it('soporta la combinacion recomendada para Vercel + dev local', async () => {
    mockEnv.ALLOWED_ORIGINS = 'http://localhost:5173,https://sportmetric.vercel.app,sportmetric-*.vercel.app';

    const local = await resolveOrigin('http://localhost:5173');
    const prod = await resolveOrigin('https://sportmetric.vercel.app');
    const previewMain = await resolveOrigin('https://sportmetric-git-main-gran-js-projects.vercel.app');
    const bloqueado = await resolveOrigin('https://bloqueado.test');

    expect(local.allowed).toBe(true);
    expect(prod.allowed).toBe(true);
    expect(previewMain.allowed).toBe(true);
    expect(bloqueado.allowed).toBeUndefined();
  });
});
