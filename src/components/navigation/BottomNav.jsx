import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

// Barra de navegación inferior (mobile-first).
// - Visible solo en móvil/tablet (se oculta en desktop).
// - Mantiene el acceso rápido al flujo principal (Inicio, Categorías, Protocolos, Ajustes).
const BottomNav = () => {
  const location = useLocation();
  const isProtocolDetail = location.pathname.startsWith('/protocol/');
  const [isVisible, setIsVisible] = useState(true);

  // Ítems de navegación (móvil).
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Grid, label: 'Categorías', path: '/categories' },
    { icon: BookOpen, label: 'Protocolos', path: '/category/all' },
  ];

  useEffect(() => {
    if (isProtocolDetail) {
      setIsVisible(false);
      return undefined;
    }

    let lastScrollY = window.scrollY;
    setIsVisible(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 24) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProtocolDetail, location.pathname]);

  return (
    <nav
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)' }}
      className={clsx(
        "fixed bottom-0 left-0 right-0 border-t border-outline-variant bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 px-3 pt-2 flex items-center justify-around z-50 md:hidden transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 relative group min-w-[74px] py-1"
          >
            <div
              className={clsx(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "bg-teal-accent text-white" : "text-on-surface-variant group-hover:bg-surface-container"
              )}
            >
              <item.icon size={22} />
            </div>
            <span
              className={clsx(
                "text-[9px] font-bold uppercase tracking-[0.14em]",
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
