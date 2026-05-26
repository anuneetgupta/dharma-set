import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, BookOpen, User } from 'lucide-react';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function JournalModeration() {
  const { authFetch } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    authFetch('/api/admin/journals')
      .then(r => r.json())
      .then(data => { if (data.success) setEntries(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authFetch]);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await authFetch(`/api/admin/journals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-white mb-1">Journal Moderation</h1>
        <p className="text-white/40 text-sm">
          Review journals submitted by users for public approval.
        </p>
      </div>

      {loading ? (
        <div className="text-white/40 text-sm py-8 text-center">Loading submissions…</div>
      ) : entries.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
          <BookOpen size={36} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40">No pending journal submissions.</p>
          <p className="text-white/20 text-xs mt-1">All caught up! 🙏</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4"
            >
              {/* Author + Date */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <User size={14} className="text-indigo-400" />
                  <span className="text-white font-medium">{entry.user?.name || 'Unknown'}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/30">{entry.user?.email}</span>
                </div>
                <span className="text-xs text-white/25">{formatDate(entry.createdAt)}</span>
              </div>

              {/* Journal text */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <p className="text-sm text-white/65 leading-loose font-light whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>

              {/* AI reflection preview */}
              {entry.reflection?.reflection && (
                <div className="bg-gold-500/5 border border-gold-500/15 rounded-xl p-4">
                  <p className="text-xs text-gold-500/50 uppercase tracking-wider mb-1">AI Reflection</p>
                  <p className="text-sm text-white/50 leading-relaxed font-light line-clamp-3">
                    {entry.reflection.reflection}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 justify-end border-t border-white/[0.06] pt-4">
                <button
                  onClick={() => handleAction(entry.id, 'reject')}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                >
                  <XCircle size={15} />
                  {actionLoading === entry.id + 'reject' ? 'Rejecting…' : 'Reject'}
                </button>
                <button
                  onClick={() => handleAction(entry.id, 'approve')}
                  disabled={actionLoading !== null}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-colors disabled:opacity-40"
                >
                  <CheckCircle size={15} />
                  {actionLoading === entry.id + 'approve' ? 'Approving…' : 'Approve & Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
