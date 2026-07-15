import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtocolList from '../../pages/ProtocolList';
import * as categoryService from '../../services/categoryService';
import * as protocolService from '../../services/protocolService';
import { categoryFixture, protocolListFixture } from '../fixtures';

vi.mock('../../services/categoryService', () => ({
  getCategories: vi.fn(),
}));

vi.mock('../../services/protocolService', () => ({
  getProtocolsByCategory: vi.fn(),
}));

const categoryServiceMock = vi.mocked(categoryService);
const protocolServiceMock = vi.mocked(protocolService);

describe('ProtocolList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryServiceMock.getCategories.mockResolvedValue([categoryFixture]);
    protocolServiceMock.getProtocolsByCategory.mockResolvedValue(protocolListFixture);
  });

  it('muestra la categoría y filtra protocolos por texto de búsqueda', async () => {
    render(
      <MemoryRouter initialEntries={['/category/composicion-corporal']}>
        <Routes>
          <Route path="/category/:categoryId" element={<ProtocolList />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Composición corporal')).toBeInTheDocument();
    expect(screen.getByText('Medición del peso')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Buscar protocolos por nombre o palabra clave...'), {
      target: { value: 'cintura' },
    });

    expect(screen.queryByText('Medición del peso')).not.toBeInTheDocument();
    expect(screen.getByText('Medición del perímetro de cintura')).toBeInTheDocument();
  });

  it('permite abrir el detalle de un protocolo desde la tarjeta', async () => {
    render(
      <MemoryRouter initialEntries={['/category/composicion-corporal']}>
        <Routes>
          <Route path="/category/:categoryId" element={<ProtocolList />} />
          <Route path="/protocol/:protocolId/:section" element={<div>Detalle del protocolo</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Medición del peso')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Medición del peso'));

    expect(await screen.findByText('Detalle del protocolo')).toBeInTheDocument();
  });

  it('muestra un mensaje de error si la carga falla', async () => {
    protocolServiceMock.getProtocolsByCategory.mockRejectedValue(new Error('Backend no disponible'));

    render(
      <MemoryRouter initialEntries={['/category/composicion-corporal']}>
        <Routes>
          <Route path="/category/:categoryId" element={<ProtocolList />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('No fue posible cargar los protocolos')).toBeInTheDocument();
    expect(screen.getByText('Backend no disponible')).toBeInTheDocument();
  });
});
