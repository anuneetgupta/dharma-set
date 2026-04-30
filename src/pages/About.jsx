import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Heart, Lightbulb, Users, ArrowRight, Mail } from 'lucide-react';

function LinkedinIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>
    </svg>
  );
}
function GithubIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );
}
function InstagramIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

const aims = [
  { icon: Target, title: 'Our Mission', color: 'text-gold-400', bg: 'bg-gold-500/10', border: 'border-gold-500/20', description: "To make the timeless wisdom of India's sacred texts — the Bhagavad Gita, Ramayana, and Mahabharata — accessible, relatable, and actionable for every person navigating modern life." },
  { icon: Heart, title: 'Why We Built This', color: 'text-saffron-400', bg: 'bg-saffron-400/10', border: 'border-saffron-400/20', description: "We live in an age of information overload but wisdom drought. Dharma Setu was born to bridge the gap — to translate ancient philosophy into clear, practical guidance for the challenges you face today." },
  { icon: Lightbulb, title: 'Our Vision', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', description: "A world where every person — regardless of religion, background, or belief — can access the clarity of dharmic wisdom. Philosophy, not dogma, is what our generation needs." },
  { icon: Users, title: 'For Everyone', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', description: "Dharma Setu is for students, professionals, parents, and seekers. Whether you are stressed, confused, or simply curious — our platform meets you exactly where you are." },
];

const founders = [
  {
    name: 'JANVI SAHU', role: 'CEO & Founder', tag: 'Visionary & Product', tagColor: 'text-gold-400 bg-gold-500/10 border-gold-500/20',
    bio: "Dharma Setu was born from Janvi's personal realization: while we have advanced technologically, we often struggle emotionally and spiritually. She built this platform to make the profound, practical wisdom of our ancient texts accessible and applicable to modern challenges.",
    img: '/founder.jpg', linkedin: 'https://www.linkedin.com/in/janvi-sahu-0968b8329', github: 'https://github.com/janvi3ssj', instagram: 'https://www.instagram.com/janvi_sahu93',
  },
  {
    name: 'ANUNEET GUPTA', role: 'Co-Founder & CTO', tag: 'Engineering & AI', tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    bio: "Dedicated to building the technological foundation of Dharma Setu, Anuneet ensures that ancient wisdom reaches the modern world through an intuitive, reliable, and beautifully crafted digital experience. He believes technology is the ideal vessel for timeless knowledge.",
    img: '/anuneet.jpg', fallback: 'https://ui-avatars.com/api/?name=Anuneet+Gupta&background=C9A96E&color=fff&size=256', linkedin: 'https://www.linkedin.com/in/anuneet-gupta-57898631a', github: 'https://github.com/anuneetgupta', instagram: 'https://www.instagram.com/anuneet_gupta',
  },
];

const fade = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }) };

export default function About() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cosmic-gradient pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 page-container text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gold-600/20 to-gold-400/10 border border-gold-500/30 shadow-gold om-glow">
              <span className="font-serif text-3xl text-gold-400">ॐ</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />Our Story & Mission
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-white leading-tight mb-5">
            About <span className="shimmer-text">Dharma Setu</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="section-subtitle mx-auto max-w-2xl text-base sm:text-lg">
            We are a small team driven by a big belief — that the wisdom of 5,000 years can and should guide the decisions you make today. Dharma Setu is the bridge between those two worlds.
          </motion.p>
        </div>
      </section>

      {/* AIMS */}
      <section className="py-20">
        <div className="page-container">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="section-title">What We Stand For</h2>
            <p className="section-subtitle mx-auto mt-3">The principles that guide every feature we build.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {aims.map((aim, i) => (
              <motion.div key={aim.title} custom={i} variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`glass-card border ${aim.border} p-7 hover:shadow-card transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${aim.bg} border ${aim.border} flex items-center justify-center mb-5`}>
                  <aim.icon size={22} className={aim.color} />
                </div>
                <h3 className={`font-serif text-xl ${aim.color} mb-3`}>{aim.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{aim.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-14">
        <div className="page-container">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card-gold rounded-2xl py-10 px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[{ value: '700+', label: 'Bhagavad Gita Shlokas' }, { value: '8+', label: 'Epic Stories' }, { value: '3', label: 'Ancient Scriptures' }, { value: '∞', label: 'Insights Available' }].map(s => (
              <div key={s.label}><div className="font-serif text-3xl sm:text-4xl text-gold-400 mb-1">{s.value}</div><div className="text-xs text-white/40">{s.label}</div></div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent pointer-events-none" />
        <div className="page-container relative">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />The Visionaries
            </div>
            <h2 className="section-title">Meet the Founders</h2>
            <p className="section-subtitle mx-auto mt-3">Two builders united by one purpose — to make ancient wisdom radically accessible.</p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {founders.map((f, i) => (
              <motion.div key={f.name} custom={i} variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card border border-white/[0.06] p-8 sm:p-10 hover:border-gold-500/20 transition-all duration-300 flex flex-col items-center text-center">
                <div className="relative w-36 h-36 mb-6 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 opacity-20 blur-xl" />
                  <div className="absolute inset-0 rounded-full border border-gold-500/30" />
                  <img src={f.img} alt={f.name} className="w-full h-full object-cover rounded-full relative z-10 border-2 border-white/10" onError={(e) => { if (f.fallback) { e.target.onerror = null; e.target.src = f.fallback; } }} />
                </div>
                <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full border mb-4 ${f.tagColor}`}>{f.tag}</span>
                <h3 className="font-serif text-2xl text-gold-400 mb-1">{f.name}</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-5">{f.role}</p>
                <p className="text-sm text-white/60 leading-relaxed mb-7 font-light">{f.bio}</p>
                <div className="flex items-center gap-3">
                  <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 transition-all"><LinkedinIcon size={18} /></a>
                  <a href={f.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all"><GithubIcon size={18} /></a>
                  <a href={f.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-[#E1306C] hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10 transition-all"><InstagramIcon size={18} /></a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="page-container">
          <motion.div variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative overflow-hidden glass-card-gold text-center py-14 px-6 rounded-3xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="font-serif text-5xl text-gold-400 mb-4 om-glow">ॐ</div>
              <h2 className="font-serif text-3xl sm:text-4xl text-white mb-4">Ready to Walk the Path?</h2>
              <p className="text-white/50 mb-8 max-w-lg mx-auto font-light">Join thousands of seekers who have found clarity through the wisdom of Dharma Setu.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/guidance" className="btn-primary inline-flex items-center gap-2">Start for Free <ArrowRight size={15} /></Link>
                <Link to="/contact" className="btn-secondary inline-flex items-center gap-2"><Mail size={15} /> Contact Us</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
