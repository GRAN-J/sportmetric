import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProtocolsByCategory } from '../services/protocolService';
import { getCategories } from '../services/categoryService';
import { ArrowLeft, ChevronRight, Search, FileText, X } from 'lucide-react';

const ProtocolCard = ({ protocol, index, onClick }) => {
  return (
    <motion.div
      key={protocol.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group bg-white rounded-xl border border-outline-variant p-5 shadow-card hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <FileText size={24} />
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-primary group-hover:text-teal-accent transition-colors">
          {protocol.title}
        </h3>
        <p className="text-sm text-on-surface-variant line-clamp-1">
          {protocol.summary || ''}
        </p>
      </div>

      <ChevronRight size={20} className="text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </motion.div>
  );
};

// Lista de protocolos por categoría.
// - Permite buscar por título o resumen.
// - Respeta el diseño de tarjetas académicas definido en design.md.
const ProtocolList = () => {
  // Categoría seleccionada desde la URL.
  const { categoryId } = useParams();
  const navigate = useNavigate();
  // Texto de búsqueda (filtrado local).
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [categoriesData, protocolsData] = await Promise.all([
          getCategories({ signal: controller.signal }),
          getProtocolsByCategory(categoryId, { signal: controller.signal }),
        ]);

        setCategories(categoriesData);
        setProtocols(protocolsData);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }
        setError(loadError.message || 'No fue posible cargar los protocolos.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, [categoryId]);

  // Datos de la categoría (para título/encabezado).
  const category = categories.find(c => c.id === categoryId);

  // Filtra por coincidencia en título o resumen (case-insensitive).
  const filteredProtocols = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return protocols;
    return protocols.filter((protocol) => {
      const title = String(protocol.title || '').toLowerCase();
      const summary = String(protocol.summary || '').toLowerCase();
      return title.includes(q) || summary.includes(q);
    });
  }, [protocols, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-teal-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-bold">Cargando protocolos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-3xl border border-error/20 bg-error-container/10 p-8">
        <h1 className="text-2xl font-bold text-primary">No fue posible cargar los protocolos</h1>
        <p className="text-on-surface-variant">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate('/categories')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm w-fit"
        >
          <ArrowLeft size={16} />
          Volver a categorías
        </button>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            {category ? category.title : 'Todos los Protocolos'}
          </h1>
          <p className="text-on-surface-variant">
            {filteredProtocols.length} {filteredProtocols.length === 1 ? 'protocolo encontrado' : 'protocolos encontrados'} en esta categoría.
          </p>
        </div>
      </div>

      {/* Barra de búsqueda (según design.md) */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-teal-accent transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Buscar protocolos por nombre o palabra clave..." 
          className="w-full bg-white border-2 border-outline-variant rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-teal-accent transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          // Limpia el texto de búsqueda sin recargar la página.
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-error transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProtocols.length > 0 ? (
          filteredProtocols.map((protocol, index) => (
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              index={index}
              onClick={() => navigate(`/protocol/${protocol.id}/objective`)}
            />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
              <Search size={32} />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-primary">No se encontraron resultados</p>
              <p className="text-sm text-on-surface-variant">Prueba con otra palabra clave o explora las categorías.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolList;
