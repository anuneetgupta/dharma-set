import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/guidance', label: 'AI Guidance' },
  { path: '/stories', label: 'Stories' },
  { path: '/shloka', label: 'Shlokas' },
  { path: '/journal', label: 'Journal' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full transition-all duration-500 ${
          scrolled
            ? 'bg-cosmic-900/95 backdrop-blur-xl border-b border-gold-500/20 shadow-gold'
            : 'bg-cosmic-900/80 backdrop-blur-md border-b border-white/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo — left */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif font-bold text-sm shadow-gold group-hover:shadow-gold-lg transition-all duration-300 flex-shrink-0">
                ॐ
              </div>
              <span className="font-serif text-lg font-semibold text-gold-400 group-hover:text-gold-300 transition-colors whitespace-nowrap">
                Dharma Setu
              </span>
            </Link>

            {/* Desktop nav links — center */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link px-3 py-1.5 rounded-lg transition-all duration-200 text-sm ${
                    location.pathname === link.path
                      ? 'text-gold-400 bg-gold-500/10'
                      : 'hover:text-gold-400 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side — CTA / Auth */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {user ? (
                /* Logged-in user avatar + dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.10] hover:border-gold-500/30 hover:bg-white/[0.07] transition-all duration-200 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif font-bold text-xs">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors max-w-24 truncate">
                      {user.name?.split(' ')[0] || 'Seeker'}
                    </span>
                    <ChevronDown size={13} className={`text-white/40 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-cosmic-800/98 backdrop-blur-xl border border-white/[0.10] rounded-xl shadow-card overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                          <p className="text-xs text-white/40 truncate">{user.email}</p>
                        </div>
                        <Link to="/journal"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-gold-400 hover:bg-white/[0.04] transition-all">
                          <User size={14} /> My Journal
                        </Link>
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-all w-full text-left">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Guest — Login + Begin */
                <>
                  <Link
                    to="/auth"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-gold-400 hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/[0.08]"
                  >
                    <LogIn size={14} />
                    Login
                  </Link>
                  <Link to="/guidance" className="flex items-center gap-1.5 btn-primary text-sm py-2 px-4">
                    <Sparkles size={14} />
                    Begin
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-gold-400 hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-cosmic-800/98 backdrop-blur-xl border-b border-gold-500/20 shadow-card"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-gold-400 bg-gold-500/10'
                      : 'text-white/60 hover:text-gold-400 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/[0.06] mt-2 pt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif font-bold text-sm">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm text-white/80 font-medium">{user.name}</p>
                        <p className="text-xs text-white/35">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06] transition-all text-left">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth"
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-gold-400 hover:bg-white/5 transition-all">
                      <LogIn size={15} /> Login / Register
                    </Link>
                    <Link to="/guidance" className="btn-primary w-full text-center text-sm py-3 block">
                      Begin Your Journey
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
