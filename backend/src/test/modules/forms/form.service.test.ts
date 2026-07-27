// =============================================================================
// Tests del servicio de Esquemas de Formulario
// =============================================================================
// Verifica la composicion de la Ficha Tecnica base + campos personalizados
// y la limpieza de campos invalidos.
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { findByProtocolId, upsert } = vi.hoisted(() => ({
  findByProtocolId: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('../../../modules/forms/repositories/form.repository', () => ({
  findByProtocolId,
  upsert,
}));

import { getSchemaByProtocol, saveSchema } from '../../../modules/forms/services/form.service';

describe('form service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSchemaByProtocol', () => {
    it('retorna solo la Ficha Tecnica base cuando no hay campos personalizados', async () => {
      findByProtocolId.mockResolvedValue(null);

      const result = await getSchemaByProtocol('medicion-de-la-talla');

      expect(result).toMatchObject({
        isGeneric: true,
        protocolId: 'medicion-de-la-talla',
      });
      expect(result.fields).toHaveLength(3);
      expect(result.fields.map((f) => f.name)).toEqual(['id_estudiante', 'evaluado', 'evaluador']);
    });

    it('concatena los campos personalizados del admin al final de la Ficha Tecnica', async () => {
      findByProtocolId.mockResolvedValue({
        fields: [
          { name: 'talla_cm', label: 'Talla (cm)', type: 'number', required: true },
        ],
      });

      const result = await getSchemaByProtocol('medicion-de-la-talla');

      expect(result.isGeneric).toBe(false);
      expect(result.fields).toHaveLength(4);
      expect(result.fields[0].name).toBe('id_estudiante');
      expect(result.fields[3].name).toBe('talla_cm');
    });

    it('filtra campos personalizados vacios o sin label', async () => {
      findByProtocolId.mockResolvedValue({
        fields: [
          { name: 'valido', label: 'Valido', type: 'text' },
          { name: '', label: 'Vacio', type: 'text' },
          { name: 'sin_label', label: '', type: 'text' },
          null,
          { name: '   ', label: 'Solo espacios', type: 'text' },
        ],
      });

      const result = await getSchemaByProtocol('medicion-de-la-talla');

      const customFields = result.fields.slice(3);
      expect(customFields).toHaveLength(1);
      expect(customFields[0].name).toBe('valido');
    });

    it('maneja el caso donde fields no es un array', async () => {
      findByProtocolId.mockResolvedValue({ fields: 'no-es-array' });

      const result = await getSchemaByProtocol('medicion-de-la-talla');

      expect(result.isGeneric).toBe(true);
      expect(result.fields).toHaveLength(3);
    });
  });

  describe('saveSchema', () => {
    it('delega en el repositorio el guardado del esquema', async () => {
      upsert.mockResolvedValue({ id: 'fs-1' });

      const fields = [{ name: 'frecuencia_cardiaca', label: 'FC', type: 'number' }];
      await saveSchema('medicion-del-peso', fields);

      expect(upsert).toHaveBeenCalledWith({
        protocolId: 'medicion-del-peso',
        fields,
      });
    });
  });
});
