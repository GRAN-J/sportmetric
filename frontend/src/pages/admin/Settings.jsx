// =============================================================================
// Configuración del Sistema - Panel Administrativo
// =============================================================================
// Ajustes globales: nombre, descripción y datos del sistema.
// =============================================================================

import { useState } from 'react';
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Toast from '../../components/Toast';

const Settings = () => {
  const [config, setConfig] = useState({
    systemName: 'SportMetric Academic',
    description: 'Plataforma académica de evaluación deportiva',
    contactEmail: 'admin@sportmetric.local',
    itemsPerPage: 10,
    allowRegistration: false,
    requireEmailVerification: true,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulación de guardado. Cuando exista el endpoint /api/admin/settings, conectar aquí.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    setToast({ message: 'Configuración guardada correctamente.', type: 'success' });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="text-teal-600" size={32} />
          Configuración del Sistema
        </h1>
        <p className="text-gray-500 mt-1">Ajustes generales de la plataforma SportMetric Academic.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Sistema</label>
          <input
            type="text"
            name="systemName"
            value={config.systemName}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
          <textarea
            name="description"
            value={config.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Correo de contacto</label>
          <input
            type="email"
            name="contactEmail"
            value={config.contactEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Elementos por página (listados)</label>
          <input
            type="number"
            name="itemsPerPage"
            value={config.itemsPerPage}
            onChange={handleChange}
            min={5}
            max={100}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="allowRegistration"
              checked={config.allowRegistration}
              onChange={handleChange}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
            <div>
              <p className="font-bold text-gray-900">Permitir registro público</p>
              <p className="text-xs text-gray-500">Los usuarios pueden crear cuentas sin invitación.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="requireEmailVerification"
              checked={config.requireEmailVerification}
              onChange={handleChange}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
            <div>
              <p className="font-bold text-gray-900">Requerir verificación de correo</p>
              <p className="text-xs text-gray-500">Los nuevos usuarios deben verificar su correo antes de iniciar sesión.</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
          >
            {saving ? <CheckCircle2 className="animate-pulse" size={20} /> : <Save size={20} />}
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-blue-900">Información del Sistema</p>
            <p className="text-sm text-blue-700 mt-1">
              Los cambios se aplican en tiempo real. Para opciones avanzadas (caché, integraciones, mantenimiento),
              contacta al equipo de desarrollo.
            </p>
          </div>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
};

export default Settings;
