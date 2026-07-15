const loadProtocolService = async ({
  apiMode = false,
  listPayload = [],
  detailPayload = null,
} = {}) => {
  vi.resetModules();

  const apiGet = vi.fn(async (path) => {
    if (path === '/api/protocols') {
      return listPayload;
    }

    if (path.startsWith('/api/protocols/')) {
      return detailPayload;
    }

    return [];
  });

  vi.doMock('../../services/apiClient', () => ({
    apiGet,
    isApiDataSource: () => apiMode,
  }));

  const service = await import('../../services/protocolService');
  return { ...service, apiGet };
};

describe('protocolService', () => {
  it('devuelve el detalle de un protocolo local conocido', async () => {
    const { getProtocolById } = await loadProtocolService();

    const protocol = await getProtocolById('medicion-del-peso');

    expect(protocol).not.toBeNull();
    expect(protocol.id).toBe('medicion-del-peso');
    expect(protocol.materials.length).toBeGreaterThan(0);
    expect(protocol.steps.length).toBeGreaterThan(0);
  });

  it('lista protocolos locales de una categoría conservando el id de categoría', async () => {
    const { getProtocolsByCategory } = await loadProtocolService();

    const protocols = await getProtocolsByCategory('composicion-corporal');

    expect(protocols.length).toBeGreaterThan(0);
    expect(protocols.every((protocol) => protocol.category === 'composicion-corporal')).toBe(true);
  });

  it('permite navegar al siguiente protocolo local dentro de la misma categoría', async () => {
    const { getNextProtocolId } = await loadProtocolService();

    const nextProtocolId = await getNextProtocolId('medicion-del-peso', 'composicion-corporal');

    expect(nextProtocolId).toBe('medicion-del-perimetro-de-cintura');
  });

  it('mapea correctamente la respuesta del backend en modo API', async () => {
    const { getProtocolById, getProtocolsByCategory, getNextProtocolId, apiGet } = await loadProtocolService({
      apiMode: true,
      listPayload: [
        {
          id: 'medicion-del-peso',
          categoryId: 'composicion-corporal',
          order: 1,
          title: 'Medición del peso',
          objective: 'Objetivo',
          description: 'Descripción',
        },
        {
          id: 'medicion-del-perimetro-de-cintura',
          categoryId: 'composicion-corporal',
          order: 2,
          title: 'Medición del perímetro de cintura',
          objective: 'Objetivo 2',
          description: 'Descripción 2',
        },
      ],
      detailPayload: {
        id: 'medicion-del-peso',
        categoryId: 'composicion-corporal',
        order: 1,
        title: 'Medición del peso',
        objective: 'Objetivo',
        description: 'Descripción',
        materials: [{ name: 'Báscula', imageUrl: '/assets/bascula.webp', order: 1 }],
        checklistItems: [{ text: 'Verificar calibración', order: 1 }],
        steps: [{ stepNumber: 1, title: 'Paso 1', description: 'Descripción', videoUrl: '/assets/paso-1.mp4', order: 1 }],
        interruptionCrit: [{ text: 'Suspender ante mareo', order: 1 }],
        dataRegistry: { title: 'Registro', description: 'Descripción', unit: 'kg' },
      },
    });

    const protocols = await getProtocolsByCategory('composicion-corporal');
    const nextProtocolId = await getNextProtocolId('medicion-del-peso', 'composicion-corporal');
    const protocol = await getProtocolById('medicion-del-peso');

    expect(protocols).toHaveLength(2);
    expect(nextProtocolId).toBe('medicion-del-perimetro-de-cintura');
    expect(apiGet).toHaveBeenCalledTimes(2);
    expect(protocol).toMatchObject({
      id: 'medicion-del-peso',
      category: 'composicion-corporal',
      checklist: ['Verificar calibración'],
      interruptionCriteria: ['Suspender ante mareo'],
    });
    expect(protocol.materials[0].image).toBe('/assets/bascula.webp');
    expect(protocol.steps[0].video).toBe('/assets/paso-1.mp4');
  });

  it('retorna null cuando el protocolo consultado no existe en modo local', async () => {
    const { getProtocolById } = await loadProtocolService();

    const protocol = await getProtocolById('protocolo-inexistente');

    expect(protocol).toBeNull();
  });
});
