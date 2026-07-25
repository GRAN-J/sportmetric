// =============================================================================
// Sección "Registro de datos" del protocolo
// =============================================================================
// Renderiza el DynamicForm con el esquema devuelto por el backend.
// El backend ya garantiza que la Ficha Técnica base (Nombre del evaluado,
// Nombre del evaluador, Medición 1, Medición 2, Promedio, Observaciones)
// está SIEMPRE presente, seguida de los campos personalizados del admin.
// =============================================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, ClipboardEdit, Loader2 } from 'lucide-react';
import DynamicForm from '../../components/DynamicForm';
import { getFormSchema } from '../../services/formService';

const ProtocolDataRegistry = ({ protocol }) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadSchema = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getFormSchema(protocol.id, { signal: controller.signal });
        setSchema(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('No se pudo cargar la estructura del formulario.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (protocol?.id) loadSchema();
    return () => controller.abort();
  }, [protocol?.id]);

  const handleSaveSuccess = () => {
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
        <p className="text-on-surface-variant">
          Complete la ficha técnica con los datos recolectados.
        </p>
      </header>

      <div className="bg-white rounded-3xl border border-outline-variant shadow-card overflow-hidden">
        <div className="bg-primary p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardEdit size={20} className="text-teal-accent" />
            <span className="font-bold text-sm uppercase tracking-widest">
              Ficha Técnica: {protocol.title}
            </span>
          </div>
          <div className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/20 uppercase">
            ID: {protocol.id.toUpperCase()}
          </div>
        </div>

        <div className="p-6">
          {isSaved ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-2xl text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <ClipboardEdit size={32} />
              </div>
              <h3 className="text-xl font-bold">¡Registro Guardado!</h3>
              <p>Los datos han sido almacenados correctamente en el sistema.</p>
              <button
                onClick={() => setIsSaved(false)}
                className="text-sm font-bold text-green-600 hover:underline"
              >
                Realizar otra medición
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-teal-600" size={32} />
              <p>Cargando instrumento...</p>
            </div>
          ) : error || !schema ? (
            <div className="text-center py-12 text-red-500">
              {error || 'No fue posible cargar el instrumento de registro.'}
            </div>
          ) : (
            <DynamicForm
              protocolId={protocol.id}
              schema={schema}
              onSaveSuccess={handleSaveSuccess}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProtocolDataRegistry;
