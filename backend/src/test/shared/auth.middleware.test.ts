// =============================================================================
// Tests del middleware de autenticacion y autorizacion
// =============================================================================
// Verifica que el middleware extrae el token Bearer, lo valida con JWT y
// aplica correctamente las reglas de autorizacion por rol.
// =============================================================================
// NOTA SOBRE LOS MOCKS
// -----------------------------------------------------------------------------
// 1) `vi.hoisted` se ejecuta antes que los `import` estaticos, por lo que las
//    referencias (`jwtVerifyMock`, `ApiError`) ya existen cuando se cargan los
//    modulos mockeados.
// 2) `vi.mock(...)` se eleva (hoist) al inicio del archivo por Vitest, asi
//    que el `import` estatico del middleware se resuelve contra los mocks.
// 3) El `import` estatico del middleware (no `await import`) convierte al
//    archivo en un modulo de TypeScript, requisito para tipar correctamente
//    los helpers y los mocks.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { jwtVerifyMock, ApiError } = vi.hoisted(() => ({
  jwtVerifyMock: vi.fn(),
  ApiError: class ApiError extends Error {
    public statusCode: number;
    public code: string;

    constructor(message: string, statusCode: number, code: string) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.code = code;
    }
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtVerifyMock },
  verify: jwtVerifyMock,
}));

vi.mock('../../config/jwt', () => ({
  jwtConfig: { access: { secret: 'test-secret' } },
}));

vi.mock('../../modules/shared/utils/ApiError', () => ({
  ApiError,
}));

import type { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware';

// Helpers de mocks tipados. Se usa `unknown` como puente para evitarse la
// implementacion completa de `Request`/`Response`/`NextFunction` de Express,
// que exige docenas de metodos que no son relevantes para estos tests.
const mockReq = (headers: Record<string, string> = {}): Request => {
  return { headers } as unknown as Request;
};

const mockRes = (): Response => {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
};

const mockNext = (): NextFunction => vi.fn() as unknown as NextFunction;

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('lanza UNAUTHORIZED si no hay header Authorization', () => {
      const req = mockReq();
      const next = mockNext();

      expect(() => authenticate(req, mockRes(), next)).toThrow(
        expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('lanza UNAUTHORIZED si el header no empieza por "Bearer "', () => {
      const req = mockReq({ authorization: 'Basic abc' });
      const next = mockNext();

      expect(() => authenticate(req, mockRes(), next)).toThrow(
        expect.objectContaining({ statusCode: 401, code: 'UNAUTHORIZED' })
      );
    });

    it('decodifica el token JWT y lo expone en req.user cuando es valido', () => {
      jwtVerifyMock.mockReturnValue({ sub: 'u-1', role: 'ADMIN' });
      const req = mockReq({ authorization: 'Bearer valid-token' });
      const next = mockNext();

      authenticate(req, mockRes(), next);

      expect(jwtVerifyMock).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect((req as unknown as { user: unknown }).user).toEqual({ sub: 'u-1', role: 'ADMIN' });
      expect(next).toHaveBeenCalledWith();
    });

    it('lanza INVALID_TOKEN cuando jwt.verify falla', () => {
      jwtVerifyMock.mockImplementation(() => {
        throw new Error('invalid signature');
      });
      const req = mockReq({ authorization: 'Bearer bad-token' });
      const next = mockNext();

      expect(() => authenticate(req, mockRes(), next)).toThrow(
        expect.objectContaining({ statusCode: 401, code: 'INVALID_TOKEN' })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('permite el paso si el rol del usuario esta en la lista', () => {
      const req = mockReq();
      (req as unknown as { user: { sub: string; role: string } }).user = {
        sub: 'u-1',
        role: 'ADMIN',
      };
      const next = mockNext();
      const middleware = authorize('ADMIN', 'EVALUATOR');

      middleware(req, mockRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it('lanza FORBIDDEN si el rol del usuario no esta permitido', () => {
      const req = mockReq();
      (req as unknown as { user: { sub: string; role: string } }).user = {
        sub: 'u-1',
        role: 'EVALUATOR',
      };
      const next = mockNext();
      const middleware = authorize('ADMIN');

      expect(() => middleware(req, mockRes(), next)).toThrow(
        expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('lanza FORBIDDEN si no hay usuario en req', () => {
      const req = mockReq();
      const next = mockNext();
      const middleware = authorize('ADMIN');

      expect(() => middleware(req, mockRes(), next)).toThrow(
        expect.objectContaining({ statusCode: 403, code: 'FORBIDDEN' })
      );
    });
  });
});
