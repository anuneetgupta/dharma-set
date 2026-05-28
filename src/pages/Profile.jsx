import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, BookOpen, ChevronDown, ChevronUp, Pencil, LogOut, Calendar, Mail, User as UserIcon, Sparkles, Crown, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShlokaCard from '../components/ShlokaCard';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatJoinDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function Profile() {
  const { user, authFetch, logout, updateUser } = useAuth();

  const [journals, setJournals] = useState([]);
  const [journalLoading, setJournalLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState('journals');

  if (!user) return <Navigate to="/auth" replace />;

  // Load journals from DB
  useEffect(() => {
    authFetch('/journal')
      .then(r => r.json())
      .then(data => { if (data.success) setJournals(data.data); })
      .catch(() => {})
      .finally(() => setJournalLoading(false));
  }, []);

  const handleDeleteJournal = async (id) => {
    try {
      await authFetch(`/journal/${id}`, { method: 'DELETE' });
      setJournals(prev => prev.filter(e => e.id !== id));
    } catch { /* ignore */ }
  };

  const handleResetAvatar = () => {
    // Just reset the frontend state to show the picker again
    updateUser({ avatarChosen: false });
  };

  const memberSince = user.createdAt ? formatJoinDate(user.createdAt) : null;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="page-container max-w-4xl">

        {/* ── Profile Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-cosmic-800/60 backdrop-blur-xl p-6 sm:p-8 mb-8"
        >
          {/* Background gradient rings */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-gold-500/25 shadow-card"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif font-bold text-4xl shadow-card">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              {/* Edit avatar button */}
              <button
                onClick={handleResetAvatar}
                title="Change avatar"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-cosmic-700 border border-white/[0.12] hover:border-gold-500/40 hover:bg-cosmic-600 flex items-center justify-center text-white/50 hover:text-gold-400 transition-all shadow-card"
              >
                <Pencil size={12} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs">
                  <Sparkles size={10} />
                  Dharma Seeker
                </div>
                {user.isPremium && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-gold-600/20 to-amber-500/15 border border-gold-500/40 text-gold-300 text-xs font-medium shadow-[0_0_12px_rgba(201,169,110,0.15)]">
                    <Crown size={10} />
                    Premium
                    {user.premiumChatsRemaining > 0 && (
                      <span className="ml-1 opacity-60">· {user.premiumChatsRemaining} left</span>
                    )}
                  </div>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-white mb-1">{user.name}</h1>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mt-3 text-white/40 text-sm">
                <div className="flex items-center gap-1.5">
                  <Mail size={13} />
                  <span>{user.email}</span>
                </div>
                {memberSince && (
                  <>
                    <span className="hidden sm:inline text-white/15">·</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>Joined {memberSince}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Quick stats */}
              <div className="flex items-center justify-center sm:justify-start gap-6 mt-5">
                <div className="text-center sm:text-left">
                  <p className="text-xl font-serif text-gold-400">{journals.length}</p>
                  <p className="text-xs text-white/30 uppercase tracking-wider">Journals</p>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center sm:text-left">
                  <p className="text-xl font-serif text-gold-400">0</p>
                  <p className="text-xs text-white/30 uppercase tracking-wider">Courses</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-red-500/30 hover:text-red-400 text-white/50 text-sm transition-all"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {[
            { id: 'journals', label: 'My Journals', icon: PenLine },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-[0_0_0_1px_rgba(201,169,110,0.1)]'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Journals Tab ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'journals' && (
            <motion.div
              key="journals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {journalLoading ? (
                <div className="text-center py-16">
                  <div className="lotus-spinner mx-auto mb-4" />
                  <p className="text-sm text-white/30">Loading your journal…</p>
                </div>
              ) : journals.length === 0 ? (
                <div className="text-center py-16 text-white/25">
                  <div className="text-5xl mb-4">🪔</div>
                  <p className="text-sm mb-2">No journal entries yet.</p>
                  <Link to="/journal" className="text-gold-400 text-sm hover:text-gold-300 transition-colors underline underline-offset-4">
                    Write your first entry →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {journals.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass-card border border-white/[0.06] overflow-hidden hover:border-gold-500/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4 p-5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/25 mb-2">{formatDate(entry.createdAt)}</p>
                          <p className="text-sm text-white/60 leading-relaxed line-clamp-2 font-light">{entry.text}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleDeleteJournal(entry.id)}
                            className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
                            title="Delete entry"
                          >
                            ✕
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
                            <div className="p-5 space-y-4">
                              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                                <p className="text-xs text-white/20 uppercase tracking-wider mb-2">Your Words</p>
                                <p className="text-sm text-white/55 leading-loose font-light whitespace-pre-wrap">{entry.text}</p>
                              </div>
                              {entry.reflection && (
                                <div className="glass-card-gold p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif text-[10px]">ॐ</div>
                                    <span className="text-xs text-gold-500/60 uppercase tracking-wider">Reflection</span>
                                  </div>
                                  {entry.reflection.acknowledgment && (
                                    <p className="text-sm text-white/65 leading-relaxed font-light mb-3">{entry.reflection.acknowledgment}</p>
                                  )}
                                  {entry.reflection.reflection && (
                                    <p className="text-sm text-white/55 leading-loose font-light">{entry.reflection.reflection}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Courses Tab ── */}
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">📚</div>
              <p className="text-white/30 text-sm mb-2">You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="text-gold-400 text-sm hover:text-gold-300 transition-colors underline underline-offset-4">
                Browse courses →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
