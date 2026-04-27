import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';
import AIResponseCard from '../components/AIResponseCard';
import { getMockAIResponse } from '../data/aiResponses';

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

export default function Guidance() {
  const [input, setInput] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isLiveAI, setIsLiveAI] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedEmotion) return;
    setLoading(true);
    setResponse(null);

    try {
      // Try real OpenAI backend
      const res = await fetch('http://localhost:5000/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, emotion: selectedEmotion }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(normalizeAPIResponse(data.data));
        setIsLiveAI(true);
      } else {
        throw new Error(data.message);
      }
    } catch {
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
          {language === 'hi' && (
            <p className="text-xs text-white/30 mt-2">Hindi translations coming soon.</p>
          )}
        </motion.div>

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
                    rows={5}
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
                      GPT-4o Live
                    </span>
                  )}
                </div>
                <button onClick={handleReset} className="btn-ghost text-sm py-2">← Ask Again</button>
              </div>
              <AIResponseCard response={response} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading spinner */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="lotus-spinner mx-auto mb-6" />
              <div className="font-serif text-2xl text-gold-400/60 animate-pulse mb-2">ॐ</div>
              <p className="text-white/30 text-sm">Consulting the ancient wisdom…</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
