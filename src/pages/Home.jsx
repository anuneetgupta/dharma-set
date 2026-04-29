import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Sparkles, BookOpen, PenLine, ScrollText, ArrowRight, Star } from 'lucide-react';

/* ─── Social Icons ─── */
function LinkedinIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
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

/* ─── Sudarshana Chakra SVG Component ─── */
function SudarshanaChakra() {
  // Build spoke paths: 16 flame-tipped spokes radiating from center
  const SPOKES = 16;
  const spokeEls = Array.from({ length: SPOKES }, (_, i) => {
    const angle = (i / SPOKES) * 360;
    return (
      <g key={i} transform={`rotate(${angle} 200 200)`}>
        {/* Main spoke */}
        <line x1="200" y1="200" x2="200" y2="60" stroke="url(#spokeGrad)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Flame tip */}
        <ellipse cx="200" cy="54" rx="5" ry="10" fill="url(#flameGrad)" opacity="0.85" />
        {/* Mid-dot */}
        <circle cx="200" cy="115" r="2.2" fill="#C9A96E" opacity="0.5" />
      </g>
    );
  });

  // Inner lotus petals (8)
  const PETALS = 8;
  const petalEls = Array.from({ length: PETALS }, (_, i) => {
    const angle = (i / PETALS) * 360;
    return (
      <g key={i} transform={`rotate(${angle} 200 200)`}>
        <ellipse cx="200" cy="168" rx="7" ry="14" fill="url(#petalGrad)" opacity="0.7" />
      </g>
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.6, ease: 'easeOut' }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
      style={{ width: 'min(520px, 90vw)', height: 'min(520px, 90vw)' }}
    >
      <svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Spoke gradient — gold to transparent */}
          <linearGradient id="spokeGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#C9A96E" stopOpacity="0" />
            <stop offset="40%" stopColor="#C9A96E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F0DFB5" stopOpacity="0.9" />
          </linearGradient>
          {/* Flame tip gradient */}
          <radialGradient id="flameGrad" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#FFF0C0" stopOpacity="1" />
            <stop offset="60%" stopColor="#C9A96E" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9A7A35" stopOpacity="0" />
          </radialGradient>
          {/* Lotus petal gradient */}
          <radialGradient id="petalGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F0DFB5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C9A96E" stopOpacity="0.2" />
          </radialGradient>
          {/* Outer ring glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Soft glow filter for hub */}
          <filter id="hubGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Outermost pulsing ring (fades in/out via CSS animation) ── */}
        <circle
          cx="200" cy="200" r="190"
          fill="none"
          stroke="#C9A96E"
          strokeWidth="0.6"
          strokeDasharray="6 10"
          opacity="0.25"
          style={{ animation: 'chakraPulse 4s ease-in-out infinite' }}
        />

        {/* ── Outer decorative ring ── */}
        <circle cx="200" cy="200" r="178" fill="none" stroke="#C9A96E" strokeWidth="1" opacity="0.3" filter="url(#glow)" />
        <circle cx="200" cy="200" r="173" fill="none" stroke="#E8D5A3" strokeWidth="0.4" opacity="0.2" />

        {/* ── 16 spokes + flame tips (clockwise rotation) ── */}
        <g style={{ transformOrigin: '200px 200px', animation: 'chakraSpin 18s linear infinite' }}>
          {spokeEls}
        </g>

        {/* ── Mid ring ── */}
        <circle cx="200" cy="200" r="126" fill="none" stroke="#C9A96E" strokeWidth="1.2" opacity="0.4" filter="url(#glow)" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#E8D5A3" strokeWidth="0.5" opacity="0.15" />

        {/* ── Counter-rotating inner spoke layer (8 shorter spokes) ── */}
        <g style={{ transformOrigin: '200px 200px', animation: 'chakraCounterSpin 12s linear infinite' }}>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * 360;
            return (
              <g key={i} transform={`rotate(${angle} 200 200)`}>
                <line x1="200" y1="200" x2="200" y2="90" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                <circle cx="200" cy="92" r="3" fill="#E8D5A3" opacity="0.5" />
              </g>
            );
          })}
        </g>

        {/* ── Inner spoke ring ── */}
        <circle cx="200" cy="200" r="80" fill="none" stroke="#C9A96E" strokeWidth="1" opacity="0.5" filter="url(#glow)" />

        {/* ── Lotus petals (counter-rotating slowly) ── */}
        <g style={{ transformOrigin: '200px 200px', animation: 'chakraSpin 30s linear infinite reverse' }}>
          {petalEls}
        </g>

        {/* ── Hub circle ── */}
        <circle cx="200" cy="200" r="30" fill="none" stroke="#C9A96E" strokeWidth="1.5" opacity="0.7" filter="url(#hubGlow)" />
        <circle cx="200" cy="200" r="24" fill="rgba(201,169,110,0.08)" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.6" />
        <circle cx="200" cy="200" r="8" fill="url(#flameGrad)" opacity="0.9" filter="url(#hubGlow)" />

        {/* ── Ambient glow backdrop ── */}
        <circle cx="200" cy="200" r="185" fill="none" stroke="url(#spokeGrad)" strokeWidth="0" opacity="0" />
      </svg>

      {/* Radial gold glow behind the chakra */}
      <div className="absolute inset-0 rounded-full bg-radial-gold pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.08) 0%, rgba(123,110,200,0.04) 50%, transparent 70%)',
      }} />
    </motion.div>
  );
}
import ShlokaCard from '../components/ShlokaCard';
import { shlokas, getDailyShlokaIndex } from '../data/shlokas';

