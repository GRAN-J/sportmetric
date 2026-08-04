// =============================================================================
// Pagina de restablecimiento de contrasena (paso 2)
// =============================================================================
// El usuario llega aqui desde el enlace del correo de recuperacion. La URL
// incluye el token (?token=XXX) que el backend valida junto con la nueva
// contrasena para hacer el cambio.
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { resetPassword } from '../services/authService';

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Leemos el token de la query string una sola vez. Si no esta, mostramos
  // un mensaje claro en vez de un error tecnico.
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('El enlace de recuperacion no es valido o ha expirado. Solicita uno nuevo.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message || 'No fue posible restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:underline"
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesion
        </Link>

        <header className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">Restablecer contraseña</h1>
          <p className="text-sm text-gray-600">
            Ingresa tu nueva contraseña. Debe tener al menos {MIN_PASSWORD_LENGTH} caracteres.
          </p>
        </header>

        {success ? (
          <div className="space-y-4">
            <div
              role="status"
              className="bg-teal-50 text-teal-800 px-4 py-3 rounded-lg text-sm border border-teal-100"
            >
              Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesion.
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors"
            >
              Ir a iniciar sesion
            </button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {error && (
              <div
                role="alert"
                className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-100"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={!token}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="Minimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={!token}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-colors ${
                loading || !token
                  ? 'bg-teal-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
              }`}
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
