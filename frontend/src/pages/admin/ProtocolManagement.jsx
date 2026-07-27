// =============================================================================
// Gestión de Protocolos - Panel Administrativo
// =============================================================================
// CRUD completo con editor por pestañas que cubre todas las secciones reales
// de un protocolo: General, Descripción, Materiales, Checklist, Pasos,
// Interrupción y Registro.
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  X,
  Info,
  Settings2,
  Type,
  Hash,
  Calendar as CalendarIcon,
  AlignLeft,
  CheckSquare,
  ListIcon,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/apiClient';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

// -----------------------------------------------------------------------------
// Estado inicial del formulario (todas las secciones vacías)
// -----------------------------------------------------------------------------
const emptyForm = {
  id: '',
  categoryId: '',
  title: '',
  summary: '',
  description: '',
  objective: '',
  status: 'PUBLISHED',
  materials: [],
  checklistItems: [],
  steps: [],
  interruptionCrit: [],
  dataRegistry: { title: '', description: '', unit: '' },
  formSchema: { fields: [] },
};

// -----------------------------------------------------------------------------
// Pestañas disponibles en el editor
// -----------------------------------------------------------------------------
const TABS = [
  { id: 'general', label: 'General' },
  { id: 'description', label: 'Descripción' },
  { id: 'materials', label: 'Materiales' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'steps', label: 'Pasos' },
  { id: 'interruption', label: 'Interrupción' },
  { id: 'registry', label: 'Registro' },
];

