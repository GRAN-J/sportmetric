import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { getProtocolById, getNextProtocolId } from '../services/protocolService';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

// Carga diferida de secciones para reducir el bundle inicial
const ProtocolObjective = lazy(() => import('./protocol/ProtocolObjective'));
const ProtocolMaterials = lazy(() => import('./protocol/ProtocolMaterials'));
const ProtocolDescription = lazy(() => import('./protocol/ProtocolDescription'));
const ProtocolChecklist = lazy(() => import('./protocol/ProtocolChecklist'));
const ProtocolSteps = lazy(() => import('./protocol/ProtocolSteps'));
const ProtocolInterruption = lazy(() => import('./protocol/ProtocolInterruption'));
const ProtocolDataRegistry = lazy(() => import('./protocol/ProtocolDataRegistry'));

const SECTION_CANDIDATES = [
  { id: 'objective', label: 'Objetivo', path: 'objective', enabled: () => true },
  {
    id: 'materials',
    label: 'Materiales',
    path: 'materials',
    enabled: (p) => Array.isArray(p?.materials) && p.materials.length > 0,
  },
  { id: 'description', label: 'Descripción', path: 'description', enabled: () => true },
  {
    id: 'checklist',
    label: 'Checklist',
    path: 'checklist',
    enabled: (p) => Array.isArray(p?.checklist) && p.checklist.length > 0,
  },
  {
    id: 'steps',
    label: 'Paso a Paso',
    path: 'steps',
    enabled: (p) => Array.isArray(p?.steps) && p.steps.length > 0,
  },
  {
    id: 'interruption',
    label: 'Interrupción',
    path: 'interruption',
    enabled: (p) => Array.isArray(p?.interruptionCriteria) && p.interruptionCriteria.length > 0,
  },
  {
    id: 'data',
    label: 'Registro',
    path: 'data',
    enabled: (p) => p?.dataRegistry && Object.keys(p.dataRegistry).length > 0,
  },
];

const buildSections = (protocol) => {
  return SECTION_CANDIDATES.filter((s) => s.enabled(protocol)).map(({ id, label, path }) => ({
    id,
    label,
    path,
  }));
};

const ROUTE_COMPONENTS = {
  objective: ProtocolObjective,
  materials: ProtocolMaterials,
  description: ProtocolDescription,
  checklist: ProtocolChecklist,
  steps: ProtocolSteps,
  interruption: ProtocolInterruption,
  data: ProtocolDataRegistry,
};

