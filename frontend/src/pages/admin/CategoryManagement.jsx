// =============================================================================
// Gestión de Categorías - Panel Administrativo
// =============================================================================
// CRUD completo: listar, crear, editar y eliminar categorías.
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/apiClient';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const ICONS = ['Activity', 'Flame', 'Dumbbell', 'Stretch', 'HeartPulse', 'Layers', 'Zap', 'Target'];
const DEFAULT_COLOR = '#0d9488';

const isValidHex = (value) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

const initialForm = { id: '', title: '', description: '', icon: 'Activity', color: DEFAULT_COLOR, order: 0 };

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'success' });

  const fetchCategories = async (signal) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet('/api/categories', { signal });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'No fue posible cargar las categorías.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ ...initialForm, order: categories.length + 1 });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setForm({
      id: cat.id,
      title: cat.title || '',
      description: cat.description || '',
      icon: cat.icon || 'Activity',
      color: cat.color || DEFAULT_COLOR,
      order: cat.order || 0,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
    setFormError('');
  };

  const validateForm = () => {
    if (!form.id.trim()) return 'El identificador (slug) es obligatorio.';
    if (!/^[a-z0-9-]+$/.test(form.id)) return 'El identificador solo puede contener minúsculas, números y guiones.';
    if (!form.title.trim()) return 'El título es obligatorio.';
    if (!form.description.trim()) return 'La descripción es obligatoria.';
    if (!ICONS.includes(form.icon)) return 'Ícono no válido.';
    if (!isValidHex(form.color)) return 'El color debe ser un valor hexadecimal válido (ej. #0d9488).';
    if (Number.isNaN(Number(form.order))) return 'El orden debe ser numérico.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        id: form.id.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        icon: form.icon,
        color: form.color,
        order: Number(form.order),
      };

      if (editingCategory) {
        await apiPatch(`/api/categories/${editingCategory.id}`, payload);
        showToast('Categoría actualizada correctamente.');
      } else {
        await apiPost('/api/categories', payload);
        showToast('Categoría creada correctamente.');
      }
      closeModal();
      await fetchCategories();
    } catch (err) {
      setFormError(err.message || 'No fue posible guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const confirmed = window.confirm(`¿Eliminar la categoría "${cat.title}"? Los protocolos asociados podrían quedar huérfanos.`);
    if (!confirmed) return;
    setDeletingId(cat.id);
    try {
      await apiDelete(`/api/categories/${cat.id}`);
      showToast('Categoría eliminada correctamente.');
      await fetchCategories();
    } catch (err) {
      showToast(err.message || 'No fue posible eliminar la categoría.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Layers className="text-teal-600" size={32} />
            Gestión de Categorías
          </h1>
          <p className="text-gray-500 mt-1">Organiza los protocolos en grupos lógicos.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-teal-600" size={32} />
          <p>Cargando categorías...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 text-center text-gray-500">
          No hay categorías registradas. Crea la primera.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
              <div
                className="h-2 w-full"
                style={{ backgroundColor: isValidHex(cat.color) ? cat.color : DEFAULT_COLOR }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-700 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <Layers size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(cat)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === cat.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-lg text-gray-900">{cat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Orden: {cat.order ?? '—'}</span>
                  <span className="text-teal-600 flex items-center gap-1 text-sm font-bold">
                    Ver Protocolos
                    <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Identificador (slug)</label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                placeholder="ej. composicion-corporal"
                disabled={!!editingCategory}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-60"
                required
              />
              <p className="text-xs text-gray-400 mt-1">No se puede cambiar después de crear.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ícono</label>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {ICONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isValidHex(form.color) ? form.color : DEFAULT_COLOR}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-10 p-1 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                  title="Selecciona un color"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="#0d9488"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Valor hexadecimal (ej. #0d9488).</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Orden</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

export default CategoryManagement;
