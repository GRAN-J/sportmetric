import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListOrdered, ArrowRight, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

// Sección "Paso a paso" de un protocolo.
// - Muestra un paso a la vez con soporte visual (marcador de posición de video por ahora).
// - Permite navegar entre pasos dentro de la misma sección.
const ProtocolSteps = ({ protocol }) => {
  // Índice del paso actual (0-based).
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Paso actual según el índice.
  const currentStep = protocol.steps[currentStepIndex];

  // Avanza al siguiente paso (si existe).
  const handleNextStep = () => {
    if (currentStepIndex < protocol.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Retrocede al paso anterior (si existe).
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
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
        {/* Video/soporte visual del paso (marcador de posición) */}
        <div className="aspect-video bg-black relative flex items-center justify-center group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <Play size={32} fill="currentColor" />
            </div>
          </div>
          
          {/* Etiqueta de indicador de paso */}
          <div className="absolute top-4 left-4 bg-teal-accent text-white px-4 py-1.5 rounded-full text-sm font-black shadow-lg">
            PASO {currentStep.step}
          </div>

          {/* Controles de video (marcador de posición, solo visual) */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Pause size={20} />
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-teal-accent" />
            </div>
            <RotateCcw size={20} />
          </div>
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

      <div className="flex gap-4">
        <button 
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-30 disabled:translate-y-0"
        >
          <ArrowLeft size={20} />
          Paso Anterior
        </button>
        <button 
          onClick={handleNextStep}
          disabled={currentStepIndex === protocol.steps.length - 1}
          className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-30 disabled:translate-y-0"
        >
          Siguiente Paso
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProtocolSteps;
