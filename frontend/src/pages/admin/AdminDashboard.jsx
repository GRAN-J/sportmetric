// =============================================================================
// Panel de Administración - Dashboard
// =============================================================================
// Resumen general del sistema con datos en tiempo real desde el backend.
// =============================================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Layers,
  FileText,
  ClipboardCheck,
  Activity,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { getSummary, getActivity, getTopProtocols } from '../../services/analyticsService';

const StatCard = ({ label, value, icon: Icon, color, onClick, index }) => (
  <motion.button
    type="button"
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-teal-200 transition-all text-left w-full cursor-pointer"
  >
    <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, protocols: 0, evaluations: 0, categories: 0 });
  const [activity, setActivity] = useState([]);
  const [topProtocols, setTopProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const [summary, activityData, top] = await Promise.all([
          getSummary({ signal: controller.signal }),
          getActivity({ signal: controller.signal }),
          getTopProtocols({ signal: controller.signal }),
        ]);
        setStats(summary || { users: 0, protocols: 0, evaluations: 0, categories: 0 });
        setActivity(Array.isArray(activityData) ? activityData : []);
        setTopProtocols(Array.isArray(top) ? top : []);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError.message || 'No fue posible cargar el resumen.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => controller.abort();
  }, []);

  const statCards = [
    { label: 'Usuarios Totales', value: stats.users, icon: Users, color: 'bg-blue-500', path: '/admin/users' },
    { label: 'Protocolos Activos', value: stats.protocols, icon: FileText, color: 'bg-teal-500', path: '/admin/protocols' },
    { label: 'Categorías', value: stats.categories, icon: Layers, color: 'bg-purple-500', path: '/admin/categories' },
    { label: 'Evaluaciones Registradas', value: stats.evaluations, icon: ClipboardCheck, color: 'bg-orange-500', path: '/admin/statistics' },
  ];

  // Máximo para escalar las barras de actividad
  const maxActivity = Math.max(1, ...activity.map((a) => a.total));
  // Máximo para escalar las barras de top protocolos
  const maxTop = Math.max(1, ...topProtocols.map((t) => t.value));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500 mt-1">Resumen general del sistema SportMetric Academic.</p>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actividad reciente (mensual) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity size={20} className="text-teal-600" />
              Actividad Mensual
            </h3>
            <button
              type="button"
              onClick={() => navigate('/admin/statistics')}
              className="text-sm text-teal-600 font-bold hover:underline"
            >
              Ver estadísticas
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activity.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                Aún no hay evaluaciones registradas en los últimos 6 meses.
              </p>
            ) : (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>{item.name}</span>
                      <span className="text-teal-600">{item.total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${(item.total / maxActivity) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top protocolos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-blue-600" />
              Top Protocolos
            </h3>
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : topProtocols.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                Aún no hay datos suficientes.
              </p>
            ) : (
              <div className="space-y-4">
                {topProtocols.map((proto) => (
                  <div key={proto.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span className="truncate pr-2">{proto.name}</span>
                      <span className="text-blue-600">{proto.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(proto.value / maxTop) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-teal-50 rounded-xl border border-teal-100">
            <p className="text-xs text-teal-800 font-medium">
              Datos en tiempo real desde la base de datos. Refresca la página para actualizar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
