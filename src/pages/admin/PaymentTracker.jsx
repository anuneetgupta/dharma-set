import { useState, useEffect } from 'react';
import {
  CreditCard, Download, CheckCircle, XCircle, Clock,
  Search, Filter, RefreshCw, User, Mail, Phone,
  Smartphone, AlertCircle, ChevronDown, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Clock },
  completed: { label: 'Confirmed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
  failed:    { label: 'Rejected',  color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function PaymentRow({ payment, onConfirm, onReject, actionLoading }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = payment.status === 'pending';

  return (
    <>
      <tr className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
        {/* Buyer */}
        <td className="px-4 py-3.5">
          <div className="font-medium text-white text-sm">{payment.buyerName}</div>
          <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5">
            <Mail size={10} /> {payment.buyerEmail}
          </div>
          <div className="flex items-center gap-1 text-xs text-white/30 mt-0.5">
            <Phone size={10} /> {payment.buyerPhone}
          </div>
        </td>
        {/* Course */}
        <td className="px-4 py-3.5">
          <div className="text-sm text-white/80 max-w-[160px] leading-snug">{payment.courseTitle}</div>
        </td>
        {/* Amount */}
        <td className="px-4 py-3.5">
          <div className="font-serif text-amber-400 font-semibold text-base">
            ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
          </div>
        </td>
        {/* Method */}
        <td className="px-4 py-3.5">
          <span className="flex items-center gap-1.5 text-xs text-white/50">
            {payment.paymentMethod === 'card' ? <CreditCard size={12} /> : <Smartphone size={12} />}
            {payment.paymentMethod === 'card' ? 'Card' : 'UPI'}
            {payment.paymentDetails?.cardLast4 && (
              <span className="text-white/30">·{payment.paymentDetails.cardLast4}</span>
            )}
            {payment.paymentDetails?.upiId && (
              <span className="text-white/30 max-w-[80px] truncate">{payment.paymentDetails.upiId}</span>
            )}
          </span>
        </td>
        {/* Status */}
        <td className="px-4 py-3.5">
          <StatusBadge status={payment.status} />
        </td>
        {/* Date */}
        <td className="px-4 py-3.5 text-xs text-white/35">
          {new Date(payment.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
          <div>{new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        {/* Actions */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            {isPending && (
              <>
                <button
                  onClick={() => onConfirm(payment.id)}
                  disabled={actionLoading === payment.id}
                  title="Confirm Payment"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 disabled:opacity-40 transition-all"
                >
                  <CheckCircle size={13} /> Confirm
                </button>
                <button
                  onClick={() => onReject(payment.id)}
                  disabled={actionLoading === payment.id}
                  title="Reject Payment"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 disabled:opacity-40 transition-all"
                >
                  <XCircle size={13} /> Reject
                </button>
              </>
            )}
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-white/[0.01]">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-white/30 uppercase tracking-wider mb-1">Transaction ID</p>
                <p className="font-mono text-amber-400/80">{payment.transactionId || '—'}</p>
              </div>
              <div>
                <p className="text-white/30 uppercase tracking-wider mb-1">Payment ID</p>
                <p className="font-mono text-white/50 truncate">{payment.id}</p>
              </div>
              {payment.adminNote && (
                <div className="col-span-2">
                  <p className="text-white/30 uppercase tracking-wider mb-1">Admin Note</p>
                  <p className="text-white/60">{payment.adminNote}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function PaymentTracker() {
  const { authFetch } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await authFetch(`/admin/payments${query}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPayments(data.data);
    } catch (err) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [statusFilter]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfirm = async (id) => {
    setActionLoading(id);
    try {
      const res = await authFetch(`/admin/payments/${id}/confirm`, { method: 'PATCH' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('✅ Payment confirmed! Course unlocked for user.');
      fetchPayments();
    } catch (err) {
      showToast(err.message || 'Failed to confirm payment', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;
    setActionLoading(id);
    try {
      const res = await authFetch(`/admin/payments/${id}/reject`, { method: 'PATCH' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast('Payment rejected.', 'warning');
      fetchPayments();
    } catch (err) {
      showToast(err.message || 'Failed to reject payment', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.buyerName?.toLowerCase().includes(q) ||
      p.buyerEmail?.toLowerCase().includes(q) ||
      p.buyerPhone?.includes(q) ||
      p.courseTitle?.toLowerCase().includes(q) ||
      p.transactionId?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    confirmed: payments.filter(p => p.status === 'completed').length,
    revenue: payments
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => acc + parseFloat(p.amount || 0), 0),
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl border backdrop-blur-md transition-all ${
          toast.type === 'error'
            ? 'bg-red-900/80 border-red-500/30 text-red-200'
            : toast.type === 'warning'
            ? 'bg-amber-900/80 border-amber-500/30 text-amber-200'
            : 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-white mb-1">Payment Tracker</h1>
          <p className="text-white/40 text-sm">Review and confirm course purchase payments from users.</p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium px-4 py-2 rounded-xl transition-all text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payments', value: stats.total, color: 'text-white' },
          { label: 'Pending Review', value: stats.pending, color: 'text-amber-400' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-400' },
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className={`font-serif text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {['all', 'pending', 'completed', 'failed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {s === 'all' ? 'All' : s === 'completed' ? 'Confirmed' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            id="payment-search"
            type="text"
            placeholder="Search by name, email, phone, course..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-white/30" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={32} className="text-red-400/60" />
            <p className="text-white/50 text-sm">{error}</p>
            <button onClick={fetchPayments} className="text-amber-400 text-xs hover:underline">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-2">
              <CreditCard size={28} />
            </div>
            <h3 className="text-white font-medium">No payments found</h3>
            <p className="text-white/40 text-sm">
              {search ? 'No results match your search.' : 'When users purchase courses, transactions will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Buyer', 'Course', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    actionLoading={actionLoading}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending alert */}
      {stats.pending > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3.5 text-sm text-amber-300">
          <Clock size={16} className="flex-shrink-0" />
          <span>
            <strong>{stats.pending}</strong> payment{stats.pending > 1 ? 's' : ''} awaiting your review.
            Confirm to grant course access to the user.
          </span>
        </div>
      )}
    </div>
  );
}
