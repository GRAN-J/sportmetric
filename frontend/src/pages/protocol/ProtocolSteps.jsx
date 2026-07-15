import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListOrdered, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

// Sección "Paso a paso" de un protocolo.
// - Muestra un paso a la vez con soporte visual (marcador de posición de video por ahora).
// - Permite navegar entre pasos dentro de la misma sección.
const ProtocolSteps = ({ protocol }) => {
  // Índice del paso actual (0-based).
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Paso actual según el índice.
  const currentStep = protocol.steps[currentStepIndex];
  const [videoHasError, setVideoHasError] = useState(false);

  const placeholderSrc = (() => {
    const safeLabel = String(currentStep?.title || 'Paso').slice(0, 40);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#071629"/>
            <stop offset="1" stop-color="#0b2c2a"/>
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#g)"/>
        <circle cx="980" cy="180" r="160" fill="#2dd4bf" opacity="0.22"/>
        <circle cx="230" cy="590" r="180" fill="#2dd4bf" opacity="0.12"/>
        <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="800">${safeLabel}</text>
        <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#9ff2e2" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">Recurso visual pendiente</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  })();

  // Avanza al siguiente paso (si existe).
  const handleNextStep = () => {
    if (currentStepIndex < protocol.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setVideoHasError(false);
    }
  };

  // Retrocede al paso anterior (si existe).
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setVideoHasError(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-primary">
          <ListOrdered size={24} />
          <h2 className="text-2xl font-bold">Guía Paso a Paso</h2>
        </div>
        <div className="flex gap-1">
          {protocol.steps.map((_, idx) => (
            <div 
              key={idx}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentStepIndex ? "w-8 bg-teal-accent" : "w-4 bg-surface-container-highest"
              )}
            />
          ))}
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-outline-variant shadow-card overflow-hidden">
        {/* Video/soporte visual del paso */}
        <div className="aspect-video bg-black relative flex items-center justify-center group">
          {!videoHasError && currentStep.video ? (
            <video
              key={`${currentStepIndex}-${currentStep.video}`}
              src={currentStep.video}
              controls
              preload="metadata"
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={() => setVideoHasError(true)}
              onLoadedData={(e) => {
                const playPromise = e.currentTarget.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                  playPromise.catch(() => {});
                }
              }}
            />
          ) : (
            <>
              <img
                src={placeholderSrc}
                alt={`Soporte visual de ${currentStep.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                  <Play size={32} fill="currentColor" />
                </div>
              </div>
            </>
          )}
          
          {/* Etiqueta de indicador de paso */}
          <div className="absolute top-4 left-4 bg-teal-accent text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg">
            PASO {currentStep.step}
          </div>

          {videoHasError && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-4 text-white">
              <Pause size={20} />
              <div className="flex-1 text-sm font-semibold">
                El video de este paso aun no esta disponible. Se muestra un placeholder temporal.
              </div>
              <RotateCcw size={20} />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-8 space-y-4"
          >
            <h3 className="text-2xl font-bold text-primary">{currentStep.title}</h3>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              {currentStep.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <button
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          aria-label="Ir al paso anterior"
          className="w-12 h-12 rounded-full border border-outline-variant bg-white text-primary flex items-center justify-center shadow-sm transition-all hover:border-teal-accent hover:text-teal-accent hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:border-outline-variant disabled:hover:text-primary disabled:hover:translate-y-0"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="min-w-[140px] px-5 py-2.5 rounded-full bg-surface-container-low border border-outline-subtle text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            Navegacion del paso
          </p>
          <p className="text-sm font-bold text-primary">
            Paso {currentStepIndex + 1} de {protocol.steps.length}
          </p>
        </div>

        <button
          onClick={handleNextStep}
          disabled={currentStepIndex === protocol.steps.length - 1}
          aria-label="Ir al siguiente paso"
          className="w-12 h-12 rounded-full border border-teal-accent bg-teal-accent text-white flex items-center justify-center shadow-[0px_6px_18px_rgba(45,212,191,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0px_10px_24px_rgba(45,212,191,0.24)] disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-[0px_6px_18px_rgba(45,212,191,0.18)]"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProtocolSteps;
