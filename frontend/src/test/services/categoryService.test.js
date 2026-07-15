import { categoryFixture } from '../fixtures';

const loadCategoryService = async ({ apiMode = false, apiPayload = [] } = {}) => {
  vi.resetModules();

  const apiGet = vi.fn().mockResolvedValue(apiPayload);
  vi.doMock('../../services/apiClient', () => ({
    apiGet,
    isApiDataSource: () => apiMode,
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

  it('consulta la API cuando la fuente activa es remota', async () => {
    const { getCategories, apiGet } = await loadCategoryService({
      apiMode: true,
      apiPayload: [categoryFixture],
    });

    const categories = await getCategories();

    expect(apiGet).toHaveBeenCalledWith('/api/categories');
    expect(categories).toEqual([categoryFixture]);
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
