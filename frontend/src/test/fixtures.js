export const categoryFixture = {
  id: 'composicion-corporal',
  title: 'Composición corporal',
  description: 'Evaluaciones antropométricas y de composición corporal.',
  icon: 'Activity',
  color: 'bg-teal-accent',
  order: 1,
};

export const protocolListFixture = [
  {
    id: 'medicion-del-peso',
    title: 'Medición del peso',
    category: 'composicion-corporal',
    summary: 'Registro del peso corporal.',
    order: 1,
  },
  {
    id: 'medicion-del-perimetro-de-cintura',
    title: 'Medición del perímetro de cintura',
    category: 'composicion-corporal',
    summary: 'Registro del perímetro de cintura.',
    order: 2,
  },
];

export const protocolDetailFixture = {
  id: 'medicion-del-peso',
  title: 'Medición del peso',
  category: 'composicion-corporal',
  order: 1,
  objective: 'Realizar una medición precisa del peso corporal.',
  description: 'Se realiza con báscula calibrada y ropa ligera.',
  materials: [
    {
      name: 'Báscula SECA',
      image: '/assets/placeholders/bascula.webp',
      order: 1,
    },
  ],
  checklist: [
    'Verificar calibración',
    'Confirmar lectura en cero',
  ],
  steps: [
    {
      step: 1,
      title: 'Paso 1',
      description: 'Preparar al estudiante.',
      video: '/assets/placeholders/paso-1.mp4',
      order: 1,
    },
    {
      step: 2,
      title: 'Paso 2',
      description: 'Registrar la medición.',
      video: '/assets/placeholders/paso-2.mp4',
      order: 2,
    },
  ],
  interruptionCriteria: [
    'Suspender si el estudiante presenta mareo.',
  ],
  dataRegistry: {
    title: 'Registro de datos',
    description: 'Registrar ambas mediciones y observaciones.',
    unit: 'kg',
  },
};
