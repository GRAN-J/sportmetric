// =============================================================================
// Servicio de Analítica
// =============================================================================

import prisma from '../../../config/database';

/**
 * Obtiene estadísticas generales del sistema
 */
export async function getGeneralStats() {
  const [userCount, protocolCount, evaluationCount, categoryCount] = await Promise.all([
    prisma.user.count(),
    prisma.protocol.count(),
    prisma.evaluation.count(),
    prisma.category.count(),
  ]);

  return {
    users: userCount,
    protocols: protocolCount,
    evaluations: evaluationCount,
    categories: categoryCount,
  };
}

/**
 * Obtiene la actividad de evaluaciones por mes (últimos 6 meses)
 */
export async function getEvaluationsByMonth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const evaluations = await prisma.evaluation.findMany({
    where: {
      date: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      date: true,
    },
  });

  // Agrupar por mes
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const stats: Record<string, number> = {};

  evaluations.forEach(ev => {
    const month = months[ev.date.getMonth()];
    stats[month] = (stats[month] || 0) + 1;
  });

  return Object.entries(stats).map(([name, total]) => ({ name, total }));
}

/**
 * Obtiene el top de protocolos más utilizados
 */
export async function getTopProtocols() {
  const stats = await prisma.evaluation.groupBy({
    by: ['protocolId'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 5,
  });

  // Obtener nombres de protocolos
  const protocolIds = stats.map(s => s.protocolId);
  const protocols = await prisma.protocol.findMany({
    where: {
      id: { in: protocolIds },
    },
    select: {
      id: true,
      title: true,
    },
  });

  return stats.map(s => ({
    name: protocols.find(p => p.id === s.protocolId)?.title || s.protocolId,
    value: s._count.id,
  }));
}
