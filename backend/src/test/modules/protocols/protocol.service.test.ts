import * as protocolRepository from '../../../modules/protocols/repositories/protocol.repository';
import {
  getProtocol,
  getProtocols,
  getProtocolsByCategory,
} from '../../../modules/protocols/services/protocol.service';

vi.mock('../../../modules/protocols/repositories/protocol.repository', () => ({
  getAllProtocols: vi.fn(),
  getProtocolsByCategory: vi.fn(),
  getProtocolById: vi.fn(),
}));

const protocolRepositoryMock = vi.mocked(protocolRepository);

describe('protocol.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene el listado general de protocolos', async () => {
    protocolRepositoryMock.getAllProtocols.mockResolvedValue([
      {
        id: 'medicion-del-peso',
        categoryId: 'composicion-corporal',
        order: 1,
        title: 'Medición del peso',
        objective: 'Objetivo',
        description: 'Descripción',
      },
    ]);

    const protocols = await getProtocols();

    expect(protocolRepositoryMock.getAllProtocols).toHaveBeenCalledTimes(1);
    expect(protocols[0].categoryId).toBe('composicion-corporal');
  });

  it('obtiene protocolos filtrados por categoría', async () => {
    protocolRepositoryMock.getProtocolsByCategory.mockResolvedValue([
      {
        id: 'medicion-del-perimetro-de-cintura',
        categoryId: 'composicion-corporal',
        order: 2,
        title: 'Medición del perímetro de cintura',
        objective: 'Objetivo',
        description: 'Descripción',
      },
    ]);

    const protocols = await getProtocolsByCategory('composicion-corporal');

    expect(protocolRepositoryMock.getProtocolsByCategory).toHaveBeenCalledWith('composicion-corporal');
    expect(protocols).toHaveLength(1);
  });

  it('obtiene un protocolo completo por id', async () => {
    protocolRepositoryMock.getProtocolById.mockResolvedValue({
      id: 'medicion-del-peso',
      categoryId: 'composicion-corporal',
      order: 1,
      title: 'Medición del peso',
      objective: 'Objetivo',
      description: 'Descripción',
      materials: [],
      checklistItems: [],
      steps: [],
      interruptionCrit: [],
      dataRegistry: null,
    });

    const protocol = await getProtocol('medicion-del-peso');

    expect(protocolRepositoryMock.getProtocolById).toHaveBeenCalledWith('medicion-del-peso');
    expect(protocol?.id).toBe('medicion-del-peso');
  });
});
