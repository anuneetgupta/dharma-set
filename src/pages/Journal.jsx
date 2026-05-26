import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Trash2, ChevronDown, ChevronUp, Sparkles, Globe, Lock, Clock, XCircle } from 'lucide-react';
import { getMockJournalReflection } from '../data/aiResponses';
import ShlokaCard from '../components/ShlokaCard';
import { useAuth } from '../context/AuthContext';

const LOCAL_STORAGE_KEY = 'dharma_journal_entries';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Journal() {
  const { user, authFetch } = useAuth();

  const [entries, setEntries] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Load entries — from DB if logged in, localStorage if guest
  useEffect(() => {
    if (user) {
      setFetchLoading(true);
      authFetch('/journal')
        .then(r => r.json())
        .then(data => {
          if (data.success) setEntries(data.data);
        })
        .catch(() => {})
        .finally(() => setFetchLoading(false));
    } else {
      try {
        setEntries(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'));
      } catch {
        setEntries([]);
      }
    }
  }, [user]);

  // Submit a journal entry for public approval
  const handleShare = async (id) => {
    try {
      const res = await authFetch(`/journal/${id}/submit`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'pending' } : e));
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // Save to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, user]);

  const handleSubmit = async () => {
    if (!currentText.trim()) return;
    setLoading(true);

    let reflection;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/guidance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentText, emotion: null }),
      });
      const data = await res.json();
      if (data.success) {
        const d = data.data;
        reflection = {
          acknowledgment: d.greeting,
          reflection: d.reflection,
          shloka: d.shloka ? { ...d.shloka, emotions: d.shloka.emotions || [], topics: [] } : null,
          question: d.practicalSteps?.[0] || null,
        };
      } else throw new Error();
    } catch {
      await new Promise(r => setTimeout(r, 1200));
      reflection = getMockJournalReflection(currentText);
    }

    if (user) {
      // Save to DB
      try {
        const res = await authFetch('/journal', {
          method: 'POST',
          body: JSON.stringify({ text: currentText, reflection }),
        });
        const data = await res.json();
        if (data.success) {
          setEntries(prev => [data.data, ...prev]);
          setExpandedId(data.data.id);
        }
      } catch {
        // fallback: add locally
        const newEntry = { id: Date.now(), text: currentText, reflection, createdAt: new Date().toISOString() };
        setEntries(prev => [newEntry, ...prev]);
        setExpandedId(newEntry.id);
      }
    } else {
      const newEntry = { id: Date.now(), text: currentText, reflection, timestamp: Date.now() };
      setEntries(prev => [newEntry, ...prev]);
      setExpandedId(newEntry.id);
    }

    setCurrentText('');
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (user) {
      try {
        await authFetch(`/journal/${id}`, { method: 'DELETE' });
      } catch { /* ignore */ }
    }
    setEntries(prev => prev.filter(e => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const getTimestamp = (entry) => entry.createdAt || entry.timestamp;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="page-container max-w-3xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-400/10 border border-saffron-400/20 text-saffron-400 text-xs mb-4">
            <PenLine size={12} />
            Personal Journal
          </div>
          <h1 className="section-title mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl">Your Sacred Space</h1>
          <p className="section-subtitle mx-auto">
            Write freely. Our AI will reflect your thoughts back through the lens of dharmic wisdom.
          </p>
          {!user && (
            <p className="mt-3 text-xs text-white/25 italic">
              💡 Sign in to save your journal across all devices
            </p>
          )}
        </motion.div>

        {/* Writing area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/[0.06] focus-within:border-gold-500/20 transition-all duration-300 mb-8"
        >
          <div className="p-5 pb-0">
            <p className="text-xs text-white/20 uppercase tracking-wider mb-3">Write your thoughts</p>
            <textarea
              value={currentText}
              onChange={e => setCurrentText(e.target.value)}
              placeholder={`What's happening in your inner world today?\n\nYou don't need to be eloquent. Just honest.`}
              rows={8}
              className="w-full bg-transparent text-white/75 placeholder-white/15 text-base resize-none outline-none leading-loose font-light"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3 border-t border-white/[0.05] gap-3 sm:gap-0">
            <span className="text-xs text-white/20">{currentText.length} characters</span>
            <button
              onClick={handleSubmit}
              disabled={!currentText.trim() || loading}
              className="flex items-center gap-2 btn-primary py-2.5 px-5 disabled:opacity-30 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" />
                  Reflecting…
                </>
              ) : (
                <><Sparkles size={14} /> Get Reflection</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {(loading || fetchLoading) && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-10 mb-8"
            >
              <div className="lotus-spinner mx-auto mb-4" />
              <p className="text-sm text-white/30">{fetchLoading ? 'Loading your journal…' : 'Reading your words with care…'}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past entries */}
        {entries.length > 0 && !fetchLoading && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-white/20 uppercase tracking-wider">Past Reflections ({entries.length})</span>
            </div>
            <div className="space-y-4">
              {entries.map(entry => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border border-white/[0.06] overflow-hidden hover:border-gold-500/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/25 mb-2">{formatDate(getTimestamp(entry))}</p>
                      <p className="text-sm text-white/55 leading-relaxed line-clamp-2 font-light">{entry.text}</p>
                      {/* Status badge (only for logged-in users) */}
                      {user && entry.status && (
                        <div className="mt-2">
                          {entry.status === 'private' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-white/25 border border-white/10 rounded-full px-2 py-0.5">
                              <Lock size={9} /> Private
                            </span>
                          )}
                          {entry.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/70 border border-amber-400/20 rounded-full px-2 py-0.5 bg-amber-400/5">
                              <Clock size={9} /> Awaiting Admin Approval
                            </span>
                          )}
                          {entry.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/70 border border-emerald-400/20 rounded-full px-2 py-0.5 bg-emerald-400/5">
                              <Globe size={9} /> Published Publicly
                            </span>
                          )}
                          {entry.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-red-400/60 border border-red-400/20 rounded-full px-2 py-0.5 bg-red-400/5">
                              <XCircle size={9} /> Not Approved
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Share button — only for private/rejected, logged-in users */}
                      {user && (entry.status === 'private' || entry.status === 'rejected') && (
                        <button
                          onClick={() => handleShare(entry.id)}
                          className="p-2 rounded-lg text-white/20 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                          title="Share with community (needs admin approval)"
                        >
                          <Globe size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                        className="p-2 rounded-lg text-white/20 hover:text-gold-400 hover:bg-gold-500/10 transition-all"
                      >
                        {expandedId === entry.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === entry.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-white/[0.05]"
                      >
                        <div className="p-5 space-y-5">
                          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                            <p className="text-xs text-white/20 uppercase tracking-wider mb-2">Your Words</p>
                            <p className="text-sm text-white/55 leading-loose font-light whitespace-pre-wrap">{entry.text}</p>
                          </div>

                          {entry.reflection && (
                            <>
                              <div className="glass-card-gold p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif text-xs">ॐ</div>
                                  <span className="text-xs text-gold-500/60 uppercase tracking-wider">Reflection</span>
                                </div>
                                <p className="text-sm text-white/65 leading-relaxed font-light mb-3">{entry.reflection.acknowledgment}</p>
                                <p className="text-sm text-white/55 leading-loose font-light">{entry.reflection.reflection}</p>
                              </div>

                              {entry.reflection.shloka && (
                                <ShlokaCard shloka={entry.reflection.shloka} compact={true} />
                              )}

                              {entry.reflection.question && (
                                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                                  <p className="text-xs text-indigo-400/60 uppercase tracking-wider mb-2">Sit with This Question</p>
                                  <p className="text-sm text-indigo-300/70 font-serif italic leading-relaxed">
                                    "{entry.reflection.question}"
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 && !loading && !fetchLoading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center py-12 text-white/20"
          >
            <div className="font-serif text-5xl mb-4">🪔</div>
            <p className="text-sm">Your journal is empty.</p>
            <p className="text-xs mt-1">Start writing — no entry is too small or too messy.</p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
