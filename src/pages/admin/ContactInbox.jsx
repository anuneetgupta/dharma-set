import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MailOpen, MessageCircle, Send, RefreshCw, Search, CheckCircle, Filter, X, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  unread:  { label: 'Unread',  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  dot: 'bg-amber-400'  },
  read:    { label: 'Read',    color: 'text-white/40',   bg: 'bg-white/[0.04]',  border: 'border-white/10',      dot: 'bg-white/20'   },
  replied: { label: 'Replied', color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',dot: 'bg-emerald-400'},
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ContactInbox() {
  const { authFetch } = useAuth();
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [replyText, setReplyText]     = useState('');
  const [replying, setReplying]       = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [filter, setFilter]           = useState('all'); // all | unread | read | replied
  const [search, setSearch]           = useState('');
  const [error, setError]             = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = filter !== 'all' ? `/admin/contacts?status=${filter}` : '/admin/contacts';
      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) setMessages(data.data);
      else setError('Failed to load messages.');
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, filter]);

  useEffect(() => { load(); }, [load]);

  const openMessage = async (msg) => {
    setSelected(msg);
    setReplyText('');
    setReplySuccess(false);
    // Mark as read if unread
    if (msg.status === 'unread') {
      try {
        await authFetch(`/admin/contacts/${msg.id}/read`, { method: 'PATCH' });
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
        setSelected(prev => prev ? { ...prev, status: 'read' } : prev);
      } catch { /* silent */ }
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setReplying(true);
    setReplySuccess(false);
    try {
      const res = await authFetch(`/admin/contacts/${selected.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplySuccess(true);
        setReplyText('');
        const updated = data.data;
        setMessages(prev => prev.map(m => m.id === selected.id ? updated : m));
        setSelected(updated);
      }
    } catch { /* silent */ }
    finally { setReplying(false); }
  };

  // Filtered + searched list
  const visible = messages.filter(m => {
    const q = search.toLowerCase();
    return !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gold-400 flex items-center gap-3">
            <Mail size={22} /> Contact Inbox
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-sans">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-white/30 text-sm mt-1">Messages from users via the contact form</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Status filter tabs */}
        <div className="flex gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-1">
          {['all', 'unread', 'read', 'replied'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white/70 placeholder-white/20 outline-none focus:border-gold-500/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="flex gap-4 min-h-0 flex-1" style={{ minHeight: 500 }}>

        {/* LEFT — message list */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-400/70 text-sm text-center py-8">{error}</div>
          ) : visible.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <Mail size={32} className="mx-auto mb-3 opacity-30" />
              <p>No messages found</p>
            </div>
          ) : (
            <AnimatePresence>
              {visible.map(msg => {
                const cfg = STATUS_CONFIG[msg.status] || STATUS_CONFIG.read;
                const isActive = selected?.id === msg.id;
                return (
                  <motion.button
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                      isActive
                        ? 'bg-gold-500/10 border-gold-500/30'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className="text-sm font-medium text-white/80 truncate">{msg.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 truncate mb-1">{msg.subject || 'General Inquiry'}</p>
                    <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">{msg.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-white/20 text-xs">
                      <Clock size={10} /> {timeAgo(msg.createdAt)}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* RIGHT — message detail + reply */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center text-white/20 py-20"
              >
                <MessageCircle size={40} className="mb-4 opacity-30" />
                <p>Select a message to read and reply</p>
              </motion.div>
            ) : (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5 h-full overflow-y-auto"
              >
                {/* Message header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status]?.bg} ${STATUS_CONFIG[selected.status]?.border} ${STATUS_CONFIG[selected.status]?.color}`}>
                        {STATUS_CONFIG[selected.status]?.label}
                      </span>
                      <span className="text-xs text-white/25 flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(selected.createdAt)}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl text-white/90">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-sm text-gold-400/70 hover:text-gold-400 transition-colors">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xs text-white/30">Subject</span>
                    <p className="text-sm text-white/60 font-medium">{selected.subject || 'General Inquiry'}</p>
                  </div>
                </div>

                {/* Message body */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
                  <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                    <MailOpen size={12} /> User's Message
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Previous reply (if any) */}
                {selected.adminReply && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                    <p className="text-xs text-emerald-400/60 uppercase tracking-wider font-medium mb-3 flex items-center gap-2">
                      <CheckCircle size={12} /> Your Reply · {selected.repliedAt ? new Date(selected.repliedAt).toLocaleString() : ''}
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{selected.adminReply}</p>
                  </div>
                )}

                {/* Reply box */}
                <div className="mt-auto">
                  <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-2">
                    {selected.adminReply ? 'Update Reply' : 'Write a Reply'}
                  </p>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={4}
                    placeholder={`Reply to ${selected.name}…`}
                    className="w-full bg-white/[0.04] border border-white/[0.10] focus:border-gold-500/40 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 outline-none transition-all resize-none mb-3"
                  />

                  <AnimatePresence>
                    {replySuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-emerald-400 text-sm mb-3"
                      >
                        <CheckCircle size={14} /> Reply saved successfully! 🙏
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={sendReply}
                    disabled={replying || !replyText.trim()}
                    className="flex items-center gap-2 btn-primary py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {replying ? (
                      <><div className="w-3.5 h-3.5 border-2 border-cosmic-900/40 border-t-cosmic-900 rounded-full animate-spin" /> Saving…</>
                    ) : (
                      <><Send size={14} /> {selected.adminReply ? 'Update Reply' : 'Send Reply'}</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
