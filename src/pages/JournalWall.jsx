import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, User } from 'lucide-react';
import ShlokaCard from '../components/ShlokaCard';

const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function JournalWall() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/journal/public`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
    })
      .then(r => r.json())
      .then(data => { if (data.success) setEntries(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-cosmic-gradient pointer-events-none" />
      <div className="ambient-orb w-[40vw] h-[40vw] bg-indigo-600/5 top-[-10%] left-[-10%]" />
      <div className="ambient-orb w-[50vw] h-[50vw] bg-gold-600/4 bottom-[-20%] right-[-10%]" style={{ animationDelay: '-5s' }} />

      <div className="page-container max-w-3xl relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs mb-4">
            <BookOpen size={12} />
            Community Journal Wall
          </div>
          <h1 className="section-title mb-4">Shared Reflections</h1>
          <p className="section-subtitle mx-auto">
            These are real journal entries from fellow seekers — shared with the community
            after personal consent and admin review.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-white/30">
            <div className="lotus-spinner mx-auto mb-4" />
            <p className="text-sm">Loading reflections…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 text-white/25"
          >
            <div className="font-serif text-5xl mb-4">🪷</div>
            <p className="text-sm">No shared journals yet.</p>
            <p className="text-xs mt-1">Be the first — write in your journal and share it with the community!</p>
          </motion.div>
        )}

        {/* Journal cards */}
        {!loading && entries.length > 0 && (
          <div className="space-y-6">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card border border-white/[0.06] hover:border-indigo-500/20 transition-all duration-300 overflow-hidden"
              >
                {/* Card top accent */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

                <div className="p-6 space-y-4">
                  {/* Author + date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <User size={14} className="text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-white/70">
                        {entry.user?.name || 'A Seeker'}
                      </span>
                    </div>
                    <span className="text-xs text-white/25">{formatDate(entry.createdAt)}</span>
                  </div>

                  {/* Title */}
                  {entry.title && (
                    <h3 className="font-serif text-lg text-white/80">{entry.title}</h3>
                  )}

                  {/* Journal text */}
                  <p className="text-sm text-white/60 leading-loose font-light whitespace-pre-wrap line-clamp-4">
                    {entry.text}
                  </p>

                  {/* Expand / collapse */}
                  {entry.reflection && (
                    <button
                      onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      className="flex items-center gap-1.5 text-xs text-gold-400/60 hover:text-gold-400 transition-colors"
                    >
                      <Sparkles size={12} />
                      {expandedId === entry.id ? 'Hide Reflection' : 'View Dharmic Reflection'}
                    </button>
                  )}

                  {/* Expanded reflection */}
                  {expandedId === entry.id && entry.reflection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 border-t border-white/[0.05] pt-4"
                    >
                      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                        <p className="text-xs text-white/20 uppercase tracking-wider mb-2">Their Full Words</p>
                        <p className="text-sm text-white/55 leading-loose font-light whitespace-pre-wrap">
                          {entry.text}
                        </p>
                      </div>

                      <div className="glass-card-gold p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif text-xs">ॐ</div>
                          <span className="text-xs text-gold-500/60 uppercase tracking-wider">Reflection</span>
                        </div>
                        {entry.reflection.acknowledgment && (
                          <p className="text-sm text-white/65 leading-relaxed font-light mb-3">
                            {entry.reflection.acknowledgment}
                          </p>
                        )}
                        <p className="text-sm text-white/55 leading-loose font-light">
                          {entry.reflection.reflection}
                        </p>
                      </div>

                      {entry.reflection.shloka && (
                        <ShlokaCard shloka={entry.reflection.shloka} compact={true} />
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
