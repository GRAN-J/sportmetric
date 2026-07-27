import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getUser, getAccessToken } from '../services/authService';

/**
 * Componente para proteger rutas que requieren autenticación.
 * Si el usuario no está autenticado, lo redirige al login.
 * Acepta hijos explícitos o un <Outlet /> para rutas anidadas.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = getUser();
  const token = getAccessToken();
  const location = useLocation();

  // Si no hay usuario o token, redirigir al login
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles permitidos definidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/categories" replace />;
  }

  // Si nos invocan como ruta-layout (Route element={<ProtectedRoute />})
  // y se le pasan rutas hijas, debemos renderizar el Outlet.
  // Si nos invocan envolviendo un único elemento (children), lo renderizamos directo.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
