// =============================================================================
// Gestión de Usuarios - Panel Administrativo
// =============================================================================
// CRUD completo: listar, crear, editar y eliminar usuarios.
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Mail,
  User as UserIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../services/apiClient';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';

const ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'EVALUADOR', label: 'Evaluador' },
  { value: 'ESTUDIANTE', label: 'Estudiante' },
];

const initialForm = { name: '', email: '', password: '', role: 'EVALUADOR' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'success' });

  const fetchUsers = async (signal) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet('/api/users', { signal });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'No fue posible cargar los usuarios.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'EVALUADOR',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingUser(null);
    setForm(initialForm);
    setFormError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'El nombre es obligatorio.';
    if (!form.email.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Correo no válido.';
    if (!editingUser && !form.password) return 'La contraseña es obligatoria.';
    if (form.password && form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!ROLES.some((r) => r.value === form.role)) return 'Rol no válido.';
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
      const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role };
      if (form.password) payload.password = form.password;

      if (editingUser) {
        await apiPatch(`/api/users/${editingUser.id}`, payload);
        showToast('Usuario actualizado correctamente.');
      } else {
        await apiPost('/api/users', payload);
        showToast('Usuario creado correctamente.');
      }
      closeModal();
      await fetchUsers();
    } catch (err) {
      setFormError(err.message || 'No fue posible guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`¿Eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setDeletingId(user.id);
    try {
      await apiDelete(`/api/users/${user.id}`);
      showToast('Usuario eliminado correctamente.');
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'No fue posible eliminar el usuario.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = searchTerm.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q)
    );
  });

  const roleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-700',
      EVALUADOR: 'bg-blue-100 text-blue-700',
      ESTUDIANTE: 'bg-gray-100 text-gray-700',
    };
    return styles[role] || styles.ESTUDIANTE;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-teal-600" size={32} />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-500 mt-1">Administra los accesos y roles del sistema.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
        >
          <UserPlus size={20} />
          Nuevo Usuario
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
            placeholder="Buscar por nombre o email..."
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
            <p>Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            {searchTerm ? 'No se encontraron usuarios con ese criterio.' : 'No hay usuarios registrados.'}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${roleBadge(user.role)}`}>
                      <ShieldCheck size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Eliminar"
                      >
                        {deletingId === user.id ? (
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
              form="user-form"
              disabled={saving}
              className="px-4 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{formError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Contraseña {editingUser && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Rol</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

export default UserManagement;