const features = [
  {
    icon: Sparkles,
    title: 'AI Spiritual Guidance',
    description: 'Share what\'s on your mind. Our AI maps your emotions to relevant Gita shlokas and epic stories — giving you personalized, grounded wisdom.',
    link: '/guidance',
    color: 'text-gold-400',
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/20',
  },
  {
    icon: ScrollText,
    title: 'Sacred Stories',
    description: 'Ramayana & Mahabharata scenarios filtered by emotion and life situation. Every ancient crisis has a modern mirror.',
    link: '/stories',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: BookOpen,
    title: 'Shloka Library',
    description: 'Explore 700 verses of the Bhagavad Gita, searchable by emotion, chapter, or life situation. Wisdom at your fingertips.',
    link: '/shloka',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: PenLine,
    title: 'Reflection Journal',
    description: 'Write freely. Our AI reflects your journal entries back through the lens of dharmic wisdom — helping you see your patterns clearly.',
    link: '/journal',
    color: 'text-saffron-400',
    bg: 'bg-saffron-400/10',
    border: 'border-saffron-400/20',
  },
];

const testimonials = [
  {
    text: "I was spiraling with exam anxiety. Dharma Setu showed me Gita 2.47 — 'you have no claim on the fruits.' I actually slept that night.",
    name: "Aryan K.",
    role: "Engineering Student, Pune",
    rating: 5,
  },
  {
    text: "The stories section is something else. Reading Draupadi's story when I was dealing with workplace injustice hit different. I stopped apologizing for asking the right questions.",
    name: "Priya M.",
    role: "Marketing Professional, Bangalore",
    rating: 5,
  },
  {
    text: "I'm not religious at all. But the explanations here aren't preachy — they're logical. It's philosophy, not religion. I use it weekly.",
    name: "Rahul T.",
    role: "Product Designer, Mumbai",
    rating: 5,
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Share Your Feeling',
    description: 'Type what\'s weighing on you — or pick an emotion. No judgment, no filter needed.',
  },
  {
    step: '02',
    title: 'AI Finds Your Wisdom',
    description: 'Our engine maps your emotional state to relevant shlokas, stories, and practical teachings.',
  },
  {
    step: '03',
    title: 'Walk with Clarity',
    description: 'Receive actionable insights grounded in ancient wisdom — explained for modern life.',
  },
];

