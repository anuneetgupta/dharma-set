import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, BookOpen, User, EyeOff } from 'lucide-react';

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
  const [rejectingId, setRejectingId] = useState(null); // which entry is showing rejection form
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    authFetch('/api/admin/journals')
      .then(r => r.json())
      .then(data => { if (data.success) setEntries(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authFetch]);

  const handleApprove = async (id) => {
    setActionLoading(id + 'approve');
    try {
      const res = await authFetch(`/api/admin/journals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'approve' }),
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

  const handleReject = async (id) => {
    setActionLoading(id + 'reject');
    try {
      const res = await authFetch(`/api/admin/journals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'reject', rejectionReason: rejectionReason.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
      setRejectingId(null);
      setRejectionReason('');
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
                  {entry.isAnonymous && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400/70 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5 ml-1">
                      <EyeOff size={9} /> Wants Anonymous
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/25">{formatDate(entry.createdAt)}</span>
              </div>

              {/* Title */}
              {entry.title && (
                <h3 className="font-serif text-lg text-white/80">{entry.title}</h3>
              )}

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

              {/* Rejection reason input */}
              {rejectingId === entry.id && (
                <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-red-400/60 uppercase tracking-wider">Rejection Reason (optional)</p>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Let the user know why their journal wasn't approved…"
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-sm text-white/70 placeholder-white/20 resize-none outline-none focus:border-red-500/30 transition-colors"
                  />
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                      className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(entry.id)}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                    >
                      <XCircle size={15} />
                      {actionLoading === entry.id + 'reject' ? 'Rejecting…' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {rejectingId !== entry.id && (
                <div className="flex items-center gap-3 justify-end border-t border-white/[0.06] pt-4">
                  <button
                    onClick={() => { setRejectingId(entry.id); setRejectionReason(''); }}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(entry.id)}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-colors disabled:opacity-40"
                  >
                    <CheckCircle size={15} />
                    {actionLoading === entry.id + 'approve' ? 'Approving…' : 'Approve & Publish'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
