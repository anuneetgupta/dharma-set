import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Social Icons ── */
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

/* ── Social Button (unchanged) ── */
function SocialButton({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.10] text-white/70 text-sm font-medium hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200">
      {icon}<span>{label}</span>
    </button>
  );
}

/* ── Premium Floating-Label Input ── */
function FloatingInput({ label, type, name, value, onChange, icon: Icon, rightElement, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const active = focused || filled;
  return (
    <div className="relative group">
      <div className={`relative flex items-center rounded-2xl border transition-all duration-300 overflow-hidden ${
        focused
          ? 'border-gold-500/60 shadow-[0_0_0_3px_rgba(201,169,110,0.12)]'
          : filled
          ? 'border-white/20'
          : 'border-white/[0.08]'
      } bg-white/[0.03]`}>
        {/* Left icon */}
        <div className={`pl-4 flex-shrink-0 transition-colors duration-300 ${focused ? 'text-gold-400' : 'text-white/25'}`}>
          <Icon size={16} />
        </div>
        {/* Input + floating label */}
        <div className="relative flex-1 px-3 pt-5 pb-2">
          <label className={`absolute left-3 pointer-events-none font-medium transition-all duration-200 ${
            active ? 'top-1.5 text-[10px] text-gold-400/80 tracking-wider uppercase' : 'top-1/2 -translate-y-1/2 text-sm text-white/30'
          }`}>{label}</label>
          <input
            type={type} name={name} value={value} onChange={onChange}
            autoComplete={autoComplete || name}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent text-sm text-white/90 outline-none pt-1 placeholder-transparent"
          />
        </div>
        {/* Right element */}
        {rightElement && <div className="pr-3 flex-shrink-0">{rightElement}</div>}
      </div>
    </div>
  );
}

/* ── Password Strength Bar ── */
function PasswordStrength({ password }) {
  const checks = [
    { label: '6+ chars', ok: password.length >= 6 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={`flex items-center gap-1 text-[10px] transition-colors ${c.ok ? 'text-emerald-400' : 'text-white/25'}`}>
            <CheckCircle size={9} /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export default function Auth() {
  const { login, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [panel, setPanel] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', language_preference: 'en' });

  const handleLoginChange = (e) => { setLoginForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };
  const handleRegChange = (e) => { setRegForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlError = params.get('error');
    if (urlToken) { login(null, urlToken); navigate('/'); }
    else if (urlError) setError('Social authentication failed. Please try again.');
  }, [login, navigate]);

  const handleSocial = (provider) => { window.location.href = `${API_BASE}/auth/${provider.toLowerCase()}`; };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (data.success) { login(data.data, data.data.token); navigate('/'); }
      else setError(data.message || 'Login failed');
    } catch { setError('Cannot connect to server. Please ensure the backend is running.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) { setError('All fields are required'); return; }
    if (regForm.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regForm) });
      const data = await res.json();
      if (data.success) { login(data.data, data.data.token); navigate('/'); }
      else setError(data.message || 'Registration failed');
    } catch { setError('Cannot connect to server. Please ensure the backend is running.'); }
    finally { setLoading(false); }
  };

  const socialButtons = [
    { icon: <GoogleIcon />, label: 'Continue with Google', provider: 'Google' },
    { icon: <FacebookIcon />, label: 'Continue with Facebook', provider: 'Facebook' },
    { icon: <XIcon />, label: 'Continue with X', provider: 'X' },
  ];

  const EyeToggle = (
    <button type="button" onClick={() => setShowPass(s => !s)}
      className="text-white/30 hover:text-gold-400 transition-colors p-1">
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4 relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cosmic-800/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-cosmic-800/60 backdrop-blur-xl shadow-card flex min-h-[560px] sm:min-h-[640px]"
        >
          {/* ════ LEFT — Forms ════ */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">

              {/* ── LOGIN ── */}
              {panel === 'login' && (
                <motion.div key="login"
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 flex flex-col justify-center p-8 sm:p-10">

                  {/* Header */}
                  <div className="mb-7">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />Welcome Back
                    </div>
                    <h1 className="font-serif text-3xl text-white mb-1">Sign In</h1>
                    <p className="text-sm text-white/40">Continue your dharmic journey</p>
                  </div>

                  {/* Social */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {socialButtons.map(s => (
                      <SocialButton key={s.provider} icon={s.icon} label={s.provider} onClick={() => handleSocial(s.provider)} />
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                    <span className="text-[11px] text-white/25 px-1 tracking-wider uppercase">or sign in with email</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                        <span className="mt-0.5">⚠</span>{error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleLogin} className="space-y-3">
                    <FloatingInput label="Email address" type="email" name="email" value={loginForm.email} onChange={handleLoginChange} icon={Mail} autoComplete="email" />
                    <FloatingInput label="Password" type={showPass ? 'text' : 'password'} name="password" value={loginForm.password} onChange={handleLoginChange} icon={Lock} rightElement={EyeToggle} autoComplete="current-password" />

                    {/* Forgot password */}
                    <div className="text-right">
                      <button type="button" className="text-xs text-white/30 hover:text-gold-400 transition-colors">Forgot password?</button>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className="w-full relative overflow-hidden rounded-2xl py-3.5 font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                      style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #A07840 50%, #C9A96E 100%)', backgroundSize: '200% 200%' }}>
                      <span className="relative z-10 flex items-center justify-center gap-2 text-cosmic-900 font-semibold">
                        {loading
                          ? <><div className="w-4 h-4 border-2 border-cosmic-900/40 border-t-cosmic-900 rounded-full animate-spin" /> Signing in...</>
                          : <><LogIn size={15} /> Sign In to Dharma Setu</>}
                      </span>
                    </button>
                  </form>

                  {/* Switch — mobile */}
                  <p className="mt-6 text-sm text-white/35 text-center lg:hidden">
                    No account?{' '}
                    <button onClick={() => { setPanel('register'); setError(''); }} className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">Create one free</button>
                  </p>
                </motion.div>
              )}

              {/* ── REGISTER ── */}
              {panel === 'register' && (
                <motion.div key="register"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 flex flex-col justify-center p-8 sm:p-10 overflow-y-auto">

                  {/* Header */}
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />Start Your Journey
                    </div>
                    <h1 className="font-serif text-3xl text-white mb-1">Create Account</h1>
                    <p className="text-sm text-white/40">Begin your dharmic journey today</p>
                  </div>

                  {/* Social */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {socialButtons.map(s => (
                      <SocialButton key={s.provider} icon={s.icon} label={s.provider} onClick={() => handleSocial(s.provider)} />
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                    <span className="text-[11px] text-white/25 px-1 tracking-wider uppercase">or register with email</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                        <span className="mt-0.5">⚠</span>{error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleRegister} className="space-y-3">
                    <FloatingInput label="Full name" type="text" name="name" value={regForm.name} onChange={handleRegChange} icon={User} autoComplete="name" />
                    <FloatingInput label="Email address" type="email" name="email" value={regForm.email} onChange={handleRegChange} icon={Mail} autoComplete="email" />
                    <div>
                      <FloatingInput label="Password" type={showPass ? 'text' : 'password'} name="password" value={regForm.password} onChange={handleRegChange} icon={Lock} rightElement={EyeToggle} autoComplete="new-password" />
                      <PasswordStrength password={regForm.password} />
                    </div>

                    {/* Language */}
                    <div className="pt-1">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Preferred Language</p>
                      <div className="flex gap-2">
                        {[{ value: 'en', label: '🇬🇧 English' }, { value: 'hi', label: '🇮🇳 हिंदी' }].map(lang => (
                          <button key={lang.value} type="button"
                            onClick={() => setRegForm(f => ({ ...f, language_preference: lang.value }))}
                            className={`flex-1 py-2.5 rounded-2xl text-xs font-medium border transition-all duration-200 ${
                              regForm.language_preference === lang.value
                                ? 'bg-gold-500/15 border-gold-500/50 text-gold-400 shadow-[0_0_0_2px_rgba(201,169,110,0.15)]'
                                : 'border-white/[0.08] text-white/30 hover:border-white/20 hover:text-white/50'
                            }`}>
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Terms notice */}
                    <p className="text-[10px] text-white/20 leading-relaxed">
                      By creating an account, you agree to our{' '}
                      <Link to="/" className="text-gold-500/50 hover:text-gold-400 transition-colors">Terms of Service</Link>
                      {' '}and{' '}
                      <Link to="/" className="text-gold-500/50 hover:text-gold-400 transition-colors">Privacy Policy</Link>.
                    </p>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className="w-full relative overflow-hidden rounded-2xl py-3.5 font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #6366f1 100%)', backgroundSize: '200% 200%' }}>
                      <span className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold">
                        {loading
                          ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account...</>
                          : <><ShieldCheck size={15} /> Create My Account</>}
                      </span>
                    </button>
                  </form>

                  {/* Switch — mobile */}
                  <p className="mt-5 text-sm text-white/35 text-center lg:hidden">
                    Have an account?{' '}
                    <button onClick={() => { setPanel('login'); setError(''); }} className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">Sign in</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ════ RIGHT PANEL (desktop) ════ */}
          <div className="hidden lg:flex w-80 flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cosmic-700 via-cosmic-800 to-cosmic-900 border-l border-white/[0.06]" />
            <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-indigo-500/5" />
            {/* Rings */}
            {[56, 44, 32].map(s => (
              <div key={s} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-${s} h-${s} rounded-full border border-gold-500/10`} />
            ))}
            <AnimatePresence mode="wait">
              {panel === 'login' ? (
                <motion.div key="side-login"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center justify-center p-8 text-center w-full">
                  <div className="font-serif text-5xl text-gold-400 mb-6 om-glow">ॐ</div>
                  <h2 className="font-serif text-2xl text-white mb-3">New to<br/>Dharma Setu?</h2>
                  <p className="text-sm text-white/40 leading-relaxed mb-7">Join thousands of seekers finding clarity through ancient wisdom.</p>
                  <button onClick={() => { setPanel('register'); setError(''); }}
                    className="flex items-center gap-2 btn-secondary text-sm px-6 py-2.5 group">
                    Create Account <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="mt-10 text-xs text-white/15 font-serif italic">"Arise, awake, stop not till the goal is reached."</p>
                </motion.div>
              ) : (
                <motion.div key="side-register"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}
                  className="relative z-10 flex flex-col items-center justify-center p-8 text-center w-full">
                  <div className="font-serif text-5xl text-gold-400 mb-6 om-glow">ॐ</div>
                  <h2 className="font-serif text-2xl text-white mb-3">Already<br/>a Seeker?</h2>
                  <p className="text-sm text-white/40 leading-relaxed mb-7">Sign in to continue your journey, revisit your journal, and find wisdom.</p>
                  <button onClick={() => { setPanel('login'); setError(''); }}
                    className="flex items-center gap-2 btn-secondary text-sm px-6 py-2.5 group">
                    Sign In <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="mt-10 text-xs text-white/15 font-serif italic">"The soul is never born nor dies." — Gita 2.20</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom */}
        <p className="text-center text-xs text-white/20 mt-5">
          Secured with end-to-end encryption &nbsp;·&nbsp;
          <Link to="/" className="text-gold-500/50 hover:text-gold-400 transition-colors">Terms</Link>
          &nbsp;&amp;&nbsp;
          <Link to="/" className="text-gold-500/50 hover:text-gold-400 transition-colors">Privacy</Link>
        </p>
      </div>
    </div>
  );
}
