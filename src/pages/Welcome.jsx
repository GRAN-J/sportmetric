import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Library, Verified, BarChart3 } from 'lucide-react';

// Pantalla de bienvenida (entrada al flujo oficial).
// - Presenta la identidad de SportMetric Academic.
// - Dirige a Categorías o a la lista global de Protocolos.
const Welcome = () => {
  const navigate = useNavigate();
  const mascotPlaceholder = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#071629"/>
          <stop offset="1" stop-color="#0b2c2a"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" rx="48" fill="url(#g)"/>
      <circle cx="430" cy="170" r="90" fill="#2dd4bf" opacity="0.25"/>
      <circle cx="170" cy="420" r="110" fill="#2dd4bf" opacity="0.18"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#2dd4bf" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700">Mascota</text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600">SportMetric</text>
    </svg>
  `)}`;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-20">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-secondary-fixed/10 blur-[80px]" />
      </div>

      <main className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
        {/* Sección de contenido */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col items-start gap-10 order-2 md:order-1 text-center md:text-left"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-medium text-sm border border-secondary-fixed">
              <GraduationCap size={16} />
              Investigación Académica
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight">
              Bienvenido a <span className="text-teal-accent">SportMetric</span>
            </h1>
            
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed">
              Plataforma digital para consulta de protocolos de medición física y antropométrica. 
              Diseñada para establecer estándares precisos en la investigación deportiva y la evaluación de atletas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
              onClick={() => navigate('/categories')}
              className="bg-teal-accent text-white font-bold px-8 py-4 rounded-2xl shadow-[0px_4px_20px_rgba(45,212,191,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Comenzar
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/category/all')}
              className="bg-transparent border-[1.5px] border-primary text-primary font-bold px-8 py-4 rounded-2xl hover:bg-surface-container-low transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Library size={20} />
              Ver Protocolos
            </button>
          </div>

          {/* Indicadores / Insignias */}
          <div className="pt-10 border-t border-outline-subtle w-full flex flex-wrap items-center gap-6 opacity-80 justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <Verified size={18} className="text-outline" />
              <span className="text-sm font-medium text-outline">Precisión Validada</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-outline-subtle" />
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-outline" />
              <span className="text-sm font-medium text-outline">Datos Estandarizados</span>
            </div>
          </div>
        </motion.div>

        {/* Sección de mascota (marcador de posición temporal mientras llegan los assets reales) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 flex justify-center items-center order-1 md:order-2 w-full max-w-md md:max-w-none relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-accent/10 to-primary-fixed/20 rounded-full blur-3xl -z-10 transform scale-110" />
          <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
            {/* Marcador de posición de mascota basado en el estilo del mockup */}
            <img 
              alt="Mascota guía de SportMetric" 
              className="w-full h-auto object-contain drop-shadow-2xl z-10" 
              src={mascotPlaceholder}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Welcome;
