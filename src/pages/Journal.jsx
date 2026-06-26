import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Trash2, ChevronDown, ChevronUp, Sparkles, Globe, Lock, Clock, XCircle, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
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
  const [currentTitle, setCurrentTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Share modal state
  const [shareModal, setShareModal] = useState(null); // entry id
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(null); // success message

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
  const handleShare = async () => {
    if (!shareModal) return;
    setShareLoading(true);
    try {
      const res = await authFetch(`/journal/${shareModal}/submit`, {
        method: 'PATCH',
        body: JSON.stringify({ isAnonymous }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries(prev => prev.map(e => e.id === shareModal ? { ...e, status: 'pending', isAnonymous, rejectionReason: null } : e));
        setShareSuccess('Your journal has been submitted for review.');
        setTimeout(() => setShareSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setShareLoading(false);
      setShareModal(null);
      setIsAnonymous(false);
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
          body: JSON.stringify({ title: currentTitle || null, text: currentText, reflection }),
        });
        const data = await res.json();
        if (data.success) {
          setEntries(prev => [data.data, ...prev]);
          setExpandedId(data.data.id);
        }
      } catch {
        // fallback: add locally
        const newEntry = { id: Date.now(), title: currentTitle || null, text: currentText, reflection, createdAt: new Date().toISOString() };
        setEntries(prev => [newEntry, ...prev]);
        setExpandedId(newEntry.id);
      }
    } else {
      const newEntry = { id: Date.now(), title: currentTitle || null, text: currentText, reflection, timestamp: Date.now() };
      setEntries(prev => [newEntry, ...prev]);
      setExpandedId(newEntry.id);
    }

    setCurrentText('');
    setCurrentTitle('');
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

        {/* Success banner */}
        <AnimatePresence>
          {shareSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm"
            >
              <CheckCircle size={16} />
              {shareSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Writing area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/[0.06] focus-within:border-gold-500/20 transition-all duration-300 mb-8"
        >
          <div className="p-5 pb-0 space-y-3">
            <p className="text-xs text-white/20 uppercase tracking-wider">Write your thoughts</p>
            {/* Title input */}
            <input
              value={currentTitle}
              onChange={e => setCurrentTitle(e.target.value)}
              placeholder="Title (optional)"
              maxLength={200}
              className="w-full bg-transparent text-white/80 placeholder-white/15 text-lg font-serif outline-none border-b border-white/[0.06] pb-2 focus:border-gold-500/20 transition-colors"
            />
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
                      {entry.title && (
                        <h3 className="text-base font-serif text-white/80 mb-1">{entry.title}</h3>
                      )}
                      <p className="text-sm text-white/55 leading-relaxed line-clamp-2 font-light">{entry.text}</p>
                      {/* Status badge (only for logged-in users) */}
                      {user && entry.status && (
                        <div className="mt-2 space-y-1">
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
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[10px] text-red-400/60 border border-red-400/20 rounded-full px-2 py-0.5 bg-red-400/5">
                                <XCircle size={9} /> Not Approved
                              </span>
                              {entry.rejectionReason && (
                                <p className="text-[11px] text-red-400/50 italic pl-1">
                                  Reason: {entry.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Share button — only for private/rejected, logged-in users */}
                      {user && (entry.status === 'private' || entry.status === 'rejected') && (
                        <button
                          onClick={() => { setShareModal(entry.id); setIsAnonymous(false); }}
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

                          {/* Prominent Share Banner for Private Entries */}
                          {user && (entry.status === 'private' || entry.status === 'rejected') && (
                            <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div>
                                <p className="text-sm text-white/80 font-medium flex items-center gap-2">
                                  <Lock size={14} className="text-white/40" /> Currently Private
                                </p>
                                <p className="text-xs text-white/40 mt-1 max-w-sm leading-relaxed">
                                  Only you can see this entry. If you feel this could help others, you can submit it to the public Community Journal Wall.
                                </p>
                              </div>
                              <button
                                onClick={() => { setShareModal(entry.id); setIsAnonymous(false); }}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs hover:bg-indigo-500/20 hover:text-indigo-200 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                              >
                                <Globe size={14} /> Publish Publicly
                              </button>
                            </div>
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

      {/* ── Share Confirmation Modal ── */}
      <AnimatePresence>
        {shareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShareModal(null); setIsAnonymous(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-cosmic-800 border border-white/[0.1] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl text-white">Publish Publicly</h3>
                <button
                  onClick={() => { setShareModal(null); setIsAnonymous(false); }}
                  className="p-1 rounded-lg text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-white/50 leading-relaxed mb-6">
                Your journal will be sent to our team for review. Once approved, it will appear on the Community Journal Wall for others to read and reflect upon.
              </p>

              {/* Anonymous toggle */}
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all duration-200 mb-6 ${
                  isAnonymous
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:border-white/20'
                }`}
              >
                {isAnonymous ? <EyeOff size={18} /> : <Eye size={18} />}
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">
                    {isAnonymous ? 'Publishing as Anonymous' : 'Publishing with your name'}
                  </p>
                  <p className="text-xs opacity-60 mt-0.5">
                    {isAnonymous
                      ? 'Others will see you as "A Seeker"'
                      : 'Your name will be shown on the public wall'}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShareModal(null); setIsAnonymous(false); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="flex-1 flex items-center justify-center gap-2 btn-primary py-2.5 px-4 disabled:opacity-50"
                >
                  {shareLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" />
                  ) : (
                    <Globe size={14} />
                  )}
                  {shareLoading ? 'Submitting…' : 'Submit for Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
