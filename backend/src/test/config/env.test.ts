describe('env config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('carga variables válidas y aplica valores por defecto', async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'http://database.example.com';
    process.env.JWT_SECRET = '12345678901234567890123456789012';
    process.env.JWT_REFRESH_SECRET = 'abcdefghijklmnopqrstuvwxyz123456';
    delete process.env.PORT;
    delete process.env.JWT_ACCESS_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_IN;

    const { env } = await import('../../config/env');

    expect(env.NODE_ENV).toBe('test');
    expect(env.PORT).toBe(3001);
    expect(env.JWT_ACCESS_EXPIRES_IN).toBe('15m');
    expect(env.JWT_REFRESH_EXPIRES_IN).toBe('7d');
    expect(env.TRUST_PROXY_HOPS).toBe(0);
  });

  it('detiene la aplicación cuando faltan variables obligatorias', async () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processExitMock = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: string | number | null | undefined) => {
        throw new Error(`process.exit:${code}`);
      }) as never);

    await expect(import('../../config/env')).rejects.toThrow('process.exit:1');
    expect(consoleErrorMock).toHaveBeenCalled();

    processExitMock.mockRestore();
    consoleErrorMock.mockRestore();
  });
});