// Pantalla contenedora del detalle de un protocolo.
// Responsabilidad:
// - Cargar el JSON del protocolo de forma dinámica.
// - Construir el flujo oficial de secciones (omitiendo las que no existan en el JSON).
// - Renderizar la sección actual mediante rutas anidadas.
// - Mantener botones globales de navegación para evitar pantallas sin salida.
const ProtocolDetail = () => {
  // ID del protocolo tomado desde la URL.
  const { protocolId } = useParams();
  // Datos completos del protocolo (JSON).
  const [protocol, setProtocol] = useState(null);
  // Bandera de carga (evita renderizar pantallas vacías mientras se resuelve el JSON).
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextProtocolId, setNextProtocolId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchProtocol = async () => {
      try {
        // Reinicia el estado de carga cada vez que cambia el protocolo.
        setLoading(true);
        setError('');
        const data = await getProtocolById(protocolId, { signal: controller.signal });

        if (!data) {
          setProtocol(null);
          setNextProtocolId(null);
          return;
        }

        setProtocol(data);
        const nextId = await getNextProtocolId(protocolId, data.category, { signal: controller.signal });
        setNextProtocolId(nextId);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }
        setError(loadError.message || 'No fue posible cargar el protocolo.');
        setProtocol(null);
        setNextProtocolId(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProtocol();

    return () => {
      controller.abort();
    };
  }, [protocolId]);

  useEffect(() => {
    // Asegura que cada cambio de sección/protocolo empiece desde arriba (mobile-first).
    window.scrollTo(0, 0);
  }, [protocolId, location.pathname]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-teal-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-on-surface-variant font-bold">Cargando protocolo...</p>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-4 rounded-3xl border border-error/20 bg-error-container/10 p-8">
        <h1 className="text-2xl font-bold text-primary">No fue posible cargar el protocolo</h1>
        <p className="text-on-surface-variant">{error}</p>
      </div>
    );
  }

  if (!protocol) return <div>Protocolo no encontrado</div>;

  const sections = buildSections(protocol);

  // Obtiene la última parte de la ruta para detectar la sección actual (objective/materials/...).
  const currentPath = location.pathname.split('/').filter(Boolean).pop();
  let currentIndex = sections.findIndex(s => s.path === currentPath);
  
  // Si no se encuentra (por ejemplo, en /protocol/:id/), se asume la primera sección.
  if (currentIndex === -1) currentIndex = 0;

  // Navega a la siguiente sección del flujo dentro del mismo protocolo.
  const goToNext = () => {
    if (currentIndex < sections.length - 1) {
      navigate(`/protocol/${protocolId}/${sections[currentIndex + 1].path}`);
    }
  };

  // Navega a la sección anterior; si está en la primera, vuelve a la lista de la categoría.
  const goToPrev = () => {
    if (currentIndex > 0) {
      navigate(`/protocol/${protocolId}/${sections[currentIndex - 1].path}`);
    } else {
      navigate(`/category/${protocol.category || 'all'}`);
    }
  };

  // Al finalizar la última sección del protocolo, avanza al siguiente protocolo de la misma categoría.
  // Si no existe siguiente protocolo, regresa a Categorías.
  const handleFinish = () => {
    if (nextProtocolId) {
      navigate(`/protocol/${nextProtocolId}/objective`);
    } else {
      navigate('/categories');
    }
  };

  return (
    <div key={protocolId} className="max-w-[800px] mx-auto space-y-6 pb-12">
      {/* Encabezado de progreso del protocolo */}
      {sections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">{protocol.title}</h1>
            <span className="text-xs font-bold text-teal-accent uppercase tracking-widest bg-teal-accent/10 px-3 py-1 rounded-full">
              Sección {currentIndex + 1}/{sections.length}
            </span>
          </div>
          
          {/* Barra de progreso */}
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-teal-accent"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Área de contenido (rutas anidadas por sección) */}
      <div className="min-h-[400px] flex flex-col gap-8">
        {sections.length > 0 ? (
          <>
            <div className="flex-1">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-teal-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-on-surface-variant">Cargando sección...</p>
                </div>
              }>
                <AnimatePresence mode="wait">
                  <Routes key={location.pathname}>
                    {Object.entries(ROUTE_COMPONENTS).map(([path, Component]) => (
                      <Route key={path} path={path} element={<Component protocol={protocol} />} />
                    ))}
                    <Route path="/" element={<Navigate to={sections[0]?.path || 'objective'} replace />} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </div>

            {/* Botones globales de navegación (siempre visibles) */}
            <div className="pt-4 border-t border-outline-variant space-y-4">
              <div className="flex gap-4">
                <button 
                  onClick={goToPrev}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 py-4"
                >
                  <ArrowLeft size={20} />
                  {currentIndex === 0 ? 'Volver al inicio' : 'Anterior'}
                </button>
                <button 
                  onClick={currentIndex === sections.length - 1 ? handleFinish : goToNext}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-4"
                >
                  {currentIndex === sections.length - 1 ? (
                    <>
                      <Check size={20} />
                      {nextProtocolId ? 'Siguiente Protocolo' : 'Finalizar Categoría'}
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => navigate('/categories')}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-subtle bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-all hover:border-teal-accent/40 hover:text-primary hover:bg-white"
                >
                  <ArrowLeft size={16} />
                  Volver a categorías
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolDetail;
