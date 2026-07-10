import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

// Sección "Materiales" del protocolo.
// - Renderiza una grilla de tarjetas con los materiales requeridos.
// - Usa placeholders cuando los assets reales aún no existen.
const ProtocolMaterials = ({ protocol }) => {
  const placeholderSrcFor = (label) => {
    const safeLabel = String(label || 'Recurso').slice(0, 80);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#eceef0"/>
            <stop offset="1" stop-color="#e0e3e5"/>
          </linearGradient>
        </defs>
        <rect width="400" height="400" rx="24" fill="url(#g)"/>
        <circle cx="290" cy="120" r="70" fill="#2dd4bf" opacity="0.18"/>
        <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#071629" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">${safeLabel}</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
          <Briefcase size={24} />
          <h2 className="text-2xl font-bold">Materiales Necesarios</h2>
        </div>
        <p className="text-on-surface-variant">Asegúrate de contar con todos los elementos antes de iniciar.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {protocol.materials.map((material, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-4 border border-outline-variant shadow-sm flex flex-col items-center text-center gap-3 group hover:border-teal-accent transition-colors"
          >
            <div className="w-full aspect-square bg-surface-container rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src={material.image} 
                alt={material.name}
                className="w-2/3 h-2/3 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.src = placeholderSrcFor(material.name);
                }}
              />
            </div>
            <span className="text-sm font-bold text-primary leading-tight">{material.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProtocolMaterials;
