describe('jwt config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('expone la configuración de access y refresh token desde env', async () => {
    vi.doMock('../../config/env', () => ({
      env: {
        JWT_SECRET: 'secret-access',
        JWT_REFRESH_SECRET: 'secret-refresh',
        JWT_ACCESS_EXPIRES_IN: '30m',
        JWT_REFRESH_EXPIRES_IN: '14d',
      },
    }));

    const { jwtConfig } = await import('../../config/jwt');

    expect(jwtConfig).toEqual({
      access: {
        secret: 'secret-access',
        expiresIn: '30m',
      },
      refresh: {
        secret: 'secret-refresh',
        expiresIn: '14d',
      },
    });
  });
});
