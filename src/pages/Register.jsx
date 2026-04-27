import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', language_preference: 'en' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        login(data.data, data.data.token);
        navigate('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card border border-white/[0.08] p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold-600/30 to-gold-400/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-gold">
              <span className="font-serif text-2xl sm:text-3xl text-gold-400">ॐ</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-gold-400 mb-1">Begin Your Journey</h1>
            <p className="text-sm text-white/40">Create your Dharma Setu account</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/40 rounded-xl pl-11 pr-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/40 rounded-xl pl-11 pr-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/40 rounded-xl pl-11 pr-11 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Language preference */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Preferred Language</label>
              <div className="flex gap-3">
                {[{ value: 'en', label: '🇬🇧 English' }, { value: 'hi', label: '🇮🇳 हिंदी' }].map(lang => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, language_preference: lang.value }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${
                      form.language_preference === lang.value
                        ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                        : 'border-white/[0.08] text-white/30 hover:border-white/20'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" />
              ) : (
                <><UserPlus size={15} /> Create Account</>
              )}
            </button>
          </form>

          <div className="sacred-divider my-6">
            <span className="text-xs text-white/20">or</span>
          </div>

          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-6 font-serif italic">
          "Arise, awake, and stop not till the goal is reached." — Swami Vivekananda
        </p>
      </motion.div>
    </div>
  );
}
