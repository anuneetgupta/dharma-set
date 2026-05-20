import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/* ─── Expanding pulse ring ─── */
function Ring({ delay, size, duration }) {
  return (
    <motion.div
      className="absolute rounded-full border border-gold-500/30"
      style={{ width: size, height: size, left: '50%', top: '50%', x: '-50%', y: '-50%' }}
      initial={{ scale: 0.3, opacity: 0.8 }}
      animate={{ scale: 1.9, opacity: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
    />
  );
}

/* ─── Spinning Om Halo
 *   Renders N ॐ symbols evenly placed around a circle of `radius` px.
 *   The whole group rotates continuously while visible.
 * ─── */
function SpinningOmHalo({ radius, count, fontSize, opacity, clockwise, duration, enterDelay }) {
  const symbols = Array.from({ length: count });
  const angleStep = 360 / count;

  return (
    <motion.div
      className="absolute select-none"
      style={{ width: 0, height: 0, left: '50%', top: '50%' }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 0.45, delay: enterDelay, ease: 'easeOut' }}
    >
      {/* The spinning wrapper */}
      <motion.div
        style={{ position: 'absolute', width: 0, height: 0 }}
        animate={{ rotate: clockwise ? 360 : -360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {symbols.map((_, i) => {
          const angleDeg = i * angleStep;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <span
              key={i}
              className="absolute font-serif text-gold-400 leading-none"
              style={{
                fontSize,
                /* counter-rotate each symbol so it always faces "up" */
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${-angleDeg}deg)`,
                textShadow: '0 0 12px rgba(201,169,110,0.7), 0 0 24px rgba(201,169,110,0.35)',
                opacity: 0.75,
              }}
            >
              ॐ
            </span>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════ */
export default function OmPageTransition() {
  const location = useLocation();
  const [active, setActive]   = useState(false);
  const [phase, setPhase]     = useState('idle'); // idle | in | hold | out
  const prevPath              = useRef(location.pathname);
  const timeoutsRef           = useRef([]);
  const audioRef              = useRef(null);

  useEffect(() => {
    // Create audio object. 
    // Please ensure you place an 'om-chant.mp3' file in your 'public' folder.
    audioRef.current = new Audio('/om-chant.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const clear = () => timeoutsRef.current.forEach(clearTimeout);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    clear();
    setActive(true);
    setPhase('in');

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log('Autoplay prevented:', err));
    }

    const t1 = setTimeout(() => setPhase('hold'), 300);
    const t2 = setTimeout(() => setPhase('out'),  750);
    const t3 = setTimeout(() => { 
      setActive(false); 
      setPhase('idle'); 
      if (audioRef.current) {
        // Create a simple fade out effect
        let vol = audioRef.current.volume;
        const fadeOut = setInterval(() => {
          if (vol > 0.05) {
            vol -= 0.05;
            audioRef.current.volume = vol;
          } else {
            clearInterval(fadeOut);
            audioRef.current.pause();
            audioRef.current.volume = 0.5; // reset for next time
          }
        }, 50);
      }
    }, 1150);

    timeoutsRef.current = [t1, t2, t3];
    return clear;
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="om-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'out' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === 'out' ? 0.38 : 0.22, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(8,6,18,0.97) 0%, rgba(8,6,18,0.93) 55%, transparent 100%)',
          }}
        >
          {/* ── Expanding pulse rings ── */}
          {phase !== 'idle' && (
            <>
              <Ring delay={0}    size={100} duration={0.85} />
              <Ring delay={0.07} size={180} duration={0.85} />
              <Ring delay={0.14} size={280} duration={0.85} />
              <Ring delay={0.21} size={400} duration={0.85} />
              <Ring delay={0.28} size={540} duration={0.90} />
            </>
          )}

          {/* ── Outer gold halo glow ── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 280, height: 280,
              background: 'radial-gradient(circle, rgba(201,169,110,0.3) 0%, rgba(201,169,110,0.10) 45%, transparent 70%)',
              filter: 'blur(24px)',
              left: '50%', top: '50%', x: '-50%', y: '-50%',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: phase === 'out' ? 1.6 : 1, opacity: phase === 'out' ? 0 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* ── OUTER spinning halo — 8 OM symbols, clockwise ── */}
          <SpinningOmHalo
            radius={130}
            count={8}
            fontSize="13px"
            opacity={phase === 'out' ? 0 : 0.55}
            clockwise={true}
            duration={8}
            enterDelay={0.05}
          />

          {/* ── INNER spinning halo — 5 OM symbols, counter-clockwise ── */}
          <SpinningOmHalo
            radius={82}
            count={5}
            fontSize="16px"
            opacity={phase === 'out' ? 0 : 0.70}
            clockwise={false}
            duration={6}
            enterDelay={0.1}
          />

          {/* ── Central OM ── */}
          <motion.div
            initial={{ scale: 0.35, opacity: 0, filter: 'blur(16px)' }}
            animate={{
              scale:   phase === 'out' ? 1.4 : 1,
              opacity: phase === 'out' ? 0 : 1,
              filter:  phase === 'hold'
                ? 'blur(0px) drop-shadow(0 0 32px rgba(201,169,110,0.95))'
                : 'blur(0px)',
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 select-none"
          >
            <span
              className="font-serif text-gold-300 block leading-none"
              style={{
                fontSize: 'clamp(80px, 13vw, 108px)',
                textShadow:
                  '0 0 20px rgba(255,230,150,1), 0 0 50px rgba(201,169,110,0.9), 0 0 90px rgba(201,169,110,0.55), 0 0 140px rgba(201,169,110,0.25)',
              }}
            >
              ॐ
            </span>
          </motion.div>

          {/* ── "Dharma Setu" chant label ── */}
          <motion.p
            className="absolute font-serif text-gold-500/45 text-[10px] tracking-[0.5em] uppercase select-none"
            style={{ top: 'calc(50% + 72px)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: phase === 'hold' ? 1 : 0, y: phase === 'hold' ? 0 : 8 }}
            transition={{ duration: 0.3 }}
          >
            ॐ &nbsp; Dharma Setu &nbsp; ॐ
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
