describe('database config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('crea el cliente Prisma con logs extendidos en desarrollo', async () => {
    const poolMock = vi.fn();
    const adapterMock = vi.fn();
    const prismaClientMock = vi.fn();

    vi.doMock('pg', () => ({
      Pool: class Pool {
        constructor(options: unknown) {
          poolMock(options);
          return { options };
        }
      },
    }));
    vi.doMock('@prisma/adapter-pg', () => ({
      PrismaPg: class PrismaPg {
        constructor(pool: unknown) {
          adapterMock(pool);
          return { pool };
        }
      },
    }));
    vi.doMock('../../generated/prisma', () => ({
      PrismaClient: class PrismaClient {
        constructor(options: unknown) {
          prismaClientMock(options);
          return { options };
        }
      },
    }));
    vi.doMock('../../config/env', () => ({
      env: {
        DATABASE_URL: 'postgresql://postgres:1234@localhost:5432/sportmetric?schema=public',
        NODE_ENV: 'development',
      },
    }));

    const databaseModule = await import('../../config/database');

    expect(poolMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://postgres:1234@localhost:5432/sportmetric?schema=public',
    });
    expect(adapterMock).toHaveBeenCalled();
    expect(prismaClientMock).toHaveBeenCalledWith({
      adapter: expect.any(Object),
      log: ['query', 'info', 'warn', 'error'],
    });
    expect(databaseModule.default).toBeDefined();
  });

  it('usa logging mínimo fuera de desarrollo', async () => {
    const prismaClientMock = vi.fn();

    vi.doMock('pg', () => ({
      Pool: class Pool {
        constructor() {
          return {};
        }
      },
    }));
    vi.doMock('@prisma/adapter-pg', () => ({
      PrismaPg: class PrismaPg {
        constructor() {
          return {};
        }
      },
    }));
    vi.doMock('../../generated/prisma', () => ({
      PrismaClient: class PrismaClient {
        constructor(options: unknown) {
          prismaClientMock(options);
          return { options };
        }
      },
    }));
    vi.doMock('../../config/env', () => ({
      env: {
        DATABASE_URL: 'postgresql://postgres:1234@localhost:5432/sportmetric?schema=public',
        NODE_ENV: 'production',
      },
    }));

    await import('../../config/database');

    expect(prismaClientMock).toHaveBeenCalledWith({
      adapter: expect.any(Object),
      log: ['error'],
    });
  });
});
