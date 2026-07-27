// =============================================================================
// Estadísticas y Reportes - Panel Administrativo
// =============================================================================
// Visualización de métricas con Recharts usando datos reales del backend.
// =============================================================================

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Activity,
  TrendingUp,
  Layers,
  FileText,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getSummary, getActivity, getTopProtocols } from '../../services/analyticsService';
import { apiGet } from '../../services/apiClient';
import Toast from '../../components/Toast';

const COLORS = ['#0d9488', '#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#6366f1'];

const StatCard = ({ label, value, icon: Icon, color, index }) => (
  <div
    style={{ animationDelay: `${index * 60}ms` }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2"
  >
    <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const Statistics = () => {
  const [summary, setSummary] = useState({ users: 0, protocols: 0, evaluations: 0, categories: 0 });
  const [activity, setActivity] = useState([]);
  const [topProtocols, setTopProtocols] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const controller = new AbortController();

    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');
        const [summaryData, activityData, topData, evalData] = await Promise.all([
          getSummary({ signal: controller.signal }),
          getActivity({ signal: controller.signal }),
          getTopProtocols({ signal: controller.signal }),
          apiGet('/api/evaluations', { signal: controller.signal }),
        ]);
        setSummary(summaryData || { users: 0, protocols: 0, evaluations: 0, categories: 0 });
        setActivity(Array.isArray(activityData) ? activityData : []);
        setTopProtocols(Array.isArray(topData) ? topData : []);
        setEvaluations(Array.isArray(evalData) ? evalData : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'No fue posible cargar las estadísticas.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    return () => controller.abort();
  }, []);

  const handleExportCSV = () => {
    if (evaluations.length === 0) {
      setToast({ message: 'No hay evaluaciones para exportar.', type: 'error' });
      return;
    }
    const headers = ['ID', 'Protocolo', 'Sujeto', 'ID Estudiante', 'Evaluador', 'Fecha', 'Puntuación'];
    const rows = evaluations.map((e) => [
      e.id,
      e.protocol?.title || e.protocolId || '',
      e.results?.evaluado || '',
      e.results?.id_estudiante || '',
      e.results?.evaluador || '',
      e.date || e.createdAt || '',
      '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evaluaciones-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: 'CSV exportado correctamente.', type: 'success' });
  };

  const statCards = [
    { label: 'Usuarios', value: summary.users, icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Protocolos', value: summary.protocols, icon: FileText, color: 'bg-teal-500' },
    { label: 'Categorías', value: summary.categories, icon: Layers, color: 'bg-purple-500' },
    { label: 'Evaluaciones', value: summary.evaluations, icon: Activity, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-teal-600" size={32} />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-teal-600" size={32} />
            Estadísticas y Reportes
          </h1>
          <p className="text-gray-500 mt-1">Visualiza el uso y rendimiento del sistema en tiempo real.</p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
        >
          <Download size={20} />
          Exportar Evaluaciones (CSV)
        </button>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Activity size={20} className="text-teal-600" />
            Evaluaciones por Mes
          </h3>
          {activity.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Aún no hay evaluaciones registradas.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  cursor={{ fill: 'rgba(13, 148, 136, 0.05)' }}
                />
                <Bar dataKey="total" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-blue-600" />
            Distribución por Protocolo
          </h3>
          {topProtocols.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Sin datos suficientes para mostrar.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topProtocols}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.name}
                  labelLine={false}
                >
                  {topProtocols.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
          <FileText size={20} className="text-purple-600" />
          Evaluaciones Recientes
        </h3>
        {evaluations.length === 0 ? (
          <div className="py-12 text-center text-gray-400">Sin evaluaciones registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Protocolo</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Sujeto</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {evaluations.slice(0, 10).map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm font-mono text-gray-500">{String(evaluation.id).substring(0, 8)}</td>
                    <td className="py-3 text-sm text-gray-900">{evaluation.protocol?.title || evaluation.protocolId || '—'}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {evaluation.results?.evaluado || '—'}
                      {evaluation.results?.id_estudiante && (
                        <span className="ml-2 text-[10px] text-gray-400">#{evaluation.results.id_estudiante}</span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {evaluation.date ? new Date(evaluation.date).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
};

export default Statistics;
