import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Trash2, ChevronDown, ChevronUp, Sparkles, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMockJournalReflection } from '../data/aiResponses';
import ShlokaCard from '../components/ShlokaCard';
import { useAuth } from '../context/AuthContext';

const LOCAL_KEY = 'dharma_journal_entries';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Journal() {
  const { user, authFetch, token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // Load entries: from API if logged in, else localStorage
  useEffect(() => {
    if (user && token) {
      fetchFromAPI();
    } else {
      try {
        setEntries(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'));
      } catch { setEntries([]); }
    }
  }, [user, token]);

  const fetchFromAPI = async () => {
    setFetching(true);
    try {
      const res = await authFetch('/journal');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data.map(e => ({
          id: e._id,
          text: e.content,
          reflection: e.ai_response,
          timestamp: new Date(e.createdAt).getTime(),
        })));
        setIsOnline(true);
      }
    } catch {
      setIsOnline(false);
      // Fallback to localStorage
      try {
        setEntries(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'));
      } catch { setEntries([]); }
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentText.trim()) return;
    setLoading(true);

    if (user && token && isOnline) {
      // Save to backend
      try {
        const res = await authFetch('/journal', {
          method: 'POST',
          body: JSON.stringify({ content: currentText }),
        });
        const data = await res.json();
        if (data.success) {
          const e = data.data;
          const newEntry = {
            id: e._id,
            text: e.content,
            reflection: e.ai_response,
            timestamp: new Date(e.createdAt).getTime(),
          };
          setEntries(prev => [newEntry, ...prev]);
          setExpandedId(newEntry.id);
          setCurrentText('');
        }
      } catch {
        fallbackLocalSave();
      }
    } else {
      // Fallback: local mock
      await new Promise(r => setTimeout(r, 1200));
      fallbackLocalSave();
    }
    setLoading(false);
  };

  const fallbackLocalSave = () => {
    const reflection = getMockJournalReflection(currentText);
    const newEntry = { id: Date.now(), text: currentText, reflection, timestamp: Date.now() };
    setEntries(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
      return updated;
    });
    setExpandedId(newEntry.id);
    setCurrentText('');
  };

  const handleDelete = async (id) => {
    if (user && token && isOnline) {
      try {
        await authFetch(`/journal/${id}`, { method: 'DELETE' });
      } catch { /* still remove from UI */ }
    } else {
      const updated = entries.filter(e => e.id !== id);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    }
    setEntries(prev => prev.filter(e => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
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
          <h1 className="section-title mb-4">Your Sacred Space</h1>
          <p className="section-subtitle mx-auto">
            Write freely. Our AI will reflect your thoughts back through the lens of dharmic wisdom.
          </p>

          {/* Auth status banner */}
          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs"
            >
              <LogIn size={12} />
              <Link to="/login" className="hover:text-indigo-300 transition-colors">Sign in</Link>
              <span className="text-white/30">to save your journal to the cloud</span>
            </motion.div>
          )}
          {user && isOnline && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-green-400/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Syncing to cloud as {user.name}
            </div>
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
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.05]">
            <span className="text-xs text-white/20">{currentText.length} characters</span>
            <button
              onClick={handleSubmit}
              disabled={!currentText.trim() || loading}
              className="flex items-center gap-2 btn-primary py-2.5 px-5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-cosmic-900/50 border-t-cosmic-900 rounded-full animate-spin" />
                  Reflecting…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Get Reflection
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 mb-8"
            >
              <div className="lotus-spinner mx-auto mb-4" />
              <p className="text-sm text-white/30">Reading your words with care…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fetching */}
        {fetching && (
          <div className="text-center py-8 text-white/20 text-sm">Loading your entries…</div>
        )}

        {/* Past entries */}
        {entries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-white/20 uppercase tracking-wider">Past Reflections</span>
              <span className="text-xs text-white/20">({entries.length})</span>
            </div>

            <div className="space-y-4">
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border border-white/[0.06] overflow-hidden hover:border-gold-500/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/25 mb-2">{formatDate(entry.timestamp)}</p>
                      <p className="text-sm text-white/55 leading-relaxed line-clamp-2 font-light">{entry.text}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
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
                                <p className="text-sm text-white/65 leading-relaxed font-light mb-3">
                                  {entry.reflection.acknowledgment}
                                </p>
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

        {entries.length === 0 && !loading && !fetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
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
