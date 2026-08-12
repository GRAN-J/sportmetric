import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  FileText, 
  ClipboardList,
  TrendingUp,
  Settings,
  LogOut, 
  ChevronRight,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useState } from 'react';
import { logout } from '../services/authService';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Usuarios' },
    { path: '/admin/categories', icon: Layers, label: 'Categorías' },
    { path: '/admin/protocols', icon: FileText, label: 'Protocolos' },
    { path: '/admin/evaluations', icon: ClipboardList, label: 'Registros' },
    { path: '/admin/statistics', icon: TrendingUp, label: 'Estadísticas' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-teal-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50`}
      >
        <div className="p-6 flex items-center justify-between border-b border-teal-800">
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Admin Panel</span>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-teal-800 rounded transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-teal-600 text-white shadow-lg' 
                    : 'text-teal-100 hover:bg-teal-800 hover:text-white'
                }`}
              >
                <item.icon size={22} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                {isSidebarOpen && isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-teal-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-4 px-4 py-3 w-full text-teal-100 hover:bg-teal-700 hover:text-white rounded-lg transition-all"
          >
            <Home size={22} />
            {isSidebarOpen && <span className="font-medium">Volver a la aplicacion</span>}
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full text-teal-100 hover:bg-red-600 hover:text-white rounded-lg transition-all"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
