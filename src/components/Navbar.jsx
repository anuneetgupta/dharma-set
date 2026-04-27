import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/guidance', label: 'AI Guidance' },
  { path: '/stories', label: 'Stories' },
  { path: '/shloka', label: 'Shlokas' },
  { path: '/journal', label: 'Journal' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'bg-cosmic-900/95 backdrop-blur-xl border-b border-gold-500/20 shadow-gold'
            : 'bg-cosmic-900/80 backdrop-blur-md border-b border-white/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">

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

            {/* CTA — right */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link to="/guidance" className="flex items-center gap-1.5 btn-primary text-sm py-2 px-4">
                <Sparkles size={14} />
                Begin
              </Link>
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
            className="fixed top-16 left-0 right-0 z-40 bg-cosmic-800/98 backdrop-blur-xl border-b border-gold-500/20 shadow-card"
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
              <div className="pt-2 pb-1">
                <Link to="/guidance" className="btn-primary w-full text-center text-sm py-3 block">
                  Begin Your Journey
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