// =============================================================================
// Página principal
// =============================================================================
const ProtocolManagement = () => {
  const [protocols, setProtocols] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState('general');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'success' });

  const fetchProtocols = async (signal) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet('/api/protocols', { signal });
      setProtocols(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'No fue posible cargar los protocolos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (signal) => {
    try {
      const data = await apiGet('/api/categories', { signal });
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // Silenciar: las categorías son opcionales para mostrar el listado.
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProtocols(controller.signal);
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, []);

  // ---------------------------------------------------------------------------
  // Apertura / cierre del modal
  // ---------------------------------------------------------------------------
  const openCreate = () => {
    setEditingProtocol(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    setActiveTab('general');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = async (protocol) => {
    try {
      // Cargamos el detalle completo para tener todas las secciones
      const detail = await apiGet(`/api/protocols/${protocol.id}`);
      setEditingProtocol(detail);
      setForm({
        id: detail.id || '',
        categoryId: detail.categoryId || '',
        title: detail.title || '',
        summary: detail.summary || '',
        description: detail.description || '',
        objective: detail.objective || '',
        status: detail.status || 'PUBLISHED',
        materials: Array.isArray(detail.materials) ? detail.materials : [],
        checklistItems: Array.isArray(detail.checklistItems) ? detail.checklistItems : [],
        steps: Array.isArray(detail.steps) ? detail.steps : [],
        interruptionCrit: Array.isArray(detail.interruptionCrit) ? detail.interruptionCrit : [],
        dataRegistry: detail.dataRegistry || { title: '', description: '', unit: '' },
        formSchema: detail.formSchema || { fields: [] },
      });
      setActiveTab('general');
      setFormError('');
      setModalOpen(true);
    } catch (err) {
      showToast(err.message || 'No fue posible cargar el protocolo.', 'error');
    }
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingProtocol(null);
    setForm(emptyForm);
    setActiveTab('general');
    setFormError('');
  };

  // ---------------------------------------------------------------------------
  // Validación
  // ---------------------------------------------------------------------------
  const validateForm = () => {
    if (!form.id.trim()) return 'El identificador (slug) es obligatorio.';
    if (!/^[a-z0-9-]+$/.test(form.id)) {
      return 'El identificador solo puede contener minúsculas, números y guiones.';
    }
    if (!form.categoryId) return 'Debes seleccionar una categoría.';
    if (!form.title.trim()) return 'El título es obligatorio.';

    // Los nombres "id_estudiante", "evaluado" y "evaluador" están reservados
    // porque el backend los agrega SIEMPRE como parte de la Ficha Técnica base.
    const RESERVED = new Set(['id_estudiante', 'evaluado', 'evaluador']);
    const seen = new Set();
    for (const field of form.formSchema?.fields || []) {
      const name = (field.name || '').trim();
      if (!name) continue;
      if (RESERVED.has(name)) {
        return `El nombre "${name}" está reservado. El sistema ya incluye ese campo en la Ficha Técnica.`;
      }
      if (seen.has(name)) {
        return `El nombre "${name}" está duplicado. Cada campo debe tener un nombre único.`;
      }
      seen.add(name);
    }
    return '';
  };

  // ---------------------------------------------------------------------------
  // Persistencia
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      setActiveTab('general');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        id: form.id.trim(),
        categoryId: form.categoryId,
        title: form.title.trim(),
        summary: form.summary.trim(),
        description: form.description.trim(),
        objective: form.objective.trim(),
        status: form.status,
        materials: form.materials.map((m, idx) => ({
          name: m.name?.trim() || '',
          imageUrl: m.imageUrl?.trim() || null,
          order: m.order ?? idx,
        })),
        checklistItems: form.checklistItems.map((c, idx) => ({
          text: c.text?.trim() || '',
          order: c.order ?? idx,
        })),
        steps: form.steps.map((s, idx) => ({
          stepNumber: s.stepNumber ?? idx + 1,
          title: s.title?.trim() || '',
          description: s.description?.trim() || '',
          videoUrl: s.videoUrl?.trim() || null,
          order: s.order ?? idx,
        })),
        interruptionCrit: form.interruptionCrit.map((c, idx) => ({
          text: c.text?.trim() || '',
          order: c.order ?? idx,
        })),
        dataRegistry: {
          title: form.dataRegistry.title?.trim() || '',
          description: form.dataRegistry.description?.trim() || '',
          unit: form.dataRegistry.unit?.trim() || null,
        },
        formSchema: {
          fields: form.formSchema.fields.map((f) => ({
            name: f.name?.trim() || '',
            label: f.label?.trim() || '',
            type: f.type || 'text',
            required: Boolean(f.required),
            placeholder: f.placeholder?.trim() || '',
            unit: f.unit?.trim() || '',
            options: Array.isArray(f.options) ? f.options.filter((o) => o && o.toString().trim()) : [],
            checkboxLabel: f.checkboxLabel?.trim() || '',
          })),
        },
      };

      if (editingProtocol) {
        await apiPatch(`/api/protocols/${editingProtocol.id}`, payload);
        showToast('Protocolo actualizado correctamente.');
      } else {
        await apiPost('/api/protocols', payload);
        showToast('Protocolo creado correctamente.');
      }
      closeModal();
      await fetchProtocols();
    } catch (err) {
      setFormError(err.message || 'No fue posible guardar el protocolo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (protocol) => {
    const confirmed = window.confirm(
      `¿Eliminar el protocolo "${protocol.title}"? Se eliminarán también sus formularios y evaluaciones.`
    );
    if (!confirmed) return;
    setDeletingId(protocol.id);
    try {
      await apiDelete(`/api/protocols/${protocol.id}`);
      showToast('Protocolo eliminado correctamente.');
      await fetchProtocols();
    } catch (err) {
      showToast(err.message || 'No fue posible eliminar el protocolo.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers para listas (añadir, eliminar, mover, actualizar)
  // ---------------------------------------------------------------------------
  const addListItem = (field, blank) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], blank] }));
  };

  const removeListItem = (field, index) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const moveListItem = (field, index, direction) => {
    setForm((prev) => {
      const list = [...prev[field]];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [field]: list };
    });
  };

  const updateListItem = (field, index, patch) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list[index] = { ...list[index], ...patch };
      return { ...prev, [field]: list };
    });
  };

  const updateRegistry = (patch) => {
    setForm((prev) => ({ ...prev, dataRegistry: { ...prev.dataRegistry, ...patch } }));
  };

  // ---------------------------------------------------------------------------
  // Helpers para el editor dinámico de campos (formSchema)
  // ---------------------------------------------------------------------------
  const addFormField = () => {
    setForm((prev) => ({
      ...prev,
      formSchema: {
        fields: [
          ...prev.formSchema.fields,
          {
            name: '',
            label: '',
            type: 'text',
            required: false,
            placeholder: '',
            unit: '',
            options: [],
            checkboxLabel: '',
          },
        ],
      },
    }));
  };

  const removeFormField = (index) => {
    setForm((prev) => ({
      ...prev,
      formSchema: {
        fields: prev.formSchema.fields.filter((_, i) => i !== index),
      },
    }));
  };

  const moveFormField = (index, direction) => {
    setForm((prev) => {
      const list = [...prev.formSchema.fields];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, formSchema: { fields: list } };
    });
  };

  const updateFormField = (index, patch) => {
    setForm((prev) => {
      const list = [...prev.formSchema.fields];
      list[index] = { ...list[index], ...patch };
      return { ...prev, formSchema: { fields: list } };
    });
  };

  const updateFormFieldOption = (fieldIndex, optionIndex, value) => {
    setForm((prev) => {
      const list = [...prev.formSchema.fields];
      const options = [...(list[fieldIndex].options || [])];
      options[optionIndex] = value;
      list[fieldIndex] = { ...list[fieldIndex], options };
      return { ...prev, formSchema: { fields: list } };
    });
  };

  const addFormFieldOption = (fieldIndex) => {
    setForm((prev) => {
      const list = [...prev.formSchema.fields];
      const options = [...(list[fieldIndex].options || []), ''];
      list[fieldIndex] = { ...list[fieldIndex], options };
      return { ...prev, formSchema: { fields: list } };
    });
  };

  const removeFormFieldOption = (fieldIndex, optionIndex) => {
    setForm((prev) => {
      const list = [...prev.formSchema.fields];
      const options = (list[fieldIndex].options || []).filter((_, i) => i !== optionIndex);
      list[fieldIndex] = { ...list[fieldIndex], options };
      return { ...prev, formSchema: { fields: list } };
    });
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.title || id;

  const filteredProtocols = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return protocols.filter((p) => {
      const text = `${p.title || ''} ${p.categoryId || ''} ${p.summary || ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [protocols, searchTerm]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-teal-600" size={32} />
            Gestión de Protocolos
          </h1>
          <p className="text-gray-500 mt-1">Administra los manuales técnicos y todas sus secciones.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          <Plus size={20} />
          Nuevo Protocolo
        </button>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título, categoría o resumen..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <p>Cargando protocolos...</p>
          </div>
        ) : filteredProtocols.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            {searchTerm ? 'No se encontraron protocolos con ese criterio.' : 'No hay protocolos registrados.'}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Protocolo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProtocols.map((protocol) => (
                <tr key={protocol.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{protocol.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{protocol.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                      {categoryName(protocol.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {protocol.status || 'Publicado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(protocol)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(protocol)}
                        disabled={deletingId === protocol.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Eliminar"
                      >
                        {deletingId === protocol.id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Modal de edición con pestañas                                          */}
      {/* --------------------------------------------------------------------- */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProtocol ? `Editar: ${editingProtocol.title}` : 'Nuevo Protocolo'}
        size="2xl"
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
              form="protocol-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {editingProtocol ? 'Guardar Cambios' : 'Crear Protocolo'}
            </button>
          </>
        }
      >
        <form id="protocol-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{formError}</p>
            </div>
          )}

          {/* Barra de pestañas */}
          <div className="flex flex-wrap gap-1 border-b border-gray-200 -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido de cada pestaña */}
          {activeTab === 'general' && (
            <TabGeneral form={form} setForm={setForm} categories={categories} disabled={!!editingProtocol} />
          )}
          {activeTab === 'description' && <TabDescription form={form} setForm={setForm} />}
          {activeTab === 'materials' && (
            <TabList
              title="Materiales requeridos"
              empty="No hay materiales definidos. Añade el primero con el botón inferior."
              items={form.materials}
              onAdd={() => addListItem('materials', { name: '', imageUrl: '', order: 0 })}
              onRemove={(i) => removeListItem('materials', i)}
              onMove={(i, dir) => moveListItem('materials', i, dir)}
              onUpdate={(i, patch) => updateListItem('materials', i, patch)}
              fields={[
                { name: 'name', label: 'Nombre del material', type: 'text', required: true, col: 'full' },
                { name: 'imageUrl', label: 'URL de imagen (opcional)', type: 'text', col: 'full' },
              ]}
            />
          )}
          {activeTab === 'checklist' && (
            <TabList
              title="Ítems del checklist"
              empty="No hay ítems de verificación definidos."
              items={form.checklistItems}
              onAdd={() => addListItem('checklistItems', { text: '', order: 0 })}
              onRemove={(i) => removeListItem('checklistItems', i)}
              onMove={(i, dir) => moveListItem('checklistItems', i, dir)}
              onUpdate={(i, patch) => updateListItem('checklistItems', i, patch)}
              fields={[
                { name: 'text', label: 'Criterio a verificar', type: 'text', required: true, col: 'full' },
              ]}
            />
          )}
          {activeTab === 'steps' && (
            <TabSteps
              items={form.steps}
              onAdd={() => addListItem('steps', { stepNumber: 0, title: '', description: '', videoUrl: '' })}
              onRemove={(i) => removeListItem('steps', i)}
              onMove={(i, dir) => moveListItem('steps', i, dir)}
              onUpdate={(i, patch) => updateListItem('steps', i, patch)}
            />
          )}
          {activeTab === 'interruption' && (
            <TabList
              title="Criterios de interrupción"
              empty="No hay criterios de interrupción definidos."
              items={form.interruptionCrit}
              onAdd={() => addListItem('interruptionCrit', { text: '', order: 0 })}
              onRemove={(i) => removeListItem('interruptionCrit', i)}
              onMove={(i, dir) => moveListItem('interruptionCrit', i, dir)}
              onUpdate={(i, patch) => updateListItem('interruptionCrit', i, patch)}
              fields={[
                { name: 'text', label: 'Criterio', type: 'text', required: true, col: 'full' },
              ]}
            />
          )}
          {activeTab === 'registry' && (
            <TabRegistry
              form={form}
              updateRegistry={updateRegistry}
              addField={addFormField}
              removeField={removeFormField}
              moveField={moveFormField}
              updateField={updateFormField}
              updateOption={updateFormFieldOption}
              addOption={addFormFieldOption}
              removeOption={removeFormFieldOption}
            />
          )}
        </form>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

// =============================================================================
// Subcomponentes de pestañas
// =============================================================================

// Pestaña: General
const TabGeneral = ({ form, setForm, categories, disabled }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Identificador (slug)</label>
        <input
          type="text"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="ej. peso-corporal"
          disabled={disabled}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-60"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
      </div>
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

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">Resumen</label>
      <input
        type="text"
        value={form.summary}
        onChange={(e) => setForm({ ...form, summary: e.target.value })}
        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">Objetivo</label>
      <textarea
        value={form.objective}
        onChange={(e) => setForm({ ...form, objective: e.target.value })}
        rows={3}
        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
      >
        <option value="PUBLISHED">Publicado</option>
        <option value="DRAFT">Borrador</option>
        <option value="ARCHIVED">Archivado</option>
      </select>
    </div>
  </div>
);

// Pestaña: Descripción
const TabDescription = ({ form, setForm }) => (
  <div className="space-y-3">
    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
      <Info size={16} className="mt-0.5 shrink-0" />
      <p>Descripción completa que verá el evaluador al consultar el protocolo.</p>
    </div>
    <textarea
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
      rows={10}
      placeholder="Describe el protocolo, su fundamentación, contexto de uso y consideraciones generales..."
      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
    />
  </div>
);

// Pestaña: Instrumento de registro (editor dinámico de campos)
const FIELD_TYPES = [
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'number', label: 'Número', icon: Hash },
  { value: 'date', label: 'Fecha', icon: CalendarIcon },
  { value: 'textarea', label: 'Texto largo', icon: AlignLeft },
  { value: 'select', label: 'Selección', icon: ListIcon },
  { value: 'checkbox', label: 'Casilla', icon: CheckSquare },
];

const FIELD_TYPE_HELP = {
  text: 'Campo de texto corto (una línea).',
  number: 'Valor numérico, ideal para mediciones.',
  date: 'Selector de fecha.',
  textarea: 'Cuadro de texto largo, varias líneas.',
  select: 'Lista desplegable con opciones predefinidas.',
  checkbox: 'Casilla de verificación (Sí/No).',
};

const TabRegistry = ({
  form,
  updateRegistry,
  addField,
  removeField,
  moveField,
  updateField,
  updateOption,
  addOption,
  removeOption,
}) => {
  const fields = form.formSchema?.fields || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Título del instrumento</label>
          <input
            type="text"
            value={form.dataRegistry.title}
            onChange={(e) => updateRegistry({ title: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="ej. Ficha de medición antropométrica"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Unidad por defecto (opcional)</label>
          <input
            type="text"
            value={form.dataRegistry.unit || ''}
            onChange={(e) => updateRegistry({ unit: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="ej. m, kg, cm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
        <textarea
          value={form.dataRegistry.description}
          onChange={(e) => updateRegistry({ description: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          placeholder="Ej. Registre dos mediciones y calcule el promedio..."
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 size={18} className="text-teal-600" />
          <h3 className="text-sm font-bold text-gray-900">Campos personalizados del formulario</h3>
          <span className="text-xs text-gray-500">
            ({fields.length} {fields.length === 1 ? 'campo' : 'campos'})
          </span>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm mb-4">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            Toda evaluación incluye siempre los campos <strong>ID del estudiante</strong>,{' '}
            <strong>Nombre del evaluado</strong> y <strong>Nombre del evaluador</strong>. Los
            campos que definas aquí se mostrarán adicionalmente. No uses los nombres{' '}
            <code>id_estudiante</code>, <code>evaluado</code> ni <code>evaluador</code>,
            están reservados.
          </p>
        </div>

        {fields.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            Aún no has definido campos personalizados. Añade el primero con el botón inferior.
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const FieldIcon = FIELD_TYPES.find((t) => t.value === field.type)?.icon || Type;
              return (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FieldIcon size={16} className="text-teal-600" />
                      <span className="text-xs font-bold uppercase tracking-widest">#{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveField(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded transition-all disabled:opacity-30"
                        title="Subir"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, 1)}
                        disabled={index === fields.length - 1}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded transition-all disabled:opacity-30"
                        title="Bajar"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-all"
                        title="Eliminar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Etiqueta visible</label>
                      <input
                        type="text"
                        value={field.label || ''}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="ej. Peso corporal"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        Nombre interno <span className="text-gray-400">(sin espacios)</span>
                      </label>
                      <input
                        type="text"
                        value={field.name || ''}
                        onChange={(e) =>
                          updateField(index, {
                            name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                          })
                        }
                        placeholder="ej. peso_kg"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de campo</label>
                      <select
                        value={field.type || 'text'}
                        onChange={(e) => updateField(index, { type: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {field.type === 'number' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Unidad</label>
                        <input
                          type="text"
                          value={field.unit || ''}
                          onChange={(e) => updateField(index, { unit: e.target.value })}
                          placeholder="ej. kg, cm, m"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        />
                      </div>
                    )}
                    {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Placeholder (opcional)</label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          placeholder="Texto de ayuda..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        />
                      </div>
                    )}
                    {field.type === 'checkbox' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Etiqueta de la casilla</label>
                        <input
                          type="text"
                          value={field.checkboxLabel || ''}
                          onChange={(e) => updateField(index, { checkboxLabel: e.target.value })}
                          placeholder="ej. ¿Completó la evaluación?"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {field.type === 'select' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Opciones del selector</span>
                        <button
                          type="button"
                          onClick={() => addOption(index)}
                          className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                        >
                          <Plus size={12} />
                          Añadir opción
                        </button>
                      </div>
                      {(field.options || []).length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Sin opciones definidas.</p>
                      ) : (
                        <div className="space-y-1">
                          {field.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(index, optIdx, e.target.value)}
                                placeholder={`Opción ${optIdx + 1}`}
                                className="flex-1 px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(index, optIdx)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(field.required)}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span>Campo obligatorio</span>
                  </label>

                  <p className="text-xs text-gray-500 italic">
                    {FIELD_TYPE_HELP[field.type] || ''}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={addField}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-all font-bold"
        >
          <Plus size={18} />
          Agregar campo
        </button>
      </div>
    </div>
  );
};

// Pestaña: Lista genérica (Materiales, Checklist, Interrupción)
const TabList = ({ title, empty, items, onAdd, onRemove, onMove, onUpdate, fields }) => (
  <div className="space-y-3">
    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
      <Info size={16} className="mt-0.5 shrink-0" />
      <p>{title}. Usa las flechas para reordenar y la X para eliminar.</p>
    </div>

    {items.length === 0 ? (
      <div className="p-8 text-center text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
        {empty}
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">#{index + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded transition-all disabled:opacity-30"
                  title="Subir"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded transition-all disabled:opacity-30"
                  title="Bajar"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-all"
                  title="Eliminar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className={`grid gap-3 ${fields.some((f) => f.col === 'full') ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {fields.map((field) => (
                <div key={field.name} className={field.col === 'full' ? 'col-span-full' : ''}>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={item[field.name] || ''}
                      onChange={(e) => onUpdate(index, { [field.name]: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={item[field.name] || ''}
                      onChange={(e) => onUpdate(index, { [field.name]: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}

    <button
      type="button"
      onClick={onAdd}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-all font-bold"
    >
      <Plus size={18} />
      Agregar elemento
    </button>
  </div>
);

// Pestaña: Pasos (con campos extendidos: stepNumber, title, description, videoUrl)
const TabSteps = ({ items, onAdd, onRemove, onMove, onUpdate }) => (
  <div className="space-y-3">
    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
      <Info size={16} className="mt-0.5 shrink-0" />
      <p>Define los pasos secuenciales del protocolo. Cada paso puede tener un video demostrativo.</p>
    </div>

    {items.length === 0 ? (
      <div className="p-8 text-center text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
        No hay pasos definidos.
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((step, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Paso #{index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded transition-all disabled:opacity-30"
                  title="Subir"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded transition-all disabled:opacity-30"
                  title="Bajar"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-all"
                  title="Eliminar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Número de paso</label>
                <input
                  type="number"
                  min="1"
                  value={step.stepNumber || index + 1}
                  onChange={(e) => onUpdate(index, { stepNumber: Number(e.target.value) || index + 1 })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Título del paso</label>
                <input
                  type="text"
                  value={step.title || ''}
                  onChange={(e) => onUpdate(index, { title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Descripción</label>
              <textarea
                rows={3}
                value={step.description || ''}
                onChange={(e) => onUpdate(index, { description: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">URL del video (opcional)</label>
              <input
                type="text"
                value={step.videoUrl || ''}
                onChange={(e) => onUpdate(index, { videoUrl: e.target.value })}
                placeholder="/assets/videos/mi-protocolo-paso-1.mp4"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    )}

    <button
      type="button"
      onClick={onAdd}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-all font-bold"
    >
      <Plus size={18} />
      Agregar paso
    </button>
  </div>
);

export default ProtocolManagement;
