import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldAlert, ShieldCheck, Users,
  RefreshCw, Mail, X, Send, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Compose Email Modal ────────────────────────────────────────────────────────
function ComposeModal({ user, onClose, authFetch }) {
  const [subject, setSubject]       = useState('');
  const [message, setMessage]       = useState('');
  const [sending, setSending]       = useState(false);
  const [status, setStatus]         = useState(null); // null | 'success' | 'error'
  const [statusMsg, setStatusMsg]   = useState('');
  const subjectRef = useRef(null);

  useEffect(() => {
    subjectRef.current?.focus();
  }, []);

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
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-lg bg-[#0d0a1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0d0a1a 0%,#13102a 100%)' }}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="text-xs text-indigo-400/70 font-medium uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Mail size={11} /> Direct Email
            </div>
            <h2 className="text-lg font-serif text-white leading-snug">Send Email to User</h2>
            <p className="text-sm text-white/40 mt-0.5 flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 inline-flex items-center justify-center font-bold text-xs">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
              {user.name} · <span className="text-indigo-400/70">{user.email}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Subject */}
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

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider font-medium">
              Message
              <span className="ml-2 text-white/20 font-normal normal-case">({message.length} chars)</span>
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setStatus(null); }}
              rows={6}
              placeholder={`Write your message to ${user.name}…`}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-400/50 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Status */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
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

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.07] text-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/30"
            >
              {sending
                ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                : <><Send size={14} /> Send Email</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main UserManager ───────────────────────────────────────────────────────────
export default function UserManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [composeUser, setComposeUser] = useState(null); // user to email
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
        {/* Header */}
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
            <p className="text-white/40 text-sm">View, search, and email your registered users.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-full sm:w-72 placeholder-white/25 transition-all"
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
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-xs text-white/40 uppercase tracking-wider">
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="p-4">
                      <div className="h-5 bg-white/[0.04] rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-white/30">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    <p>{searchTerm ? `No users matching "${searchTerm}"` : 'No users found.'}</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 text-white/25 text-sm">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-white font-medium text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white/60 text-sm">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                        u.role === 'admin'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-white/5 text-white/40 border border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-white/30 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* ── Send Email ── */}
                        <button
                          onClick={() => setComposeUser(u)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
                        >
                          <Mail size={13} /> Email
                        </button>
                        <button className="text-xs text-white/40 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 transition-colors">
                          <ShieldCheck size={13} /> Premium
                        </button>
                        <button className="text-xs text-red-400/60 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-400/10 flex items-center gap-1 transition-colors">
                          <ShieldAlert size={13} /> Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose modal */}
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
