import { API_BASE_URL, apiGet } from '../../services/apiClient';

describe('apiClient', () => {
  it('usa una URL base sin slash final', () => {
    expect(API_BASE_URL).toBe('http://localhost:3001');
  });

  it('devuelve payload.data cuando la API responde exitosamente', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'medicion-del-peso',
        },
      }),
    });

    const payload = await apiGet('/api/protocols/medicion-del-peso');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/protocols/medicion-del-peso', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(payload).toEqual({ id: 'medicion-del-peso' });
  });

  it('lanza el mensaje específico del backend cuando la respuesta falla', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          message: 'No autorizado',
        },
      }),
    });

    await expect(apiGet('/api/private')).rejects.toThrow('No autorizado');
  });

  it('devuelve el payload completo cuando la respuesta no trae data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Sin wrapper data',
      }),
    });

    await expect(apiGet('/api/health')).resolves.toEqual({
      success: true,
      message: 'Sin wrapper data',
    });
  });

  it('usa el mensaje genérico si el backend falla sin detalle', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(apiGet('/api/fail')).rejects.toThrow('No fue posible consultar la API.');
  });
});
