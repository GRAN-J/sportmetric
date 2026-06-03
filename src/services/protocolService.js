const protocolModules = import.meta.glob('../data/protocols/*.json', { eager: true });
const allProtocolObjects = Object.values(protocolModules)
  .map((m) => (m?.default ? m.default : m))
  .filter((p) => p && typeof p.order === 'number' && p.id && p.title && p.category);

const protocolListSorted = allProtocolObjects
  .slice()
  .sort((a, b) => (a.category.localeCompare(b.category) || a.order - b.order));

const protocolById = new Map(protocolListSorted.map((p) => [p.id, p]));
const protocolMetaSorted = protocolListSorted.map((p) => ({
  id: p.id,
  title: p.title,
  category: p.category,
  summary: p.objective || '',
  order: p.order,
}));

export const getProtocolsByCategory = (categoryId) => {
  if (categoryId === 'all') return protocolMetaSorted;
  return protocolMetaSorted.filter((p) => p.category === categoryId);
};

export const getNextProtocolId = (currentProtocolId, categoryId) => {
  const list = getProtocolsByCategory(categoryId);
  const idx = list.findIndex((p) => p.id === currentProtocolId);
  if (idx !== -1 && idx < list.length - 1) return list[idx + 1].id;
  return null;
};

export const getProtocolById = async (protocolId) => {
  return protocolById.get(protocolId) || null;
};
