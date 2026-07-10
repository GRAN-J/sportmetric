import { motion } from 'framer-motion';
import { Info, PlayCircle } from 'lucide-react';

// Sección "Descripción" del protocolo.
// - Presenta el texto base del procedimiento.
// - Soporta media opcional (imagen o video). Mientras llegan assets finales, usa marcador de posición.
const ProtocolDescription = ({ protocol }) => {
  const placeholderSrc = (() => {
    const safeLabel = String(protocol?.title || 'Protocolo').slice(0, 60);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#071629"/>
            <stop offset="1" stop-color="#0b2c2a"/>
          </linearGradient>
        </defs>
        <rect width="800" height="450" rx="32" fill="url(#g)"/>
        <circle cx="620" cy="120" r="110" fill="#2dd4bf" opacity="0.22"/>
        <circle cx="160" cy="360" r="140" fill="#2dd4bf" opacity="0.14"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800">${safeLabel}</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <div className="flex items-center gap-3 text-primary">
          <Info size={24} />
          <h2 className="text-2xl font-bold">Descripción General</h2>
        </div>
        <p className="text-on-surface-variant">Contexto y bases técnicas del procedimiento.</p>
      </header>

      <div className="bg-white rounded-3xl border border-outline-variant shadow-card overflow-hidden">
        {/* Sección multimedia (imagen o video opcional) */}
        <div className="aspect-video bg-primary-container relative flex items-center justify-center group cursor-pointer">
          {protocol.video ? (
            <>
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors" />
              <PlayCircle size={64} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
              <div className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase tracking-widest bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                Video Demostrativo
              </div>
            </>
          ) : (
            <img 
              src={protocol.image || placeholderSrc} 
              alt={protocol.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = placeholderSrc;
              }}
            />
          )}
        </div>

        <div className="p-8 space-y-4">
          <h3 className="text-xl font-bold text-primary">Procedimiento Estándar</h3>
          <p className="text-on-surface-variant leading-relaxed text-lg">
            {protocol.description}
          </p>
          
          <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-subtle flex gap-4 items-start">
            <div className="bg-teal-accent/10 p-2 rounded-lg text-teal-accent">
              <Info size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Nota Técnica</p>
              <p className="text-sm text-on-surface-variant italic">
                Asegure la correcta alineación siguiendo los puntos anatómicos descritos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProtocolDescription;
