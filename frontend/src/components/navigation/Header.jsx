import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Home, Grid, BookOpen, LogOut, LayoutDashboard, User, LogIn, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { getUser, logout } from '../../services/authService';

/**
 * Encabezado principal de la aplicación.
 */
const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const user = getUser();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Grid, label: 'Categorías', path: '/categories' },
    { icon: BookOpen, label: 'Protocolos', path: '/category/all' },
  ];
  
  return (
    <header className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 border-b border-outline-variant px-4 py-2 md:py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between max-w-[1200px]">
        <div className="flex items-center gap-4 md:gap-8 min-w-0">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img
              src="/assets/logos/logo-principal.svg"
              alt="Logo principal de SportMetric Academic"
              className="h-10 md:h-11 w-auto shrink-0"
            />
          </Link>

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
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
            <Bell size={19} />
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 hover:bg-surface-container p-1 pr-2 rounded-full transition-all border border-transparent hover:border-outline-variant"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm">
                  {getInitials(user.name)}
                </div>
                <ChevronDown size={14} className={clsx("text-gray-400 transition-transform", isMenuOpen && "rotate-180")} />
              </button>

              {/* Menú Desplegable */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-outline-variant overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                    <p className="font-bold text-primary text-sm truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{user.role}</p>
                  </div>
                  
                  <div className="p-2">
                    {user.role === 'ADMIN' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-all"
                      >
                        <LayoutDashboard size={18} />
                        Panel Admin
                      </Link>
                    )}
                    <Link 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-all"
                    >
                      <User size={18} />
                      Mi Perfil
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all mt-1"
                    >
                      <LogOut size={18} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
