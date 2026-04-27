import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Social button icons (inline SVG) ── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
    </svg>
  );
}

function SocialButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.10] text-white/70 text-sm font-medium hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 group"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function InputField({ label, type, name, value, onChange, placeholder, icon: Icon, rightElement }) {
  return (
    <div>
      <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/50 rounded-xl pl-11 pr-11 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all duration-200"
          autoComplete={name}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export default function Auth() {
  const { login, API_BASE } = useAuth();
  const navigate = useNavigate();

  // Panel: 'login' | 'register'
  const [panel, setPanel] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', language_preference: 'en' });

  const handleLoginChange = (e) => {
    setLoginForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };
  const handleRegChange = (e) => {
    setRegForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSocial = (provider) => {
    // Placeholder — wire up OAuth provider here
    alert(`${provider} OAuth coming soon! Connect your OAuth provider in the backend.`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) { login(data.data, data.data.token); navigate('/'); }
      else setError(data.message || 'Login failed');
    } catch {
      setError('Cannot connect to server. Please ensure the backend is running.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) { setError('All fields are required'); return; }
    if (regForm.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (data.success) { login(data.data, data.data.token); navigate('/'); }
      else setError(data.message || 'Registration failed');
    } catch {
      setError('Cannot connect to server. Please ensure the backend is running.');
    } finally { setLoading(false); }
  };

  const socialButtons = [
    { icon: <GoogleIcon />, label: 'Continue with Google', provider: 'Google' },
    { icon: <FacebookIcon />, label: 'Continue with Facebook', provider: 'Facebook' },
    { icon: <XIcon />, label: 'Continue with X', provider: 'X' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4 relative overflow-x-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl">
        {/* ── Card shell with side-by-side panels ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-cosmic-800/60 backdrop-blur-xl shadow-card flex min-h-[500px] sm:min-h-[600px]"
        >

          {/* ════ LEFT PANEL — Forms ════ */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {panel === 'login' ? (
                /* ── LOGIN FORM ── */
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 flex flex-col justify-center p-8 sm:p-10"
                >
                  {/* Header */}
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                      Welcome Back
                    </div>
                    <h1 className="font-serif text-3xl text-gold-400 mb-1">Sign In</h1>
                    <p className="text-sm text-white/40">Continue your dharmic journey</p>
                  </div>

                  {/* Social buttons */}
                  <div className="space-y-2.5 mb-5">
                    {socialButtons.map(s => (
                      <SocialButton key={s.provider} icon={s.icon} label={s.label} onClick={() => handleSocial(s.provider)} />
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-white/[0.08]" />
                    <span className="text-xs text-white/25">or with email</span>
                    <div className="flex-1 h-px bg-white/[0.08]" />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </motion.div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <InputField label="Email" type="email" name="email" value={loginForm.email}
                      onChange={handleLoginChange} placeholder="you@example.com" icon={Mail} />
                    <InputField label="Password" type={showPass ? 'text' : 'password'} name="password"
                      value={loginForm.password} onChange={handleLoginChange} placeholder="••••••••" icon={Lock}
                      rightElement={
                        <button type="button" onClick={() => setShowPass(s => !s)}
                          className="text-white/30 hover:text-white/60 transition-colors p-1">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                    />
                    <button type="submit" disabled={loading}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-1 disabled:opacity-40 disabled:cursor-not-allowed">
                      {loading
                        ? <div className="w-4 h-4 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" />
                        : <><LogIn size={15} /> Sign In</>}
                    </button>
                  </form>

                  {/* Switch to register (mobile only — desktop uses the panel) */}
                  <p className="mt-5 text-sm text-white/40 text-center lg:hidden">
                    No account?{' '}
                    <button onClick={() => { setPanel('register'); setError(''); }}
                      className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                      Create one
                    </button>
                  </p>
                </motion.div>
              ) : (
                /* ── REGISTER FORM ── */
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 flex flex-col justify-center p-8 sm:p-10 overflow-y-auto"
                >
                  {/* Header */}
                  <div className="mb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      New Here?
                    </div>
                    <h1 className="font-serif text-3xl text-gold-400 mb-1">Create Account</h1>
                    <p className="text-sm text-white/40">Begin your dharmic journey today</p>
                  </div>

                  {/* Social buttons */}
                  <div className="space-y-2.5 mb-4">
                    {socialButtons.map(s => (
                      <SocialButton key={s.provider} icon={s.icon} label={s.label} onClick={() => handleSocial(s.provider)} />
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/[0.08]" />
                    <span className="text-xs text-white/25">or with email</span>
                    <div className="flex-1 h-px bg-white/[0.08]" />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </motion.div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <InputField label="Full Name" type="text" name="name" value={regForm.name}
                      onChange={handleRegChange} placeholder="Your name" icon={User} />
                    <InputField label="Email" type="email" name="email" value={regForm.email}
                      onChange={handleRegChange} placeholder="you@example.com" icon={Mail} />
                    <InputField label="Password" type={showPass ? 'text' : 'password'} name="password"
                      value={regForm.password} onChange={handleRegChange} placeholder="Min. 6 characters" icon={Lock}
                      rightElement={
                        <button type="button" onClick={() => setShowPass(s => !s)}
                          className="text-white/30 hover:text-white/60 transition-colors p-1">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                    />

                    {/* Language preference */}
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Language</label>
                      <div className="flex gap-2">
                        {[{ value: 'en', label: '🇬🇧 English' }, { value: 'hi', label: '🇮🇳 हिंदी' }].map(lang => (
                          <button key={lang.value} type="button"
                            onClick={() => setRegForm(f => ({ ...f, language_preference: lang.value }))}
                            className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${
                              regForm.language_preference === lang.value
                                ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                                : 'border-white/[0.08] text-white/30 hover:border-white/20'
                            }`}>
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
                      {loading
                        ? <div className="w-4 h-4 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" />
                        : <><UserPlus size={15} /> Create Account</>}
                    </button>
                  </form>

                  {/* Switch to login (mobile only) */}
                  <p className="mt-4 text-sm text-white/40 text-center lg:hidden">
                    Have an account?{' '}
                    <button onClick={() => { setPanel('login'); setError(''); }}
                      className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ════ RIGHT PANEL — Sliding info / CTA (desktop only) ════ */}
          <div className="hidden lg:flex w-80 flex-shrink-0 relative overflow-hidden">
            {/* Decorative gradient panel */}
            <div className="absolute inset-0 bg-gradient-to-br from-cosmic-700 via-cosmic-800 to-cosmic-900 border-l border-white/[0.06]" />
            <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-indigo-500/5" />

            {/* Decorative chakra ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-gold-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-gold-500/15" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-gold-500/20" />

            <AnimatePresence mode="wait">
              {panel === 'login' ? (
                <motion.div
                  key="side-login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center justify-center p-8 text-center w-full"
                >
                  <div className="font-serif text-5xl text-gold-400 mb-5 om-glow">ॐ</div>
                  <h2 className="font-serif text-2xl text-white mb-3">New to<br/>Dharma Setu?</h2>
                  <p className="text-sm text-white/45 leading-relaxed mb-6">
                    Join thousands of seekers finding clarity through ancient wisdom.
                  </p>
                  <button
                    onClick={() => { setPanel('register'); setError(''); }}
                    className="flex items-center gap-2 btn-secondary text-sm px-6 py-2.5 group"
                  >
                    Create Account
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="mt-8 text-xs text-white/20 font-serif italic">
                    "Arise, awake, stop not till the goal is reached."
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="side-register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center justify-center p-8 text-center w-full"
                >
                  <div className="font-serif text-5xl text-gold-400 mb-5 om-glow">ॐ</div>
                  <h2 className="font-serif text-2xl text-white mb-3">Already<br/>a Seeker?</h2>
                  <p className="text-sm text-white/45 leading-relaxed mb-6">
                    Sign in to continue your journey, revisit your journal, and find wisdom.
                  </p>
                  <button
                    onClick={() => { setPanel('login'); setError(''); }}
                    className="flex items-center gap-2 btn-secondary text-sm px-6 py-2.5 group"
                  >
                    Sign In
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="mt-8 text-xs text-white/20 font-serif italic">
                    "The soul is never born nor dies." — Gita 2.20
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </motion.div>

        {/* Bottom link */}
        <p className="text-center text-xs text-white/25 mt-5">
          By continuing, you agree to our{' '}
          <Link to="/" className="text-gold-500/60 hover:text-gold-400 transition-colors">Terms</Link>
          {' & '}
          <Link to="/" className="text-gold-500/60 hover:text-gold-400 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
