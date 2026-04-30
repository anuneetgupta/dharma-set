import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Send, AtSign, Globe, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

const contactMethods = [
  { icon: Mail, label: 'Email Us', value: 'dharmasetu@gmail.com', href: 'mailto:dharmasetu@gmail.com', color: 'text-gold-400', border: 'border-gold-500/20', bg: 'bg-gold-500/10' },
  { icon: AtSign, label: 'Instagram', value: '@dharmasetu', href: 'https://www.instagram.com', color: 'text-saffron-400', border: 'border-saffron-400/20', bg: 'bg-saffron-400/10' },
  { icon: Globe, label: 'LinkedIn', value: 'Dharma Setu', href: 'https://www.linkedin.com', color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10' },
  { icon: MapPin, label: 'Based In', value: 'India 🇮🇳', href: null, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
];

const subjects = ['General Inquiry', 'Bug Report', 'Partnership', 'Feature Request', 'Press / Media', 'Other'];

const fade = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }) };

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setStatus(null);
    // Simulate API call — replace with real endpoint
    await new Promise(r => setTimeout(r, 1400));
    setSending(false);
    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
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
                    <AlertCircle size={16} /> Something went wrong. Please try again or email us directly.
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
