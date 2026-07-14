import {
  getNextProtocolId,
  getProtocolById,
  getProtocolsByCategory,
} from './protocolService';

describe('protocolService en modo local', () => {
  it('devuelve el detalle de un protocolo conocido', async () => {
    const protocol = await getProtocolById('medicion-del-peso');

    expect(protocol).not.toBeNull();
    expect(protocol.id).toBe('medicion-del-peso');
    expect(protocol.materials.length).toBeGreaterThan(0);
    expect(protocol.steps.length).toBeGreaterThan(0);
  });

  it('lista todos los protocolos de una categoría conservando el id de categoría', async () => {
    const protocols = await getProtocolsByCategory('composicion-corporal');

    expect(protocols.length).toBeGreaterThan(0);
    expect(protocols.every((protocol) => protocol.category === 'composicion-corporal')).toBe(true);
  });

  it('permite navegar al siguiente protocolo dentro de la misma categoría', async () => {
    const nextProtocolId = await getNextProtocolId('medicion-del-peso', 'composicion-corporal');

    expect(nextProtocolId).toBe('medicion-del-perimetro-de-cintura');
  });

  it('retorna null cuando el protocolo consultado no existe', async () => {
    const protocol = await getProtocolById('protocolo-inexistente');

    expect(protocol).toBeNull();
  });
});
