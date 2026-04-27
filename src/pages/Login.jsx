import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        login(data.data, data.data.token);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Cannot connect to server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-card-gold p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold-600/30 to-gold-400/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-gold">
              <span className="font-serif text-2xl sm:text-3xl text-gold-400">ॐ</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-gold-400 mb-1">Welcome Back</h1>
            <p className="text-sm text-white/40">Continue your journey with Dharma Setu</p>
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
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/40 rounded-xl pl-11 pr-11 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all"
                  autoComplete="current-password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" />
              ) : (
                <><LogIn size={15} /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="sacred-divider my-6">
            <span className="text-xs text-white/20">or</span>
          </div>

          <p className="text-center text-sm text-white/40">
            New to Dharma Setu?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
              Create an account
            </Link>
          </p>
        </div>

        {/* Quote */}
        <p className="text-center text-xs text-white/20 mt-6 font-serif italic">
          "The soul is never born nor dies at any time." — Bhagavad Gita 2.20
        </p>
      </motion.div>
    </div>
  );
}
