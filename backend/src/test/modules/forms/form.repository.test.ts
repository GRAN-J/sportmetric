// =============================================================================
// Tests del repositorio de Esquemas de Formulario
// =============================================================================
// Verifica las operaciones de persistencia del schema de campos por protocolo.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    formSchema: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('../../../config/database', () => ({
  default: prismaMock,
}));

import { findByProtocolId, upsert } from '../../../modules/forms/repositories/form.repository';

describe('form schema repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByProtocolId', () => {
    it('obtiene el esquema de un protocolo por su id', async () => {
      prismaMock.formSchema.findUnique.mockResolvedValue({
        id: 'fs-1',
        protocolId: 'medicion-de-la-talla',
        fields: [{ name: 'talla_cm', label: 'Talla', type: 'number' }],
      });

      const result = await findByProtocolId('medicion-de-la-talla');

      expect(prismaMock.formSchema.findUnique).toHaveBeenCalledWith({
        where: { protocolId: 'medicion-de-la-talla' },
      });
      expect(result?.protocolId).toBe('medicion-de-la-talla');
    });

    it('retorna null si el protocolo no tiene esquema guardado', async () => {
      prismaMock.formSchema.findUnique.mockResolvedValue(null);

      await expect(findByProtocolId('sin-esquema')).resolves.toBeNull();
    });
  });

  describe('upsert', () => {
    it('crea un esquema nuevo cuando no existe', async () => {
      prismaMock.formSchema.upsert.mockResolvedValue({ id: 'fs-new' });

      await upsert({
        protocolId: 'medicion-del-peso',
        fields: [{ name: 'peso_kg', label: 'Peso', type: 'number' }],
      });

      expect(prismaMock.formSchema.upsert).toHaveBeenCalledWith({
        where: { protocolId: 'medicion-del-peso' },
        update: { fields: [{ name: 'peso_kg', label: 'Peso', type: 'number' }] },
        create: {
          protocolId: 'medicion-del-peso',
          fields: [{ name: 'peso_kg', label: 'Peso', type: 'number' }],
        },
      });
    });

    it('actualiza los fields de un esquema existente', async () => {
      prismaMock.formSchema.upsert.mockResolvedValue({ id: 'fs-1' });

      await upsert({
        protocolId: 'medicion-del-peso',
        fields: [
          { name: 'peso_kg', label: 'Peso (kg)', type: 'number' },
          { name: 'imc', label: 'IMC', type: 'number' },
        ],
      });

      expect(prismaMock.formSchema.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            fields: [
              { name: 'peso_kg', label: 'Peso (kg)', type: 'number' },
              { name: 'imc', label: 'IMC', type: 'number' },
            ],
          },
        })
      );
    });
  });
});
