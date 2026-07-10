import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Save, User, Calculator, ClipboardEdit, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

// Sección "Registro de datos" del protocolo.
// - Presenta el registro como instrumento/panel académico (no como formulario genérico).
// - Incluye doble medición y cálculo automático de promedio.
// - Muestra estado de guardado (simulado por ahora).
const ProtocolDataRegistry = ({ protocol }) => {
  // Campos principales del registro.
  const [formData, setFormData] = useState({
    subjectName: '',
    evaluatorName: '',
    measure1: '',
    measure2: '',
    observations: ''
  });
  
  // Promedio calculado (derivado de medida 1 y 2).
  const [average, setAverage] = useState(0);
  // Estado visual de guardado (simulación).
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Recalcula el promedio cada vez que cambia una medida.
    const m1 = parseFloat(formData.measure1);
    const m2 = parseFloat(formData.measure2);
    if (!isNaN(m1) && !isNaN(m2)) {
      setAverage(((m1 + m2) / 2).toFixed(2));
    } else {
      setAverage(0);
    }
  }, [formData.measure1, formData.measure2]);

  const handleSave = (e) => {
    e.preventDefault();
    // Simulación: marca como guardado por 3 segundos.
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
          <Database size={24} />
          <h2 className="text-2xl font-bold">Instrumento de Registro</h2>
        </div>
        <p className="text-on-surface-variant">Ingrese los datos técnicos recolectados durante la evaluación.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Panel académico / instrumento de registro */}
        <div className="bg-white rounded-3xl border border-outline-variant shadow-card overflow-hidden">
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardEdit size={20} className="text-teal-accent" />
              <span className="font-bold text-sm uppercase tracking-widest">Ficha Técnica de Evaluación</span>
            </div>
            <div className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/20 uppercase">
              ID: {protocol.id.toUpperCase()}
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Datos del evaluado y del evaluador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <User size={14} />
                  Nombre del Evaluado
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-teal-accent py-3 px-1 outline-none transition-all font-medium text-primary"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                  <User size={14} />
                  Nombre del Evaluador
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Nombre del docente o técnico"
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-teal-accent py-3 px-1 outline-none transition-all font-medium text-primary"
                  value={formData.evaluatorName}
                  onChange={(e) => setFormData({...formData, evaluatorName: e.target.value})}
                />
              </div>
            </div>

            {/* Medidas (doble registro) + promedio calculado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Medición 1 ({protocol.dataRegistry?.unit || 'm'})</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-surface-container-low border-2 border-outline-variant rounded-2xl py-4 px-4 focus:border-teal-accent outline-none transition-all font-bold text-2xl text-primary text-center"
                    value={formData.measure1}
                    onChange={(e) => setFormData({...formData, measure1: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Medición 2 ({protocol.dataRegistry?.unit || 'm'})</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full bg-surface-container-low border-2 border-outline-variant rounded-2xl py-4 px-4 focus:border-teal-accent outline-none transition-all font-bold text-2xl text-primary text-center"
                  value={formData.measure2}
                  onChange={(e) => setFormData({...formData, measure2: e.target.value})}
                />
              </div>
              <div className="bg-primary-container/30 rounded-3xl p-4 flex flex-col items-center justify-center border border-primary/10">
                <span className="text-[10px] font-black text-on-primary-container uppercase tracking-[0.2em] mb-1">Promedio Final</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-primary">{average}</span>
                  <span className="text-sm font-bold text-primary/60">{protocol.dataRegistry?.unit || 'm'}</span>
                </div>
                <Calculator size={16} className="mt-2 text-primary/40" />
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2 pt-4">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Observaciones Técnicas</label>
              <textarea 
                rows="3"
                placeholder="Indique cualquier anomalía o condición especial durante la medición..."
                className="w-full bg-surface-container-low border-2 border-outline-variant rounded-2xl py-4 px-4 focus:border-teal-accent outline-none transition-all text-on-surface"
                value={formData.observations}
                onChange={(e) => setFormData({...formData, observations: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-surface-container-highest p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <div className={clsx(
                "w-2 h-2 rounded-full",
                isSaved ? "bg-secondary animate-pulse" : "bg-outline-variant"
              )} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isSaved ? 'Registro Guardado' : 'Esperando Validación'}
              </span>
            </div>
            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-secondary font-bold text-xs"
              >
                <CheckCircle2 size={16} />
                Validado con éxito
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 px-12"
          >
            <Save size={20} />
            Guardar Datos Localmente
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProtocolDataRegistry;
