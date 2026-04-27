import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/guidance', label: 'AI Guidance' },
  { path: '/stories', label: 'Stories' },
  { path: '/shloka', label: 'Shlokas' },
  { path: '/journal', label: 'Journal' },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl transition-all duration-500 ${
          scrolled
            ? 'bg-cosmic-900/90 backdrop-blur-xl border border-gold-500/20 shadow-gold'
            : 'bg-cosmic-900/60 backdrop-blur-md border border-white/10'
        } rounded-2xl px-4 py-3`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif font-bold text-sm shadow-gold group-hover:shadow-gold-lg transition-all duration-300">
              ॐ
            </div>
            <span className="font-serif text-lg font-semibold text-gold-400 group-hover:text-gold-300 transition-colors">
              Dharma Setu
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'text-gold-400 bg-gold-500/10'
                    : 'hover:text-gold-400 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20">
                  <User size={12} className="text-gold-400" />
                  <span className="text-xs text-gold-400 font-medium">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 btn-ghost text-sm py-2 px-3"
                  title="Log out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm py-2 px-4 flex items-center gap-1.5">
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

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-gold-400 hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-4 right-4 z-40 bg-cosmic-800/95 backdrop-blur-xl border border-gold-500/20 rounded-2xl p-4 shadow-card"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
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
              <div className="border-t border-white/[0.06] mt-2 pt-2">
                {user ? (
                  <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all flex items-center gap-2">
                    <LogOut size={14} /> Sign out ({user.name})
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1 btn-ghost text-center text-sm py-2.5">Login</Link>
                    <Link to="/guidance" className="flex-1 btn-primary text-center text-sm py-2.5">Begin</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
