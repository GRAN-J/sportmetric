// =============================================================================
// Gestión de Registros (Evaluaciones) - Panel Administrativo
// =============================================================================
// Lista, filtra, edita y elimina las evaluaciones registradas en el sistema.
// Vinculadas a sus protocolos mediante un filtro dedicado.
//
// Importante: las evaluaciones se desacoplan de la tabla User. Los nombres del
// evaluado y evaluador viven dentro de `results` (Ficha Técnica base) en las
// claves `id_estudiante`, `evaluado` y `evaluador`. Por eso se leen desde
// `ev.results?.evaluado` y `ev.results?.evaluador`.
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  Filter,
  X,
  Save,
  User,
  UserCheck,
  Calendar,
  FileText,
  Hash,
} from 'lucide-react';
import {
  listEvaluations,
  getEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from '../../services/evaluationService';
import { apiGet } from '../../services/apiClient';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const summarizeResults = (results) => {
  if (!results || typeof results !== 'object') return '—';
  const entries = Object.entries(results);
  if (entries.length === 0) return '—';
  return entries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
};

// Helpers para leer la Ficha Técnica base desde `results`.
const getEvaluado = (ev) => ev?.results?.evaluado || 'Sin evaluado';
const getEvaluador = (ev) => ev?.results?.evaluador || '—';
const getIdEstudiante = (ev) => ev?.results?.id_estudiante || '—';

const EvaluationManagement = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingEvaluation, setViewingEvaluation] = useState(null);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [editForm, setEditForm] = useState({ results: '', notes: '' });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'success' });

  // ---------------------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------------------
  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listEvaluations({
        protocolId: protocolFilter || undefined,
        search: searchTerm.trim() || undefined,
      });
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'No fue posible cargar los registros.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProtocols = async (signal) => {
    try {
      const data = await apiGet('/api/protocols', { signal });
      setProtocols(Array.isArray(data) ? data : []);
    } catch {
      // Silenciar: el filtro de protocolos es opcional
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProtocols(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchEvaluations, 200);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, protocolFilter]);

  // ---------------------------------------------------------------------------
  // Acciones
  // ---------------------------------------------------------------------------
  const openView = async (evaluation) => {
    try {
      const detail = await getEvaluation(evaluation.id);
      setViewingEvaluation(detail);
    } catch (err) {
      showToast(err.message || 'No fue posible cargar el detalle.', 'error');
    }
  };

  const closeView = () => setViewingEvaluation(null);

  const openEdit = (evaluation) => {
    setEditingEvaluation(evaluation);
    setEditForm({
      results: JSON.stringify(evaluation.results || {}, null, 2),
      notes: evaluation.notes || '',
    });
    setEditError('');
    setModalOpen(true);
  };

  const closeEdit = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingEvaluation(null);
    setEditForm({ results: '', notes: '' });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    let parsedResults;
    try {
      parsedResults = editForm.results.trim() ? JSON.parse(editForm.results) : {};
    } catch {
      setEditError('El JSON de resultados no es válido.');
      return;
    }

    setSaving(true);
    try {
      await updateEvaluation(editingEvaluation.id, {
        results: parsedResults,
        notes: editForm.notes.trim() || null,
      });
      showToast('Registro actualizado correctamente.');
      closeEdit();
      await fetchEvaluations();
    } catch (err) {
      setEditError(err.message || 'No fue posible actualizar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (evaluation) => {
    const confirmed = window.confirm(
      `¿Eliminar el registro de "${getEvaluado(evaluation)}" del protocolo "${evaluation.protocol?.title || ''}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    setDeletingId(evaluation.id);
    try {
      await deleteEvaluation(evaluation.id);
      showToast('Registro eliminado correctamente.');
      await fetchEvaluations();
    } catch (err) {
      showToast(err.message || 'No fue posible eliminar el registro.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setProtocolFilter('');
  };

  const filteredEvaluations = useMemo(() => evaluations, [evaluations]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ClipboardList className="text-teal-600" size={32} />
            Gestión de Registros
          </h1>
          <p className="text-gray-500 mt-1">
            Consulta, edita o elimina los registros de evaluación del sistema.
          </p>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o protocolo..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none"
            >
              <option value="">Todos los protocolos</option>
              {protocols.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || protocolFilter) && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {filteredEvaluations.length} resultado{filteredEvaluations.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-bold"
            >
              <X size={14} />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <p>Cargando registros...</p>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            {searchTerm || protocolFilter
              ? 'No se encontraron registros con esos filtros.'
              : 'Aún no hay registros de evaluación.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Evaluado
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Protocolo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Evaluador
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Datos
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEvaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {getEvaluado(ev)}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium inline-flex items-center gap-1">
                              <Hash size={10} />
                              {getIdEstudiante(ev)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                          <FileText size={14} className="text-teal-600" />
                          {ev.protocol?.title || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <UserCheck size={14} className="text-gray-400" />
                          {getEvaluador(ev)}
                        </span>
                      </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                      {summarizeResults(ev.results)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(ev.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openView(ev)}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(ev)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ev)}
                          disabled={deletingId === ev.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === ev.id ? (
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
          </div>
        )}
      </div>

      {/* Modal: Ver detalle */}
      <Modal
        open={!!viewingEvaluation}
        onClose={closeView}
        title="Detalle del registro"
        size="lg"
        footer={
          <button
            type="button"
            onClick={closeView}
            className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cerrar
          </button>
        }
      >
        {viewingEvaluation && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Evaluado
                </p>
                <p className="font-bold text-gray-900">{getEvaluado(viewingEvaluation)}</p>
                <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <Hash size={10} /> {getIdEstudiante(viewingEvaluation)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Evaluador
                </p>
                <p className="font-bold text-gray-900">{getEvaluador(viewingEvaluation)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Protocolo
                </p>
                <p className="font-bold text-gray-900">{viewingEvaluation.protocol?.title || '—'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Fecha
                </p>
                <p className="font-bold text-gray-900">{formatDate(viewingEvaluation.date)}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Datos registrados
              </p>
              <pre className="bg-gray-900 text-teal-300 p-4 rounded-xl text-xs overflow-x-auto">
                {JSON.stringify(viewingEvaluation.results, null, 2)}
              </pre>
            </div>

            {viewingEvaluation.notes && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Notas
                </p>
                <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                  {viewingEvaluation.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Editar */}
      <Modal
        open={modalOpen}
        onClose={closeEdit}
        title="Editar registro"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeEdit}
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-evaluation-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar Cambios
            </button>
          </>
        }
      >
        <form id="edit-evaluation-form" onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{editError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Resultados (JSON)</label>
            <textarea
              value={editForm.results}
              onChange={(e) => setEditForm({ ...editForm, results: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 bg-gray-900 text-teal-300 font-mono text-xs rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Edita el JSON con los datos del registro. Debe ser un objeto válido.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Notas</label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Observaciones o comentarios del evaluador..."
            />
          </div>
        </form>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

export default EvaluationManagement;
