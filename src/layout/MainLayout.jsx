import { Outlet } from 'react-router-dom';
import Header from '../components/navigation/Header';
import BottomNav from '../components/navigation/BottomNav';

// Layout principal de la aplicación.
// - Encabezado superior fijo (Header).
// - Contenido central (Outlet) donde se renderizan las rutas.
// - Navegación inferior (BottomNav) para mobile-first.
const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pb-24 pt-4 max-w-[1200px]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
