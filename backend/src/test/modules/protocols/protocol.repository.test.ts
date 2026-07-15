const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    protocol: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../../config/database', () => ({
  default: prismaMock,
}));

import {
  getAllProtocols,
  getProtocolById,
  getProtocolsByCategory,
} from '../../../modules/protocols/repositories/protocol.repository';

describe('protocol repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista todos los protocolos con su forma resumida', async () => {
    prismaMock.protocol.findMany.mockResolvedValue([
      {
        id: 'medicion-del-peso',
        categoryId: 'composicion-corporal',
        order: 1,
        title: 'Medición del peso',
        objective: 'Objetivo',
        description: 'Descripción',
      },
    ]);

    const protocols = await getAllProtocols();

    expect(prismaMock.protocol.findMany).toHaveBeenCalledWith({
      orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
    });
    expect(protocols[0]).toMatchObject({
      id: 'medicion-del-peso',
      categoryId: 'composicion-corporal',
    });
  });

  it('filtra protocolos por categoría', async () => {
    prismaMock.protocol.findMany.mockResolvedValue([
      {
        id: 'medicion-del-peso',
        categoryId: 'composicion-corporal',
        order: 1,
        title: 'Medición del peso',
        objective: 'Objetivo',
        description: 'Descripción',
      },
    ]);

    const protocols = await getProtocolsByCategory('composicion-corporal');

    expect(prismaMock.protocol.findMany).toHaveBeenCalledWith({
      where: { categoryId: 'composicion-corporal' },
      orderBy: { order: 'asc' },
    });
    expect(protocols).toHaveLength(1);
  });

  it('retorna un protocolo completo con relaciones mapeadas', async () => {
    prismaMock.protocol.findUnique.mockResolvedValue({
      id: 'medicion-del-peso',
      categoryId: 'composicion-corporal',
      order: 1,
      title: 'Medición del peso',
      objective: 'Objetivo',
      description: 'Descripción',
      materials: [{ id: 'm1', name: 'Báscula', imageUrl: '/bascula.webp', order: 1 }],
      checklistItems: [{ id: 'c1', text: 'Verificar calibración', order: 1 }],
      steps: [{ id: 's1', stepNumber: 1, title: 'Paso 1', description: 'Desc', videoUrl: '/paso-1.mp4', order: 1 }],
      interruptionCrit: [{ id: 'i1', text: 'Suspender ante mareo', order: 1 }],
      dataRegistry: { id: 'd1', title: 'Registro', description: 'Desc', unit: 'kg' },
    });

    const protocol = await getProtocolById('medicion-del-peso');

    expect(prismaMock.protocol.findUnique).toHaveBeenCalledWith({
      where: { id: 'medicion-del-peso' },
      include: {
        materials: { orderBy: { order: 'asc' } },
        checklistItems: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        interruptionCrit: { orderBy: { order: 'asc' } },
        dataRegistry: true,
      },
    });
    expect(protocol).toMatchObject({
      id: 'medicion-del-peso',
      materials: [{ id: 'm1', name: 'Báscula', imageUrl: '/bascula.webp', order: 1 }],
      checklistItems: [{ id: 'c1', text: 'Verificar calibración', order: 1 }],
      interruptionCrit: [{ id: 'i1', text: 'Suspender ante mareo', order: 1 }],
      dataRegistry: { id: 'd1', title: 'Registro', description: 'Desc', unit: 'kg' },
    });
  });

  it('retorna null cuando el protocolo no existe', async () => {
    prismaMock.protocol.findUnique.mockResolvedValue(null);

    await expect(getProtocolById('no-existe')).resolves.toBeNull();
  });

  it('mapea dataRegistry como null cuando no existe en base de datos', async () => {
    prismaMock.protocol.findUnique.mockResolvedValue({
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

    const protocol = await getProtocolById('medicion-del-peso');

    expect(protocol?.dataRegistry).toBeNull();
  });
});
