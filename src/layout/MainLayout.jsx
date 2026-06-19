import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/navigation/Header';
import BottomNav from '../components/navigation/BottomNav';

// Layout principal de la aplicación.
// - Encabezado superior fijo (Header).
// - Contenido central (Outlet) donde se renderizan las rutas.
// - Navegación inferior (BottomNav) para mobile-first.
const MainLayout = () => {
  const location = useLocation();
  const isProtocolDetail = location.pathname.startsWith('/protocol/');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className={`flex-1 container mx-auto px-4 pt-3 md:pt-4 max-w-[1200px] ${isProtocolDetail ? 'pb-6 md:pb-10' : 'pb-24 md:pb-10'}`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
