import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';

const ProtocolInterruption = ({ protocol }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <div className="flex items-center gap-3 text-error">
          <ShieldAlert size={24} />
          <h2 className="text-2xl font-bold">Criterios de Interrupción</h2>
        </div>
        <p className="text-on-surface-variant">Detén el protocolo inmediatamente si se presenta alguna de estas situaciones.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {protocol.interruptionCriteria.map((criterion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-error-container/20 border border-error/20 rounded-2xl p-4 flex items-start gap-4"
          >
            <div className="bg-error/10 p-2 rounded-lg text-error shrink-0">
              <AlertTriangle size={18} />
            </div>
            <span className="text-on-error-container font-medium">{criterion}</span>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-subtle space-y-3">
        <h4 className="font-bold text-primary flex items-center gap-2">
          <ShieldAlert size={18} className="text-secondary" />
          Protocolo de Seguridad
        </h4>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Como evaluador, su prioridad es la integridad física del evaluado. Ante cualquier duda sobre la seguridad, suspenda la medición y reporte las observaciones en la sección final.
        </p>
      </div>
    </motion.div>
  );
};

export default ProtocolInterruption;
