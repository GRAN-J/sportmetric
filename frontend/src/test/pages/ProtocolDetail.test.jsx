import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtocolDetail from '../../pages/ProtocolDetail';
import * as protocolService from '../../services/protocolService';
import { protocolDetailFixture } from '../fixtures';

vi.mock('../../services/protocolService', () => ({
  getProtocolById: vi.fn(),
  getNextProtocolId: vi.fn(),
}));

const protocolServiceMock = vi.mocked(protocolService);

describe('ProtocolDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    protocolServiceMock.getProtocolById.mockResolvedValue(protocolDetailFixture);
    protocolServiceMock.getNextProtocolId.mockResolvedValue('medicion-del-perimetro-de-cintura');
  });

  it('carga el protocolo y permite navegar entre secciones', async () => {
    render(
      <MemoryRouter initialEntries={['/protocol/medicion-del-peso/objective']}>
        <Routes>
          <Route path="/protocol/:protocolId/*" element={<ProtocolDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Objetivo del Protocolo')).toBeInTheDocument();
    expect(screen.getByText('Medición del peso')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(await screen.findByText('Materiales Necesarios')).toBeInTheDocument();
  });

  it('muestra el mensaje de error cuando el servicio falla', async () => {
    protocolServiceMock.getProtocolById.mockRejectedValue(new Error('No fue posible cargar el protocolo'));

    render(
      <MemoryRouter initialEntries={['/protocol/medicion-del-peso/objective']}>
        <Routes>
          <Route path="/protocol/:protocolId/*" element={<ProtocolDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: 'No fue posible cargar el protocolo' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('No fue posible cargar el protocolo')).toHaveLength(2);
  });

  it('muestra un estado simple cuando el protocolo no existe', async () => {
    protocolServiceMock.getProtocolById.mockResolvedValue(null);
    protocolServiceMock.getNextProtocolId.mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/protocol/protocolo-inexistente/objective']}>
        <Routes>
          <Route path="/protocol/:protocolId/*" element={<ProtocolDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Protocolo no encontrado')).toBeInTheDocument();
  });
});
