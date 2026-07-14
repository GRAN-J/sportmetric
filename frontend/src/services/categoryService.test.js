import { getCategories, getCategoryById } from './categoryService';

describe('categoryService en modo local', () => {
  it('obtiene las categorías disponibles sin depender del backend', async () => {
    const categories = await getCategories();

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      icon: expect.any(String),
    });
  });

  it('encuentra una categoría existente por id', async () => {
    const category = await getCategoryById('composicion-corporal');

    expect(category).not.toBeNull();
    expect(category.id).toBe('composicion-corporal');
  });

  it('retorna null cuando la categoría no existe', async () => {
    const category = await getCategoryById('categoria-inexistente');

    expect(category).toBeNull();
  });
});
