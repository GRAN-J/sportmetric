import request from 'supertest';
import app from '../app';
import * as categoryService from '../modules/categories/services/category.service';
import * as protocolService from '../modules/protocols/services/protocol.service';

vi.mock('../modules/categories/services/category.service', () => ({
  getCategories: vi.fn(),
  getCategory: vi.fn(),
}));

vi.mock('../modules/protocols/services/protocol.service', () => ({
  getProtocols: vi.fn(),
  getProtocolsByCategory: vi.fn(),
  getProtocol: vi.fn(),
}));

const categoryMocks = vi.mocked(categoryService);
const protocolMocks = vi.mocked(protocolService);

describe('Backend API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('responde el health check correctamente', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('SportMetric Academic');
    expect(response.body.timestamp).toBeTypeOf('string');
  });

  it('devuelve categorías con la estructura estándar de respuesta', async () => {
    categoryMocks.getCategories.mockResolvedValue([
      {
        id: 'composicion-corporal',
        title: 'Composición corporal',
        description: 'Descripción de prueba',
        icon: 'Activity',
        color: 'bg-teal-accent',
        order: 1,
      },
    ]);

    const response = await request(app)
      .get('/api/categories')
      .set('Origin', 'http://localhost:5173');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe('composicion-corporal');
  });

  it('retorna 404 cuando una categoría no existe', async () => {
    categoryMocks.getCategory.mockResolvedValue(null);

    const response = await request(app).get('/api/categories/no-existe');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('devuelve protocolos filtrados por categoría', async () => {
    protocolMocks.getProtocolsByCategory.mockResolvedValue([
      {
        id: 'medicion-del-peso',
        categoryId: 'composicion-corporal',
        order: 2,
        title: 'Medición del peso',
        objective: 'Objetivo de prueba',
        description: 'Descripción de prueba',
      },
    ]);

    const response = await request(app).get('/api/categories/composicion-corporal/protocols');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].categoryId).toBe('composicion-corporal');
  });

  it('devuelve el detalle de un protocolo existente', async () => {
    protocolMocks.getProtocol.mockResolvedValue({
      id: 'medicion-del-peso',
      categoryId: 'composicion-corporal',
      order: 2,
      title: 'Medición del peso',
      objective: 'Objetivo de prueba',
      description: 'Descripción de prueba',
      materials: [
        {
          name: 'Báscula',
          imageUrl: '/assets/bascula.webp',
          order: 1,
        },
      ],
      checklistItems: [
        {
          text: 'Verificar calibración',
          order: 1,
        },
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Paso 1',
          description: 'Descripción del paso',
          videoUrl: '/assets/paso-1.mp4',
          order: 1,
        },
      ],
      interruptionCrit: [
        {
          text: 'Suspender ante mareo',
          order: 1,
        },
      ],
      dataRegistry: {
        title: 'Registro de datos',
        description: 'Descripción del registro',
        unit: 'kg',
      },
    });

    const response = await request(app).get('/api/protocols/medicion-del-peso');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe('medicion-del-peso');
    expect(response.body.data.materials).toHaveLength(1);
  });

  it('retorna 404 cuando un protocolo no existe', async () => {
    protocolMocks.getProtocol.mockResolvedValue(null);

    const response = await request(app).get('/api/protocols/no-existe');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('PROTOCOL_NOT_FOUND');
  });
});