export default function Home() {
  const dailyShloka = shlokas[getDailyShlokaIndex()];
  const particleRef = useRef(null);

  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-cosmic-gradient" />
        <canvas ref={particleRef} id="particle-canvas" className="absolute inset-0 w-full h-full" />

        {/* Sudarshana Chakra */}
        <SudarshanaChakra />
        {/* Deep indigo ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center page-container pt-20 sm:pt-24 pb-16">
          {/* Om symbol */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gold-600/20 to-gold-400/10 border border-gold-500/30 shadow-gold-lg om-glow">
              <span className="font-serif text-3xl sm:text-4xl text-gold-400">ॐ</span>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium mb-8"
          >
            <Sparkles size={12} />
            AI-Powered Spiritual Guidance
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight mb-5 sm:mb-6"
          >
            Ancient Wisdom
            <br />
            <span className="shimmer-text">for Modern Minds</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="section-subtitle mx-auto mb-8 sm:mb-10 text-base sm:text-lg md:text-xl px-2"
          >
            Dharma Setu bridges your everyday struggles with the timeless wisdom of
            Bhagavad Gita, Ramayana & Mahabharata — translated into clarity, not lectures.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0"
          >
            <Link to="/guidance" className="btn-primary flex items-center gap-2 text-base px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto justify-center">
              <Sparkles size={16} />
              Get Guidance
            </Link>
            <Link to="/stories" className="btn-secondary flex items-center gap-2 text-base px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto justify-center">
              <ScrollText size={16} />
              Explore Stories
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-6 sm:gap-10 mt-12 sm:mt-16"
          >
            {[
              { value: '700+', label: 'Shlokas' },
              { value: '8', label: 'Epic Stories' },
              { value: '∞', label: 'Insights' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-2xl sm:text-3xl text-gold-400">{stat.value}</div>
                <div className="text-xs text-white/30 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* ═══ DAILY SHLOKA ═══ */}
      <section className="py-20 relative">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
              Today's Shloka
            </div>
            <h2 className="section-title">Daily Wisdom</h2>
            <p className="section-subtitle mx-auto mt-3">One shloka a day can quietly reshape how you see the world.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <ShlokaCard shloka={dailyShloka} featured={true} />
            <div className="text-center mt-6">
              <Link to="/shloka" className="btn-ghost inline-flex items-center gap-2">
                Explore all shlokas <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/3 to-transparent pointer-events-none" />
        <div className="page-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title">What Dharma Setu Offers</h2>
            <p className="section-subtitle mx-auto mt-3">Everything you need for a grounded, wisdom-centered life.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={f.link} className="block group">
                  <div className={`glass-card border ${f.border} p-6 h-full hover:shadow-card transition-all duration-300 group-hover:border-opacity-60`}>
                    <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <f.icon size={20} className={f.color} />
                    </div>
                    <h3 className={`font-serif text-xl ${f.color} mb-3`}>{f.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
                    <div className={`flex items-center gap-1 mt-4 text-xs ${f.color} opacity-0 group-hover:opacity-70 transition-opacity`}>
                      Explore <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle mx-auto mt-3">Three steps from confusion to clarity.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-600/20 to-gold-400/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-5 shadow-gold">
                  <span className="font-serif text-gold-400 text-lg">{step.step}</span>
                </div>
                <h3 className="font-serif text-xl text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/guidance" className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={16} />
              Try AI Guidance Now
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-title">What Seekers Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card border border-white/[0.06] p-6 hover:border-gold-500/20 transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={12} className="text-gold-500 fill-gold-500" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5 font-light italic">"{t.text}"</p>
                <div>
                  <div className="text-sm text-white/70 font-medium">{t.name}</div>
                  <div className="text-xs text-white/30 mt-0.5">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ═══ FOUNDER ═══ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent pointer-events-none" />
        <div className="page-container relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
              The Vision
            </div>
            <h2 className="section-title">Meet the Founder</h2>
            <p className="section-subtitle mx-auto mt-3">Bridging ancient wisdom with modern technology.</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card border border-white/[0.06] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10 hover:border-gold-500/20 transition-all duration-300"
            >
              <div className="w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 relative group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 rounded-full border border-gold-500/30 group-hover:scale-105 transition-transform duration-500" />
                <img
                  src="/founder.jpg"
                  alt="Founder"
                  className="w-full h-full object-cover rounded-full relative z-10 border-2 border-white/10"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-serif text-3xl text-gold-400 mb-1">JANVI SAHU</h3>
                <p className="text-sm text-white/50 mb-6 uppercase tracking-wider font-medium">CEO AND FOUNDER</p>
                <p className="text-base text-white/70 leading-relaxed font-light mb-8">
                  "Dharma Setu was born from a personal realization: while we have advanced technologically, we often struggle emotionally. I built this platform to make the profound, practical wisdom of our ancient texts accessible, relatable, and applicable to the challenges of modern life."
                </p>
                
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <a href="https://www.linkedin.com/in/janvi-sahu-0968b8329?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 transition-all">
                    <LinkedinIcon size={18} />
                  </a>
                  <a href="https://github.com/janvi3ssj" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all">
                    <GithubIcon size={18} />
                  </a>
                  <a href="https://www.instagram.com/janvi_sahu93?igsh=MWRrZnI2djFoZ3BhZw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-[#E1306C] hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10 transition-all">
                    <InstagramIcon size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden glass-card-gold text-center py-12 sm:py-16 px-5 sm:px-8 rounded-3xl"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="font-serif text-4xl sm:text-5xl text-gold-400 mb-3 sm:mb-4 om-glow">ॐ</div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-4">
                Begin Your Journey
              </h2>
              <p className="text-white/50 mb-6 sm:mb-8 max-w-lg mx-auto text-base sm:text-lg font-light">
                The answers you seek have been waiting 5,000 years. Let's find them — together.
              </p>
              <Link to="/guidance" className="btn-primary inline-flex items-center gap-2 text-base px-8 sm:px-10 py-3.5 sm:py-4">
                <Sparkles size={16} />
                Start Now — It's Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
