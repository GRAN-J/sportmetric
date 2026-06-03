import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Bell, Home, Grid, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

// Encabezado principal de la aplicación.
// - Mantiene identidad visual (logo + nombre).
// - En desktop muestra navegación superior; en móvil la navegación principal está en la barra inferior.
const Header = () => {
  const location = useLocation();

  // Accesos rápidos del encabezado (desktop).
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Grid, label: 'Categorías', path: '/categories' },
    { icon: BookOpen, label: 'Protocolos', path: '/category/all' },
  ];
  
  return (
    <header className="bg-white border-b border-outline-variant px-4 py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between max-w-[1200px]">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-primary font-bold text-lg leading-tight">SportMetric</span>
              <span className="text-on-primary-container text-xs font-semibold tracking-wider uppercase">Académico</span>
            </div>
          </Link>

          {/* Navegación de escritorio */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                    isActive 
                      ? "bg-teal-accent/10 text-teal-accent" 
                      : "text-on-surface-variant hover:bg-surface-container"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
            <Bell size={20} />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm cursor-pointer">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
