import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

// Sección "Objetivo" del protocolo.
// - Muestra la intención/propósito del procedimiento de medición.
const ProtocolObjective = ({ protocol }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-3xl p-8 border border-outline-variant shadow-card space-y-6 text-center">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary">
          <Target size={40} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Objetivo del Protocolo</h2>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg mx-auto">
            {protocol.objective}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProtocolObjective;
