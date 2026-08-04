import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { checkAuthStatus } from './services/authService';
import ProtectedRoute from './components/ProtectedRoute';

const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Categories = lazy(() => import('./pages/Categories'));
const ProtocolList = lazy(() => import('./pages/ProtocolList'));
const ProtocolDetail = lazy(() => import('./pages/ProtocolDetail'));
const EvaluationHistory = lazy(() => import('./pages/EvaluationHistory'));
const AdminLayout = lazy(() => import('./layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CategoryManagement = lazy(() => import('./pages/admin/CategoryManagement'));
const ProtocolManagement = lazy(() => import('./pages/admin/ProtocolManagement'));
const EvaluationManagement = lazy(() => import('./pages/admin/EvaluationManagement'));
const Statistics = lazy(() => import('./pages/admin/Statistics'));
const Settings = lazy(() => import('./pages/admin/Settings'));

const AppLoading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
    <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm font-semibold text-gray-600">Verificando sesión...</p>
  </div>
);

function App() {
  // OPTIMIZACION: la app se renderiza inmediatamente sin esperar la
  // verificacion de sesion. Si el usuario esta logueado, el token se
  // renueva en background y las rutas protegidas (ProtectedRoute)
  // redirigen a /login si la sesion caduco. Esto elimina la pantalla
  // "Verificando sesion..." que demoraba la primera pintura de la app,
  // especialmente en backends de plan free que tardan en despertar.
  useEffect(() => {
    checkAuthStatus().catch(() => {
      // Silenciar errores: ya se manejan dentro de checkAuthStatus.
    });
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoading />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<MainLayout />}>
            <Route path="/categories" element={<Categories />} />
            <Route path="/history/:studentId" element={<EvaluationHistory />} />
            <Route path="/category/:categoryId" element={<ProtocolList />} />
            <Route path="/protocol/:protocolId/*" element={<ProtocolDetail />} />
          </Route>

          {/* Rutas de Administracion */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="protocols" element={<ProtocolManagement />} />
              <Route path="evaluations" element={<EvaluationManagement />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
