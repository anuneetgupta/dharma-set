import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Lock, LogIn, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIResponseCard from '../components/AIResponseCard';
import { getMockAIResponse } from '../data/aiResponses';
import PremiumModal from '../components/PremiumModal';
import { useAuth } from '../context/AuthContext';

const wisdomQuotes = [
  '"Do your duty without attachment to results." — Gita 2.47',
  '"The soul is eternal, beyond birth and death." — Gita 2.20',
  '"Even a little dharma saves from great fear." — Gita 2.40',
  '"You are what you believe in." — Gita 17.3',
  '"Let right deeds be thy motive, not the fruit." — Gita 2.47',
];

function WisdomLoader() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % wisdomQuotes.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="text-center py-20">
      <div className="lotus-spinner mx-auto mb-6" />
      <div className="font-serif text-2xl text-gold-400/60 om-glow mb-6">ॐ</div>
      <motion.p
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        className="text-white/40 text-sm italic font-light max-w-xs mx-auto leading-relaxed px-4"
      >
        {wisdomQuotes[idx]}
      </motion.p>
      <p className="text-white/20 text-xs mt-4">Consulting ancient wisdom…</p>
    </div>
  );
}

const emotionPills = [
  { id: 'anxiety', label: '😰 Anxious' },
  { id: 'lost', label: '🌊 Lost' },
  { id: 'confused', label: '🌀 Confused' },
  { id: 'angry', label: '🔥 Angry' },
  { id: 'sad', label: '💧 Sad' },
  { id: 'afraid', label: '😨 Afraid' },
  { id: 'hopeless', label: '🌑 Hopeless' },
  { id: 'lonely', label: '🌙 Lonely' },
  { id: 'overwhelmed', label: '⚡ Overwhelmed' },
  { id: 'purpose', label: '🔍 Seeking Purpose' },
  { id: 'failure', label: '💔 Feeling Like a Failure' },
  { id: 'betrayal', label: '🗡️ Betrayed' },
];

// Normalize OpenAI API response shape → AIResponseCard shape
function normalizeAPIResponse(data) {
  return {
    greeting: data.greeting,
    detectedEmotion: data.detectedEmotion,
    reflection: data.reflection,
    shloka: {
      ...data.shloka,
      emotions: data.shloka?.emotions || [],
      topics: data.shloka?.topics || [],
    },
    secondaryShloka: null,
    relatedStory: data.relatedStory || null,
    practicalSteps: data.practicalSteps || [],
  };
}

// ── Login Gate ─────────────────────────────────────────────────────────────
function LoginGate() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16"
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold-600/20 to-gold-400/10 border border-gold-500/20 flex items-center justify-center">
          <Lock size={36} className="text-gold-400/70" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-400 flex items-center justify-center">
          <Sparkles size={14} className="text-cosmic-900" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs mb-4">
        <Sparkles size={11} /> Login Required
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl text-white mb-3">
        Your Wisdom Awaits
      </h2>
      <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed mb-8">
        Create a free account to receive personalized spiritual guidance from the Bhagavad Gita, Ramayana, and Mahabharata.
      </p>

      {/* Free plan highlights */}
      <div className="glass-card border border-white/[0.06] p-5 mb-8 max-w-sm w-full text-left">
        <p className="text-xs text-white/30 uppercase tracking-wider mb-3">What you get for free</p>
        <ul className="space-y-2">
          {[
            '5 AI Guidance sessions per day',
            'Personalized spiritual advice',
            'Shlokas matched to your emotion',
            'Ancient stories for modern life',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-white/55">
              <span className="text-gold-400 text-xs">✦</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          to="/auth"
          className="flex-1 flex items-center justify-center gap-2 btn-primary py-3"
        >
          <LogIn size={15} /> Login / Register
        </Link>
      </div>
    </motion.div>
  );
}

