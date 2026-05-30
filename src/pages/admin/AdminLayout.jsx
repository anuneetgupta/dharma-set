import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Megaphone, 
  Users, CreditCard, Settings, LogOut, Home, Palette, PenLine, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', to: '/admin' },
  { icon: BookOpen, label: 'Courses', to: '/admin/courses' },
  { icon: Palette, label: 'Homepage CMS', to: '/admin/cms' },
  { icon: Megaphone, label: 'Announcements', to: '/admin/announcements' },
  { icon: Users, label: 'Users', to: '/admin/users' },
  { icon: PenLine, label: 'Journal Review', to: '/admin/journals' },
  { icon: Mail, label: 'Contact Inbox', to: '/admin/contacts' },
  { icon: CreditCard, label: 'Payments', to: '/admin/payments' },
  { icon: Settings, label: 'Site Settings', to: '/admin/settings' },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cosmic-900 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-cosmic-800/50 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 text-gold-400 font-serif text-xl">
            <span className="om-glow">ॐ</span>
            <h2>Dharma Admin</h2>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <Home size={18} />
            View Site
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Top Header (Mobile view + User info) */}
        <header className="h-16 border-b border-white/10 bg-cosmic-800/30 flex items-center justify-end px-8 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-indigo-500 flex items-center justify-center text-cosmic-900 font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-white/80 font-medium">{user?.name}</span>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
