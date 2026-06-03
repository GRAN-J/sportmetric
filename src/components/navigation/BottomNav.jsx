import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, BookOpen, Settings } from 'lucide-react';
import { clsx } from 'clsx';

// Barra de navegación inferior (mobile-first).
// - Visible solo en móvil/tablet (se oculta en desktop).
// - Mantiene el acceso rápido al flujo principal (Inicio, Categorías, Protocolos, Ajustes).
const BottomNav = () => {
  const location = useLocation();

  // Ítems de navegación (móvil).
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Grid, label: 'Categorías', path: '/categories' },
    { icon: BookOpen, label: 'Protocolos', path: '/category/all' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant px-4 h-20 flex items-center justify-around z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 relative group"
          >
            <div
              className={clsx(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-teal-accent text-white" : "text-on-surface-variant group-hover:bg-surface-container"
              )}
            >
              <item.icon size={24} />
            </div>
            <span
              className={clsx(
                "text-[10px] font-bold uppercase tracking-wider",
                isActive ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
