import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Categories from '../../pages/Categories';
import * as categoryService from '../../services/categoryService';
import { categoryFixture } from '../fixtures';

vi.mock('../../services/categoryService', () => ({
  getCategories: vi.fn(),
}));

const categoryServiceMock = vi.mocked(categoryService);

describe('Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra las categorías cargadas y permite navegar al detalle de la categoría', async () => {
    categoryServiceMock.getCategories.mockResolvedValue([categoryFixture]);

    render(
      <MemoryRouter initialEntries={['/categories']}>
        <Routes>
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:categoryId" element={<div>Detalle de categoría</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Composición corporal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Explorar Protocolos'));

    expect(await screen.findByText('Detalle de categoría')).toBeInTheDocument();
  });

  it('muestra un mensaje de error si no puede cargar las categorías', async () => {
    categoryServiceMock.getCategories.mockRejectedValue(new Error('Fallo de red'));

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    expect(await screen.findByText('No fue posible cargar las categorías')).toBeInTheDocument();
    expect(screen.getByText('Fallo de red')).toBeInTheDocument();
  });
});
