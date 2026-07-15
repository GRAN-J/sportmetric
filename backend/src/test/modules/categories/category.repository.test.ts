const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../../config/database', () => ({
  default: prismaMock,
}));

import { getAllCategories, getCategoryById } from '../../../modules/categories/repositories/category.repository';

describe('category repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene y transforma todas las categorías ordenadas', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      {
        id: 'composicion-corporal',
        title: 'Composición corporal',
        description: 'Descripción',
        icon: 'Activity',
        color: 'bg-teal-accent',
        order: 1,
      },
    ]);

    const categories = await getAllCategories();

    expect(prismaMock.category.findMany).toHaveBeenCalledWith({
      orderBy: {
        order: 'asc',
      },
    });
    expect(categories).toEqual([
      {
        id: 'composicion-corporal',
        title: 'Composición corporal',
        description: 'Descripción',
        icon: 'Activity',
        color: 'bg-teal-accent',
        order: 1,
      },
    ]);
  });

  it('retorna una categoría transformada por id', async () => {
    prismaMock.category.findUnique.mockResolvedValue({
      id: 'composicion-corporal',
      title: 'Composición corporal',
      description: 'Descripción',
      icon: 'Activity',
      color: 'bg-teal-accent',
      order: 1,
    });

    const category = await getCategoryById('composicion-corporal');

    expect(prismaMock.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'composicion-corporal' },
    });
    expect(category?.id).toBe('composicion-corporal');
  });

  it('retorna null cuando la categoría no existe', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(getCategoryById('no-existe')).resolves.toBeNull();
  });
});