// ── Quota Badge ─────────────────────────────────────────────────────────────
function QuotaBadge({ quota }) {
  if (!quota) return null;

  if (quota.isPremium && quota.premiumChatsRemaining > 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-400 text-xs">
        <Crown size={11} />
        {quota.premiumChatsRemaining} premium sessions left
      </div>
    );
  }

  const remaining = quota.freeChatsRemaining ?? 0;
  const color = remaining <= 1
    ? 'bg-red-500/10 border-red-500/25 text-red-400'
    : remaining <= 2
      ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
      : 'bg-white/[0.05] border-white/10 text-white/40';

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs ${color}`}>
      <Zap size={11} />
      {remaining} free {remaining === 1 ? 'session' : 'sessions'} left today
    </div>
  );
}

export default function Guidance() {
  const { user, token, authFetch } = useAuth();

  const [input, setInput] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [quota, setQuota] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Fetch quota when user is logged in
  useEffect(() => {
    if (!user || !token) return;
    authFetch('/guidance-plan/status')
      .then(r => r.json())
      .then(data => { if (data.success) setQuota(data.data); })
      .catch(() => {});
  }, [user, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedEmotion) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await authFetch('/guidance', {
        method: 'POST',
        body: JSON.stringify({ query: input, emotion: selectedEmotion, language }),
      });
      const data = await res.json();

      if (res.status === 402 && data.type === 'LIMIT_REACHED') {
        // Quota exhausted — show premium modal
        setShowPremiumModal(true);
        return;
      }

      if (data.success) {
        setResponse(normalizeAPIResponse(data.data));
        setIsLiveAI(true);
        // Update quota from response
        if (data.quota) setQuota(data.quota);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      if (err?.message === 'LIMIT_REACHED') return; // already handled
      // Graceful fallback to mock AI when server is offline
      await new Promise(r => setTimeout(r, 1400));
      setResponse(getMockAIResponse(input || selectedEmotion, selectedEmotion));
      setIsLiveAI(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResponse(null);
    setInput('');
    setSelectedEmotion(null);
    setIsLiveAI(false);
  };

  // Called after successful premium purchase — update quota instantly
  const handlePremiumSuccess = (purchaseData) => {
    // Immediately reflect premium status in the UI
    setQuota(prev => ({
      ...prev,
      isPremium: true,
      premiumChatsRemaining: purchaseData.premiumChatsRemaining,
      freeChatsRemaining: 0,
    }));
    setShowPremiumModal(false);

    // Also re-fetch fresh quota from server to sync any server-side data
    authFetch('/guidance-plan/status')
      .then(r => r.json())
      .then(data => { if (data.success) setQuota(data.data); })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="page-container max-w-4xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
            <Sparkles size={12} />
            AI-Powered Guidance
          </div>
          <h1 className="section-title mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl">What's on your mind?</h1>
          <p className="section-subtitle mx-auto text-sm sm:text-base">
            Share your feeling freely. Our AI will find the wisdom that speaks directly to you — from Gita, Ramayana, and Mahabharata.
          </p>

          {/* Language toggle */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {['en', 'hi'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  language === lang
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {lang === 'en' ? 'English' : 'हिंदी'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Not logged in → show login gate ── */}
        {!user ? (
          <LoginGate />
        ) : (
          <>
            {/* Quota badge + status row */}
            <div className="flex items-center justify-between mb-5">
              <QuotaBadge quota={quota} />
              {quota && !quota.isPremium && (quota.freeChatsRemaining ?? 5) < 3 && (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-gold-500/10 border border-gold-500/25 text-gold-400 hover:bg-gold-500/15 transition-all"
                >
                  <Crown size={11} /> Upgrade
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!response ? (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {/* Emotion pills */}
                  <div className="glass-card border border-white/[0.06] p-6 mb-5">
                    <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-4">Quick Select</p>
                    <div className="flex flex-wrap gap-2">
                      {emotionPills.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEmotion(selectedEmotion === e.id ? null : e.id)}
                          className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                            selectedEmotion === e.id
                              ? 'bg-gold-500/20 border-gold-500/50 text-gold-400 shadow-gold'
                              : 'border-white/10 text-white/40 hover:border-gold-500/30 hover:text-white/60'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text input */}
                  <form onSubmit={handleSubmit}>
                    <div className="glass-card border border-white/[0.06] focus-within:border-gold-500/30 transition-all duration-300 p-2 mb-4">
                      <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={`"I feel lost in life..." or "My family doesn't understand me..." or "I'm afraid of failing again..."`}
                        rows={3}
                        className="w-full bg-transparent text-white/80 placeholder-white/20 text-base resize-none outline-none p-4 leading-relaxed font-light"
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e); }}
                      />
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 pb-3 gap-3 sm:gap-0">
                        <span className="text-xs text-white/20">Ctrl + Enter to submit</span>
                        <button
                          type="submit"
                          disabled={!input.trim() && !selectedEmotion}
                          className="flex items-center gap-2 btn-primary py-2.5 px-5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto justify-center"
                        >
                          <Send size={14} />
                          Seek Wisdom
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Sample prompts */}
                  <div>
                    <p className="text-xs text-white/20 mb-3 uppercase tracking-wider">Try these</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "I feel lost in life",
                        "I'm scared of my future",
                        "Someone betrayed my trust",
                        "I don't know my purpose",
                        "I keep failing at everything",
                        "I'm exhausted and overwhelmed",
                      ].map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => setInput(prompt)}
                          className="px-3 py-1.5 rounded-lg text-xs border border-white/[0.08] text-white/30 hover:text-white/50 hover:border-white/20 transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : !loading && (
                <motion.div key="response" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white/30">Your guidance is ready 🙏</p>
                      {isLiveAI && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                          Live AI
                        </span>
                      )}
                    </div>
                    <button onClick={handleReset} className="btn-ghost text-sm py-2">← Ask Again</button>
                  </div>
                  <AIResponseCard response={response} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading — animated wisdom quotes */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <WisdomLoader />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSuccess={handlePremiumSuccess}
      />
    </div>
  );
}
