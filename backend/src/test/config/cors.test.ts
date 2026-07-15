import { corsConfig } from '../../config/cors';

const resolveOrigin = (origin?: string) =>
  new Promise<{ error: Error | null; allowed: unknown }>((resolve) => {
    const originHandler = corsConfig.origin as (
      origin: string | undefined,
      callback: (error: Error | null, allowed?: unknown) => void
    ) => void;

    originHandler(origin, (error, allowed) => resolve({ error, allowed }));
  });

describe('corsConfig', () => {
  it('permite solicitudes sin cabecera origin', async () => {
    const result = await resolveOrigin(undefined);

    expect(result.error).toBeNull();
    expect(result.allowed).toBe(true);
  });

  it('permite los orígenes configurados en el entorno', async () => {
    const result = await resolveOrigin('http://localhost:5173');

    expect(result.error).toBeNull();
    expect(result.allowed).toBe(true);
  });

  it('bloquea orígenes no autorizados', async () => {
    const result = await resolveOrigin('https://origen-no-autorizado.test');

    expect(result.allowed).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toContain('Origen no permitido por CORS');
  });
});
