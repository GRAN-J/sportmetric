import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, FileText, Download, Search, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudentHistory } from '../services/formService';
// OPTIMIZACION: jspdf y jspdf-autotable suman ~350 KB al bundle. Se cargan
// de forma diferida SOLO cuando el usuario hace clic en "Descargar PDF" o
// "Exportar CSV", evitando penalizar la primera carga de esta pagina y
// de las paginas que la referencian. El CSV no requiere jspdf, pero vive
// en el mismo modulo para mantener cohesion (un solo chunk de export).

const EvaluationHistory = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProtocol, setFilterProtocol] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getStudentHistory(studentId || 'student-123'); // Fallback para pruebas
        setHistory(data);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [studentId]);

  const filteredHistory = history.filter(ev => {
    const matchesSearch = ev.protocol.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterProtocol === 'all' || ev.protocolId === filterProtocol;
    return matchesSearch && matchesFilter;
  });

  const uniqueProtocols = Array.from(new Set(history.map(ev => ev.protocolId))).map(id => {
    return { id, title: history.find(ev => ev.protocolId === id).protocol.title };
  });

  // OPTIMIZACION: handlers async con dynamic import. Vite genera un chunk
  // aparte para exportUtils (con jspdf y jspdf-autotable) que solo se
  // descarga cuando el usuario hace clic en uno de los botones.
  const handleExportCSV = async () => {
    const { exportEvaluationsToCSV } = await import('../shared/utils/exportUtils');
    exportEvaluationsToCSV(filteredHistory);
  };

  const handleExportPDF = async (evaluation) => {
    const { exportEvaluationToPDF } = await import('../shared/utils/exportUtils');
    exportEvaluationToPDF(evaluation);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-teal-700">
          <History size={32} />
          <h1 className="text-3xl font-bold">Historial de Evaluaciones</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            Exportar Excel (CSV)
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por protocolo..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none appearance-none"
            value={filterProtocol}
            onChange={(e) => setFilterProtocol(e.target.value)}
          >
            <option value="all">Todos los protocolos</option>
            {uniqueProtocols.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      {loading ? (
        <div className="text-center py-20">Cargando historial...</div>
      ) : filteredHistory.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Protocolo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Resultados</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((ev) => (
                <motion.tr 
                  key={ev.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-teal-50/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(ev.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{ev.protocol.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ev.results).map(([key, val]) => (
                        <span key={key} className="bg-gray-100 px-2 py-1 rounded text-[10px] font-medium text-gray-600">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleExportPDF(ev)}
                      className="text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-100 transition-colors"
                      title="Descargar Ficha Técnica PDF"
                    >
                      <FileText size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No se encontraron evaluaciones registradas.</p>
        </div>
      )}
    </div>
  );
};

export default EvaluationHistory;
