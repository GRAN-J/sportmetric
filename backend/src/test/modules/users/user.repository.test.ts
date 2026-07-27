// =============================================================================
// Tests del repositorio de Usuarios
// =============================================================================
// Verifica las operaciones CRUD del repositorio de usuarios con Prisma mock.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../../../config/database', () => ({
  default: prismaMock,
}));

import {
  findByEmail,
  findAll,
  findById,
  create,
  update,
  remove,
} from '../../../modules/users/repositories/user.repository';

describe('user repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('busca un usuario por email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-1',
        email: 'admin@sportmetric.com',
      });

      const result = await findByEmail('admin@sportmetric.com');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@sportmetric.com' },
      });
      expect(result?.email).toBe('admin@sportmetric.com');
    });

    it('retorna null si el usuario no existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(findByEmail('noexiste@x.com')).resolves.toBeNull();
    });
  });

  describe('findAll', () => {
    it('obtiene todos los usuarios ordenados por createdAt descendente', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'u-2', email: 'b@x.com' },
        { id: 'u-1', email: 'a@x.com' },
      ]);

      const result = await findAll();

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('busca un usuario por id', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u-1', email: 'a@x.com' });

      const result = await findById('u-1');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u-1' },
      });
      expect(result?.id).toBe('u-1');
    });
  });

  describe('create', () => {
    it('crea un usuario con password hash y rol por defecto', async () => {
      prismaMock.user.create.mockResolvedValue({ id: 'u-new' });

      await create({
        name: 'Nuevo',
        email: 'nuevo@x.com',
        passwordHash: 'argon2-hash',
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Nuevo',
          email: 'nuevo@x.com',
          passwordHash: 'argon2-hash',
        },
      });
    });
  });

  describe('update', () => {
    it('actualiza los datos del usuario', async () => {
      prismaMock.user.update.mockResolvedValue({ id: 'u-1' });

      await update('u-1', { name: 'Nuevo Nombre', refreshTokenHash: null });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { name: 'Nuevo Nombre', refreshTokenHash: null },
      });
    });

    it('permite actualizar el token de recuperacion y su expiracion', async () => {
      prismaMock.user.update.mockResolvedValue({ id: 'u-1' });

      const expiresAt = new Date('2026-12-31');
      await update('u-1', {
        passwordResetTokenHash: 'sha256-hash',
        passwordResetExpires: expiresAt,
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { passwordResetTokenHash: 'sha256-hash', passwordResetExpires: expiresAt },
      });
    });
  });

  describe('remove', () => {
    it('elimina un usuario por id', async () => {
      prismaMock.user.delete.mockResolvedValue({ id: 'u-1' });

      await remove('u-1');

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 'u-1' },
      });
    });
  });
});
