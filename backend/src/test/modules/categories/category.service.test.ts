import * as categoryRepository from '../../../modules/categories/repositories/category.repository';
import { getCategories, getCategory } from '../../../modules/categories/services/category.service';

vi.mock('../../../modules/categories/repositories/category.repository', () => ({
  getAllCategories: vi.fn(),
  getCategoryById: vi.fn(),
}));

const categoryRepositoryMock = vi.mocked(categoryRepository);

describe('category.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene todas las categorías desde el repositorio', async () => {
    categoryRepositoryMock.getAllCategories.mockResolvedValue([
      {
        id: 'composicion-corporal',
        title: 'Composición corporal',
        description: 'Descripción',
        icon: 'Activity',
        color: 'bg-teal-accent',
        order: 1,
      },
    ]);

    const categories = await getCategories();

    expect(categoryRepositoryMock.getAllCategories).toHaveBeenCalledTimes(1);
    expect(categories).toHaveLength(1);
    expect(categories[0].id).toBe('composicion-corporal');
  });

  it('obtiene una categoría por id desde el repositorio', async () => {
    categoryRepositoryMock.getCategoryById.mockResolvedValue({
      id: 'calentamiento',
      title: 'Calentamiento',
      description: 'Preparación previa',
      icon: 'Flame',
      color: 'bg-orange-500',
      order: 2,
    });

    const category = await getCategory('calentamiento');

    expect(categoryRepositoryMock.getCategoryById).toHaveBeenCalledWith('calentamiento');
    expect(category?.title).toBe('Calentamiento');
  });
});
