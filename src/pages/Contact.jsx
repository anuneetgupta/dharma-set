import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Send, AtSign, Globe, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

function WhatsappIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.012 0C5.398 0 .056 5.348.056 12.01c0 2.115.546 4.174 1.585 5.978L0 24l6.177-1.619c1.782.97 3.793 1.488 5.835 1.49h.005c6.612 0 11.954-5.35 11.959-12.013.003-3.228-1.246-6.262-3.518-8.536C18.19 1.25 15.228.003 12.012 0zm0 21.99h-.004c-1.895-.001-3.755-.51-5.378-1.472l-.386-.229-3.666.962.979-3.573-.251-.4c-1.057-1.683-1.613-3.633-1.612-5.638.004-5.918 4.816-10.73 10.738-10.73 2.867.001 5.56 1.117 7.587 3.146 2.025 2.03 3.14 4.726 3.137 7.595-.005 5.922-4.817 10.735-10.74 10.735zm5.887-8.043c-.322-.16-1.905-.94-2.202-1.05-.297-.107-.512-.16-.728.16-.215.32-.834 1.05-.102 1.21-.19.16-.38.18-.7.02-.322-.16-1.36-.5-2.592-1.6-.957-.853-1.603-1.908-1.792-2.227-.19-.32-.02-.492.14-.652.14-.143.32-.375.48-.563.16-.188.215-.32.322-.533.107-.215.053-.4-.027-.56-.08-.16-.728-1.758-1.002-2.408-.262-.63-.53-.54-.728-.55-.187-.008-.403-.008-.62-.008-.215 0-.565.08-.86.4-.297.32-1.128 1.1-1.128 2.688 0 1.587 1.157 3.12 1.318 3.336.16.216 2.278 3.478 5.518 4.878.77.332 1.37.53 1.838.678.775.247 1.48.212 2.038.128.62-.094 1.906-.778 2.174-1.492.27-.714.27-1.326.188-1.455-.08-.13-.296-.21-.618-.37z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="igGradContact" cx="30%" cy="107%" r="130%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#igGradContact)" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#igGradContact)" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="url(#igGradContact)" />
    </svg>
  );
}

const contactMethods = [
  { icon: Mail, label: 'Email Us', value: 'dharmasetu03@gmail.com', href: 'mailto:dharmasetu03@gmail.com', color: 'text-gold-400', border: 'border-gold-500/20', bg: 'bg-gold-500/10' },
  { icon: InstagramIcon, label: 'Instagram', value: '@dharma_setu_offical', href: 'https://www.instagram.com/dharma_setu_offical?igsh=MTk0ZWM0N2N4OW8yeA==', color: 'text-saffron-400', border: 'border-saffron-400/20', bg: 'bg-saffron-400/10' },
  { icon: WhatsappIcon, label: 'WhatsApp', value: 'Chat with Us', href: 'https://chat.whatsapp.com/CBQcrOr2ENaGfDUXck4yye?s=cl&p=a&mlu=4', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
  { icon: MapPin, label: 'Based In', value: 'India 🇮🇳', href: null, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
];

const subjects = ['General Inquiry', 'Bug Report', 'Partnership', 'Feature Request', 'Press / Media', 'Other'];

const fade = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }) };

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setStatus(null);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setErrorMsg(data.message || 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Could not reach the server. Please email us directly.');
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cosmic-gradient pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 page-container text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600/20 to-indigo-400/10 border border-indigo-500/30">
              <MessageCircle size={28} className="text-indigo-400" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />Get in Touch
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-white leading-tight mb-5">
            We'd Love to <span className="shimmer-text">Hear From You</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="section-subtitle mx-auto max-w-xl text-base sm:text-lg">
            Whether you have a question, a suggestion, or simply want to say namaste — our inbox is always open.
          </motion.p>
        </div>
      </section>

      {/* CONTACT METHODS + FORM */}
      <section className="pb-24">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">

            {/* Left — contact cards */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <motion.h2 variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="font-serif text-xl text-white/80 mb-2">Reach Us</motion.h2>
              {contactMethods.map((m, i) => (
                <motion.div key={m.label} custom={i} variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  {m.href ? (
                    <a href={m.href} target={m.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                      className={`flex items-center gap-4 glass-card border ${m.border} p-4 hover:shadow-card hover:border-opacity-60 transition-all duration-300 group`}>
                      <div className={`w-10 h-10 rounded-xl ${m.bg} border ${m.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <m.icon size={18} className={m.color} />
                      </div>
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-wider">{m.label}</p>
                        <p className={`text-sm font-medium ${m.color}`}>{m.value}</p>
                      </div>
                    </a>
                  ) : (
                    <div className={`flex items-center gap-4 glass-card border ${m.border} p-4`}>
                      <div className={`w-10 h-10 rounded-xl ${m.bg} border ${m.border} flex items-center justify-center flex-shrink-0`}>
                        <m.icon size={18} className={m.color} />
                      </div>
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-wider">{m.label}</p>
                        <p className={`text-sm font-medium ${m.color}`}>{m.value}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Quote */}
              <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card border border-gold-500/20 p-6 mt-2">
                <div className="font-serif text-3xl text-gold-400/60 mb-2">ॐ</div>
                <p className="text-sm text-white/40 italic font-light leading-relaxed">
                  "Speak your truth quietly and clearly." — inspired by ancient dharmic wisdom.
                </p>
              </motion.div>
            </div>

            {/* Right — form */}
            <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-3">
              <div className="glass-card border border-white/[0.08] p-8 sm:p-10 rounded-2xl">
                <h2 className="font-serif text-2xl text-gold-400 mb-2">Send a Message</h2>
                <p className="text-sm text-white/40 mb-8">We typically respond within 24 hours.</p>

                {status === 'success' && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
                    <CheckCircle size={16} /> Your message has been sent! We'll be in touch soon. 🙏
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                    <AlertCircle size={16} /> {errorMsg || 'Something went wrong. Please try again or email us directly.'}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name"
                        className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/50 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all duration-200" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Email *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                        className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/50 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all duration-200" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange}
                      className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/50 rounded-xl px-4 py-3 text-sm text-white/80 outline-none transition-all duration-200 appearance-none">
                      <option value="" className="bg-gray-900">Choose a topic...</option>
                      {subjects.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Share your thoughts, questions, or ideas..."
                      className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/50 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all duration-200 resize-none" />
                  </div>

                  <button type="submit" disabled={sending}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
                    {sending
                      ? <><div className="w-4 h-4 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" /> Sending...</>
                      : <><Send size={15} /> Send Message</>
                    }
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
