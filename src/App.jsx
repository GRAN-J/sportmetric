import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

const Welcome = lazy(() => import('./pages/Welcome'));
const Categories = lazy(() => import('./pages/Categories'));
const ProtocolList = lazy(() => import('./pages/ProtocolList'));
const ProtocolDetail = lazy(() => import('./pages/ProtocolDetail'));

const AppLoading = () => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-4 border-teal-accent border-t-transparent rounded-full animate-spin" />
    <p className="text-sm font-semibold text-on-surface-variant">Cargando vista...</p>
  </div>
);

// Definición de rutas principales.
// Flujo base:
// - Bienvenida (/) -> Categorías -> Lista de protocolos -> Detalle del protocolo (secciones internas).
function App() {
  return (
    <Suspense fallback={<AppLoading />}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route element={<MainLayout />}>
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:categoryId" element={<ProtocolList />} />
          <Route path="/protocol/:protocolId/*" element={<ProtocolDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
