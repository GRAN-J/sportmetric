import { Request, Response } from 'express';

const loggerMock = {
  error: vi.fn(),
};

const createMockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return {
    status,
    json,
  };
};

describe('errorHandler en desarrollo', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('incluye detalles de ApiError en desarrollo', async () => {
    vi.doMock('../../modules/shared/utils/logger', () => ({
      default: loggerMock,
    }));
    vi.doMock('../../config/env', () => ({
      env: { NODE_ENV: 'development' },
    }));

    const { ApiError } = await import('../../modules/shared/utils/ApiError');
    const { errorHandler } = await import('../../modules/shared/filters/error.filter');
    const res = createMockResponse();
    const error = new ApiError('Entrada inválida', 400, 'BAD_REQUEST', { field: ['required'] });

    errorHandler(error, {} as Request, res as unknown as Response, vi.fn());

    expect(loggerMock.error).toHaveBeenCalledWith(error);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Entrada inválida',
        details: { field: ['required'] },
      },
    });
  });

  it('transforma P2025 con detalles cuando Prisma informa metadatos', async () => {
    vi.doMock('../../modules/shared/utils/logger', () => ({
      default: loggerMock,
    }));
    vi.doMock('../../config/env', () => ({
      env: { NODE_ENV: 'development' },
    }));

    const { errorHandler } = await import('../../modules/shared/filters/error.filter');
    const res = createMockResponse();
    const prismaError = {
      name: 'PrismaClientKnownRequestError',
      message: 'Registro no encontrado',
      code: 'P2025',
      meta: { cause: 'Registro inexistente' },
    } as unknown as Error & { code: string; meta: Record<string, string> };

    errorHandler(prismaError, {} as Request, res as unknown as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Registro no encontrado',
        details: { cause: 'Registro inexistente' },
      },
    });
  });

  it('mantiene el código genérico de base de datos para errores Prisma desconocidos', async () => {
    vi.doMock('../../modules/shared/utils/logger', () => ({
      default: loggerMock,
    }));
    vi.doMock('../../config/env', () => ({
      env: { NODE_ENV: 'development' },
    }));

    const { errorHandler } = await import('../../modules/shared/filters/error.filter');
    const res = createMockResponse();
    const prismaError = {
      name: 'PrismaClientKnownRequestError',
      message: 'Error desconocido',
      code: 'P2999',
      meta: { reason: 'desconocido' },
    } as unknown as Error & { code: string; meta: Record<string, string> };

    errorHandler(prismaError, {} as Request, res as unknown as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Error en la base de datos',
        details: undefined,
      },
    });
  });
});
