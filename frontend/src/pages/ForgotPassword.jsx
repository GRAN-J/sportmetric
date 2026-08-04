// =============================================================================
// Pagina de recuperacion de contrasena (paso 1)
// =============================================================================
// El usuario ingresa su correo y, si esta registrado, recibe un email con un
// link para restablecer la contrasena. Por seguridad, la API siempre responde
// con el mismo mensaje sin revelar si el correo existe.
// =============================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { forgotPassword } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      // Por seguridad siempre mostramos exito, sin importar si el correo
      // existe o no en la base de datos.
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message || 'No fue posible enviar las instrucciones.');
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
          <h1 className="text-2xl font-extrabold text-gray-900">¿Olvidaste tu contraseña?</h1>
          <p className="text-sm text-gray-600">
            Ingresa el correo electronico asociado a tu cuenta. Si esta registrado,
            te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </header>

        {submitted ? (
          <div
            role="status"
            className="bg-teal-50 text-teal-800 px-4 py-3 rounded-lg text-sm border border-teal-100"
          >
            Si el correo esta registrado, recibiras las instrucciones en breve.
            Revisa tambien la carpeta de spam.
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

            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="ejemplo@puj.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-colors ${
                loading
                  ? 'bg-teal-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
              }`}
            >
              {loading ? (
                'Enviando...'
              ) : (
                <>
                  <Send size={18} />
                  Enviar instrucciones
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
