import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Check } from 'lucide-react';
import { clsx } from 'clsx';

// Sección "Lista de verificación" del protocolo.
// - Checklist operativo para uso en evaluaciones reales.
// - Mantiene interacción rápida (tap/click) y estados visuales claros.
const ProtocolChecklist = ({ protocol }) => {
  // Estado local por índice para controlar checks.
  const [checkedItems, setCheckedItems] = useState({});

  // Alterna el estado del ítem seleccionado.
  const toggleItem = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <div className="flex items-center gap-3 text-primary">
          <ClipboardCheck size={24} />
          <h2 className="text-2xl font-bold">Lista de Verificación</h2>
        </div>
        <p className="text-on-surface-variant">Confirma cada punto para garantizar la validez científica.</p>
      </header>

      <div className="space-y-3">
        {protocol.checklist.map((item, index) => (
          <div 
            key={index}
            onClick={() => toggleItem(index)}
            className={clsx(
              "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer select-none shadow-sm hover:shadow-md",
              checkedItems[index] 
                ? "bg-secondary-container/30 border-secondary text-secondary" 
                : "bg-white border-outline-variant text-on-surface"
            )}
          >
            <div className={clsx(
              "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
              checkedItems[index]
                ? "bg-secondary border-secondary text-white scale-110"
                : "border-outline-variant bg-white"
            )}>
              {checkedItems[index] && <Check size={20} strokeWidth={3} />}
            </div>
            <span className={clsx(
              "text-lg font-medium leading-tight",
              checkedItems[index] && "opacity-70 line-through decoration-2"
            )}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProtocolChecklist;
