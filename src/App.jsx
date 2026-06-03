import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Categories from './pages/Categories';
import ProtocolList from './pages/ProtocolList';
import ProtocolDetail from './pages/ProtocolDetail';
import MainLayout from './layout/MainLayout';

// Definición de rutas principales.
// Flujo base:
// - Bienvenida (/) -> Categorías -> Lista de protocolos -> Detalle del protocolo (secciones internas).
function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route element={<MainLayout />}>
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:categoryId" element={<ProtocolList />} />
        <Route path="/protocol/:protocolId/*" element={<ProtocolDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
