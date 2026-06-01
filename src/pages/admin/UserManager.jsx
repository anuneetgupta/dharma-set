import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldAlert, ShieldCheck, Users,
  RefreshCw, Mail, X, Send, Loader2, CheckCircle, AlertCircle,
  Calendar, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Compose Email Modal ────────────────────────────────────────────────────────
function ComposeModal({ user, onClose, authFetch }) {
  const [subject, setSubject]     = useState('');
  const [message, setMessage]     = useState('');
  const [sending, setSending]     = useState(false);
  const [status, setStatus]       = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const subjectRef = useRef(null);

  useEffect(() => { subjectRef.current?.focus(); }, []);

  const handleSend = async () => {
    if (!subject.trim()) { setStatus('error'); setStatusMsg('Please enter a subject.'); return; }
    if (!message.trim()) { setStatus('error'); setStatusMsg('Please enter a message.'); return; }
    setSending(true);
    setStatus(null);
    try {
      const res  = await authFetch(`/admin/users/${user.id}/email`, {
        method: 'POST',
        body: JSON.stringify({ subject: subject.trim(), messageText: message.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setStatusMsg(`Email sent to ${user.email}! ✅`);
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
        setStatusMsg(data.message || 'Failed to send email.');
      }
    } catch {
      setStatus('error');
      setStatusMsg('Could not reach server. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0d0a1a 0%,#13102a 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="text-xs text-indigo-400/70 font-medium uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Mail size={11} /> Direct Email
            </div>
            <h2 className="text-lg font-serif text-white">Send Email to User</h2>
            <p className="text-sm text-white/40 mt-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 inline-flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
              <span className="truncate"><strong className="text-white/70">{user.name}</strong> · {user.email}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all flex-shrink-0 ml-4">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Subject</label>
            <input
              ref={subjectRef}
              type="text"
              value={subject}
              onChange={e => { setSubject(e.target.value); setStatus(null); }}
              placeholder="e.g. Important Update from Dharma Setu"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-400/50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium flex justify-between">
              Message <span className="text-white/20 font-normal normal-case">{message.length} chars</span>
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setStatus(null); }}
              rows={6}
              placeholder={`Write your message to ${user.name}…`}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-400/50 transition-all resize-none leading-relaxed"
            />
          </div>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 ${
                  status === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {statusMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.07] text-sm transition-all">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/30"
            >
              {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Email</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── User Card Row ──────────────────────────────────────────────────────────────
function UserCard({ u, idx, onEmail }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-4 hover:border-white/10 hover:bg-white/[0.035] transition-all duration-200"
    >
      {/* Top row: avatar + name + email + role badge */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 text-indigo-300 flex items-center justify-center font-bold text-base flex-shrink-0 border border-indigo-500/20">
          {u.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{u.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium flex-shrink-0 ${
              u.role === 'admin'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                : 'bg-white/5 text-white/35 border border-white/10'
            }`}>
              {u.role}
            </span>
          </div>
          <div className="text-xs text-white/45 truncate mt-0.5">{u.email}</div>
        </div>

        {/* Joined date */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/25 flex-shrink-0">
          <Calendar size={11} />
          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Bottom row: action buttons — always fully visible */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/[0.05]">
        {/* Email */}
        <button
          onClick={() => onEmail(u)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/40 transition-all font-medium"
        >
          <Mail size={12} /> Send Email
        </button>

        {/* Grant Premium */}
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all font-medium">
          <ShieldCheck size={12} /> Grant Premium
        </button>

        {/* Ban */}
        <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-400/60 hover:text-red-400 hover:bg-red-500/15 hover:border-red-500/30 transition-all font-medium">
          <ShieldAlert size={12} /> Ban User
        </button>

        {/* Joined (mobile) */}
        <span className="sm:hidden ml-auto flex items-center gap-1 text-xs text-white/20">
          <Calendar size={10} />
          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main UserManager ───────────────────────────────────────────────────────────
export default function UserManager() {
  const [searchTerm, setSearchTerm]   = useState('');
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [composeUser, setComposeUser] = useState(null);
  const { authFetch } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await authFetch('/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else setError(data.message || 'Failed to load users.');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [authFetch]);

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-white mb-1 flex items-center gap-3">
              <Users size={26} className="text-indigo-400" />
              User Management
              {!loading && users.length > 0 && (
                <span className="text-sm font-sans font-normal text-white/30 bg-white/[0.05] border border-white/10 rounded-full px-3 py-0.5">
                  {users.length} registered
                </span>
              )}
            </h1>
            <p className="text-white/40 text-sm">View, search, and manage all registered users.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-full sm:w-64 placeholder-white/25 transition-all"
              />
            </div>
            <button
              onClick={fetchUsers}
              title="Refresh"
              className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ── User Cards ── */}
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse" />
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/25">
              <Users size={40} className="mb-4 opacity-30" />
              <p className="text-sm">{searchTerm ? `No users matching "${searchTerm}"` : 'No users registered yet.'}</p>
            </div>
          ) : (
            filteredUsers.map((u, idx) => (
              <UserCard
                key={u.id}
                u={u}
                idx={idx}
                onEmail={setComposeUser}
              />
            ))
          )}
        </div>

      </div>

      {/* ── Compose modal ── */}
      <AnimatePresence>
        {composeUser && (
          <ComposeModal
            user={composeUser}
            onClose={() => setComposeUser(null)}
            authFetch={authFetch}
          />
        )}
      </AnimatePresence>
    </>
  );
}
