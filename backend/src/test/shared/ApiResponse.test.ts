import { ApiResponse } from '../../modules/shared/utils/ApiResponse';

describe('ApiResponse', () => {
  it('crea una respuesta exitosa sin metadatos', () => {
    const response = new ApiResponse({ id: '1' }, 'Creado');

    expect(response).toEqual({
      success: true,
      data: { id: '1' },
      message: 'Creado',
    });
  });

  it('incluye metadatos cuando se proporcionan', () => {
    const response = new ApiResponse([{ id: '1' }], 'Listado', { total: 1 });

    expect(response.meta).toEqual({ total: 1 });
  });
});
