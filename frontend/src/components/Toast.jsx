// =============================================================================
// Notificación Toast
// =============================================================================
// Componente ligero para mostrar mensajes de éxito o error.
// =============================================================================

import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message || duration <= 0) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === 'error';
  const Icon = isError ? XCircle : CheckCircle2;
  const bg = isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-teal-50 border-teal-200 text-teal-800';
  const iconColor = isError ? 'text-red-600' : 'text-teal-600';

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4">
      <div className={`flex items-start gap-3 p-4 border rounded-xl shadow-lg ${bg} max-w-sm`}>
        <Icon className={`shrink-0 mt-0.5 ${iconColor}`} size={20} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
