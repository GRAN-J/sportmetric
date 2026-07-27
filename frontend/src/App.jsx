import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { checkAuthStatus } from './services/authService';
import ProtectedRoute from './components/ProtectedRoute';

const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
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
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      setInitializing(false);
    };
    initAuth();
  }, []);

  if (initializing) {
    return <AppLoading />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoading />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/categories" element={<Categories />} />
            <Route path="/history/:studentId" element={<EvaluationHistory />} />
            <Route path="/category/:categoryId" element={<ProtocolList />} />
            <Route path="/protocol/:protocolId/*" element={<ProtocolDetail />} />
          </Route>

          {/* Rutas de Administración */}
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
