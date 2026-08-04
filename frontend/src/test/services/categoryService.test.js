import { categoryFixture } from '../fixtures';

const loadCategoryService = async ({ apiMode = false, apiPayload = [], authenticated = false } = {}) => {
  vi.resetModules();

  const apiGet = vi.fn().mockResolvedValue(apiPayload);
  vi.doMock('../../services/apiClient', () => ({
    apiGet,
    isApiDataSource: () => apiMode,
  }));
  vi.doMock('../../services/authService', () => ({
    isAuthenticated: () => authenticated,
  }));

  const service = await import('../../services/categoryService');
  return { ...service, apiGet };
};

describe('categoryService', () => {
  it('obtiene categorías locales sin depender del backend', async () => {
    const { getCategories, apiGet } = await loadCategoryService();

    const categories = await getCategories();

    expect(apiGet).not.toHaveBeenCalled();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      icon: expect.any(String),
    });
  });

  it('consulta la API cuando la fuente activa es remota Y hay sesion', async () => {
    // OPTIMIZACION: visitantes sin sesion reciben datos locales aunque
    // VITE_DATA_SOURCE=api, para evitar el cold start de Render.
    const { getCategories, apiGet } = await loadCategoryService({
      apiMode: true,
      apiPayload: [categoryFixture],
      authenticated: true,
    });

    const categories = await getCategories();

    expect(apiGet).toHaveBeenCalledWith('/api/categories', {});
    expect(categories).toEqual([categoryFixture]);
  });

  it('usa datos locales cuando la fuente es remota pero NO hay sesion', async () => {
    // Caso clave de la optimizacion: visitante publico sin sesion.
    // Aunque VITE_DATA_SOURCE=api, no se hace fetch al backend.
    const { getCategories, apiGet } = await loadCategoryService({
      apiMode: true,
      apiPayload: [categoryFixture],
      authenticated: false,
    });

    const categories = await getCategories();

    expect(apiGet).not.toHaveBeenCalled();
    expect(categories.length).toBeGreaterThan(0);
  });

  it('encuentra una categoría existente por id', async () => {
    const { getCategoryById } = await loadCategoryService();

    const category = await getCategoryById('composicion-corporal');

    expect(category).not.toBeNull();
    expect(category.id).toBe('composicion-corporal');
  });

  it('retorna null cuando la categoría no existe', async () => {
    const { getCategoryById } = await loadCategoryService();

    const category = await getCategoryById('categoria-inexistente');

    expect(category).toBeNull();
  });
});
