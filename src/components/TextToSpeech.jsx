import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Pause, Square, User, UserRound } from 'lucide-react';

// ── Voice helpers ──────────────────────────────────────────────────────────
const FEMALE_PATTERNS = /female|woman|zira|aria|jenny|sara|susan|samantha|karen|moira|fiona|tessa|google.*female|microsoft.*aria|microsoft.*jenny|neerja|swara/i;
const MALE_PATTERNS   = /\bmale\b|man\b|david|mark|james|daniel|george|rishi|thomas|google.*male|microsoft.*guy|microsoft.*david|prabhat|madhur/i;
const NEURAL_BONUS    = /natural|neural|online|enhanced|premium/i;
const ROBOTIC_PENALTY = /desktop|standard/i;
const INDIAN_BONUS    = /en-IN|hi-IN/i;

function categorizeVoices(voices) {
  // Allow both English and Hindi voices (Hindi voices read English/Sanskrit transliteration very well)
  const targetVoices = voices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('hi'));

  // Score voices to prioritize high-quality neural voices and Indian accents
  const getScore = (v) => {
    let score = 0;
    if (INDIAN_BONUS.test(v.lang)) score += 50; // Massive bonus for Indian accents
    if (NEURAL_BONUS.test(v.name)) score += 10;
    if (v.name.includes('Google')) score += 5; // Google voices are usually good
    if (ROBOTIC_PENALTY.test(v.name)) score -= 10;
    if (v.localService === false) score += 5; // Online voices are typically better
    return score;
  };

  const female = targetVoices
    .filter(v => FEMALE_PATTERNS.test(v.name))
    .sort((a, b) => getScore(b) - getScore(a));

  const male = targetVoices
    .filter(v => MALE_PATTERNS.test(v.name))
    .sort((a, b) => getScore(b) - getScore(a));

  // Fallback: if we couldn't categorize any, split the remaining target voices
  if (female.length === 0 && male.length === 0 && targetVoices.length > 0) {
    const sortedVoices = [...targetVoices].sort((a, b) => getScore(b) - getScore(a));
    const mid = Math.ceil(sortedVoices.length / 2);
    return { female: sortedVoices.slice(0, mid), male: sortedVoices.slice(mid) };
  }

  // If only one category found, duplicate it
  if (female.length === 0 && male.length > 0) return { female: male, male };
  if (male.length === 0 && female.length > 0) return { female, male: female };

  return { female, male };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function TextToSpeech({ text, label, compact = false }) {
  const [status, setStatus]       = useState('idle');   // idle | speaking | paused
  const [gender, setGender]       = useState('female'); // female | male
  const [showPanel, setShowPanel] = useState(false);
  const [voices, setVoices]       = useState({ female: [], male: [] });
  const [supported, setSupported] = useState(true);

  const utterRef    = useRef(null);
  const containerRef = useRef(null);

  // ── Load voices ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const all = speechSynthesis.getVoices();
      if (all.length) setVoices(categorizeVoices(all));
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      utterRef.current = null;
    };
  }, []);

  // ── Close panel on outside click ─────────────────────────────────────────
  useEffect(() => {
    if (!showPanel) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPanel]);

  // ── Speak ────────────────────────────────────────────────────────────────
  const speak = useCallback((voiceGender) => {
    if (!text?.trim()) return;
    speechSynthesis.cancel(); // stop any previous

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 0.95;
    utter.pitch = voiceGender === 'female' ? 1.05 : 0.9;

    const voiceList = voiceGender === 'female' ? voices.female : voices.male;
    if (voiceList.length > 0) utter.voice = voiceList[0];

    utter.onend    = () => { setStatus('idle'); utterRef.current = null; };
    utter.onerror  = () => { setStatus('idle'); utterRef.current = null; };

    utterRef.current = utter;
    speechSynthesis.speak(utter);
    setStatus('speaking');
    setGender(voiceGender);
    setShowPanel(false);
  }, [text, voices]);

  // ── Pause / Resume ──────────────────────────────────────────────────────
  const togglePause = useCallback(() => {
    if (status === 'speaking') {
      speechSynthesis.pause();
      setStatus('paused');
    } else if (status === 'paused') {
      speechSynthesis.resume();
      setStatus('speaking');
    }
  }, [status]);

  // ── Stop ─────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setStatus('idle');
    utterRef.current = null;
  }, []);

  if (!supported) return null;

  const isActive = status !== 'idle';

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* ── Active controls (Pause + Stop + Wave) ── */}
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5"
          >
            {/* Sound wave indicator */}
            <div className="flex items-end gap-[2px] h-4 mr-1" aria-hidden>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`tts-wave-bar w-[3px] rounded-full ${
                    status === 'speaking'
                      ? 'bg-gold-400 animate-tts-wave'
                      : 'bg-white/20 h-1'
                  }`}
                  style={{
                    animationDelay: status === 'speaking' ? `${i * 0.12}s` : undefined,
                    height: status === 'paused' ? '4px' : undefined,
                  }}
                />
              ))}
            </div>

            {/* Pause / Resume */}
            <button
              onClick={togglePause}
              className="p-1.5 rounded-lg text-gold-400 hover:bg-gold-500/10 transition-all duration-200"
              title={status === 'paused' ? 'Resume' : 'Pause'}
            >
              {status === 'paused' ? (
                <Volume2 size={compact ? 13 : 15} />
              ) : (
                <Pause size={compact ? 13 : 15} />
              )}
            </button>

            {/* Stop */}
            <button
              onClick={stop}
              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              title="Stop"
            >
              <Square size={compact ? 11 : 13} />
            </button>

            {/* Gender indicator */}
            <span className="text-[10px] text-white/25 uppercase tracking-wider ml-0.5">
              {gender === 'female' ? '♀' : '♂'}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Listen button */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className={`group flex items-center gap-1.5 rounded-full border transition-all duration-200 ${
                compact
                  ? 'px-2 py-1 text-[10px]'
                  : 'px-3 py-1.5 text-xs'
              } border-gold-500/20 text-gold-400/60 hover:border-gold-500/40 hover:text-gold-400 hover:bg-gold-500/5`}
              title={label || 'Listen to this text'}
            >
              <Volume2 size={compact ? 11 : 13} className="group-hover:scale-110 transition-transform" />
              {!compact && <span>{label || 'Listen'}</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Voice gender picker panel ── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 bg-[#1a1528]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl p-2.5 shadow-2xl min-w-[160px]"
          >
            <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium px-2 mb-2">
              Choose Voice
            </p>

            {/* Female */}
            <button
              onClick={() => speak('female')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <UserRound size={13} className="text-pink-400" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-medium">Female</span>
                <span className="block text-[10px] text-white/25">Soft & natural</span>
              </div>
            </button>

            {/* Male */}
            <button
              onClick={() => speak('male')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-gold-400 hover:bg-gold-500/10 transition-all duration-200 mt-1"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <User size={13} className="text-blue-400" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-medium">Male</span>
                <span className="block text-[10px] text-white/25">Deep & calm</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
