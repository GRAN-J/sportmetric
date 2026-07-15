import { Request, Response } from 'express';
import { ApiError } from '../../modules/shared/utils/ApiError';
import { errorHandler } from '../../modules/shared/filters/error.filter';
import logger from '../../modules/shared/utils/logger';

vi.mock('../../modules/shared/utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

const createMockResponse = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return {
    status,
    json,
  };
};

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el código y estado de un ApiError', () => {
    const res = createMockResponse();
    const error = new ApiError('Categoría no encontrada', 404, 'CATEGORY_NOT_FOUND');

    errorHandler(error, {} as Request, res as unknown as Response, vi.fn());

    expect(logger.error).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'CATEGORY_NOT_FOUND',
        message: 'Categoría no encontrada',
        details: undefined,
      },
    });
  });

  it('transforma errores de validación con flatten', () => {
    const res = createMockResponse();
    const validationError = {
      name: 'ZodError',
      message: 'Datos inválidos',
      flatten: () => ({
        fieldErrors: {
          email: ['Campo requerido'],
        },
      }),
    } as unknown as Error & { flatten: () => { fieldErrors: Record<string, string[]> } };

    errorHandler(validationError, {} as Request, res as unknown as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: {
          email: ['Campo requerido'],
        },
      },
    });
  });

  it('transforma errores conocidos de Prisma', () => {
    const res = createMockResponse();
    const prismaError = {
      name: 'PrismaClientKnownRequestError',
      message: 'Unique constraint failed',
      code: 'P2002',
      meta: { target: ['email'] },
    } as unknown as Error & { code: string; meta: Record<string, string[]> };

    errorHandler(prismaError, {} as Request, res as unknown as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'UNIQUE_CONSTRAINT',
        message: 'El registro ya existe',
        details: undefined,
      },
    });
  });

  it('devuelve error interno para excepciones genéricas', () => {
    const res = createMockResponse();

    errorHandler(new Error('Fallo inesperado'), {} as Request, res as unknown as Response, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocurrió un error interno',
      },
    });
  });
});
