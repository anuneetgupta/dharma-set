import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Zap, Crown, CheckCircle2, Loader2,
  CreditCard, Smartphone, ShieldCheck, AlertCircle,
  ArrowLeft, Eye, EyeOff, User, Mail, Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: '99',
    price: 99,
    label: 'Seeker',
    chats: 15,
    icon: Sparkles,
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    btnClass: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400/60',
    perks: ['15 AI Guidance sessions', 'No daily limit while active', 'Priority spiritual wisdom', 'Valid until credits run out'],
    badge: null,
  },
  {
    id: '199',
    price: 199,
    label: 'Devotee',
    chats: 35,
    icon: Crown,
    color: 'from-gold-500/25 to-yellow-400/15',
    border: 'border-gold-500/40',
    badgeColor: 'bg-gold-500/15 text-gold-400 border-gold-500/40',
    btnClass: 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-cosmic-900 font-semibold border border-gold-400/60',
    perks: ['35 AI Guidance sessions', 'No daily limit while active', 'Priority spiritual wisdom', 'Best value — save more'],
    badge: 'Best Value',
  },
];

const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

// ── Payment Form (step 2) ──────────────────────────────────────────────────
function PaymentForm({ plan, onBack, onPaid, submitting }) {
  const [payMethod, setPayMethod] = useState('card');
  const [cardData, setCardData] = useState({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [payError, setPayError] = useState('');

  const handleSubmit = () => {
    setPayError('');
    if (payMethod === 'card') {
      const num = cardData.cardNumber.replace(/\s/g, '');
      if (num.length < 16) return setPayError('Please enter a valid 16-digit card number');
      if (!cardData.cardHolder.trim()) return setPayError('Please enter the cardholder name');
      if (!cardData.expiry || cardData.expiry.length < 5) return setPayError('Please enter card expiry (MM/YY)');
      if (!cardData.cvv || cardData.cvv.length < 3) return setPayError('Please enter the CVV');
    } else {
      if (!upiId.trim() || !upiId.includes('@')) return setPayError('Please enter a valid UPI ID (e.g. name@upi)');
    }

    const paymentDetails = payMethod === 'card'
      ? { cardNumber: cardData.cardNumber, cardHolder: cardData.cardHolder, expiry: cardData.expiry }
      : { upiId };

    onPaid({ paymentMethod: payMethod, paymentDetails });
  };

  return (
    <motion.div
      key="payment-form"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Plan summary */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{plan.label} Plan</p>
          <p className="text-sm text-white/70">{plan.chats} AI Guidance sessions</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-2xl text-amber-400">₹{plan.price}</p>
          <p className="text-xs text-white/30">one-time</p>
        </div>
      </div>

      {/* Method Toggle */}
      <div className="flex gap-2">
        {['card', 'upi'].map(m => (
          <button
            key={m}
            onClick={() => setPayMethod(m)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
              payMethod === m
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20'
            }`}
          >
            {m === 'card' ? <CreditCard size={16} /> : <Smartphone size={16} />}
            {m === 'card' ? 'Card' : 'UPI'}
          </button>
        ))}
      </div>

      {/* Card form */}
      {payMethod === 'card' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider">Card Number</label>
            <input
              type="text"
              value={cardData.cardNumber}
              onChange={e => setCardData(d => ({ ...d, cardNumber: formatCardNumber(e.target.value) }))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider">Cardholder Name</label>
            <input
              type="text"
              value={cardData.cardHolder}
              onChange={e => setCardData(d => ({ ...d, cardHolder: e.target.value }))}
              placeholder="Name as on card"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Expiry (MM/YY)</label>
              <input
                type="text"
                value={cardData.expiry}
                onChange={e => setCardData(d => ({ ...d, expiry: formatExpiry(e.target.value) }))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">CVV</label>
              <div className="relative">
                <input
                  type={showCvv ? 'text' : 'password'}
                  value={cardData.cvv}
                  onChange={e => setCardData(d => ({ ...d, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCvv(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showCvv ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI form */}
      {payMethod === 'upi' && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <div className="w-44 h-44 rounded-2xl overflow-hidden shadow-lg shadow-black/40 border border-white/10 bg-white flex items-center justify-center p-2">
              <img
                src="/qr-code.jpeg"
                alt="UPI QR Code — Scan to pay"
                className="w-full h-full object-contain rotate-90"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            <p className="text-xs text-white/40">Scan with any UPI app to pay</p>
            <p className="text-xs text-amber-400/60 font-medium">PhonePe · GPay · Paytm · BHIM</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider">Your UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="yourname@paytm / @gpay / @phonepe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>
        </div>
      )}

      {payError && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} /> {payError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.07] text-sm transition-all disabled:opacity-40"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold text-sm hover:from-amber-500 hover:to-amber-400 hover:scale-[1.02] disabled:opacity-60 transition-all duration-300 shadow-lg shadow-amber-900/30"
        >
          {submitting
            ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
            : <><ShieldCheck size={16} /> Pay ₹{plan.price}</>
          }
        </button>
      </div>

      <p className="text-center text-xs text-white/20 flex items-center justify-center gap-1.5">
        <ShieldCheck size={11} /> 256-bit SSL encrypted · Your payment is secure
      </p>
    </motion.div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────
export default function PremiumModal({ isOpen, onClose, onSuccess }) {
  const { authFetch, updateUser } = useAuth();
  const [step, setStep] = useState('plans'); // 'plans' | 'payment' | 'success'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handlePaid = async ({ paymentMethod, paymentDetails }) => {
    setSubmitting(true);
    try {
      const res = await authFetch('/guidance-plan/buy', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod,
          paymentDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessData({ plan: selectedPlan, data: data.data });
        setStep('success');
        updateUser({ isPremium: true, premiumChatsRemaining: data.data.premiumChatsRemaining });
        if (onSuccess) onSuccess(data.data);
      } else {
        alert(data.message || 'Purchase failed. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('plans');
    setSelectedPlan(null);
    setSuccessData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-cosmic-900/80 backdrop-blur-md" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-cosmic-800/90 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            {/* Step indicator */}
            {step !== 'success' && (
              <div className="absolute top-0 left-0 right-0 pt-3 px-6 flex gap-2 pointer-events-none" style={{ top: '2px' }}>
                {['plans', 'payment'].map((s, i) => (
                  <div
                    key={s}
                    className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                      (step === 'plans' && i === 0) || (step === 'payment' && i <= 1)
                        ? 'bg-amber-500'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
            >
              <X size={14} />
            </button>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">

                {/* ── STEP 1: Plan Selection ── */}
                {step === 'plans' && (
                  <motion.div
                    key="plans"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs mb-4">
                        <Zap size={11} />
                        Upgrade Your Wisdom
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2">
                        Unlock More <span className="text-gold-400">Guidance</span> 🔮
                      </h2>
                      <p className="text-white/40 text-sm max-w-sm mx-auto">
                        You've used all 5 of your free daily sessions. Choose a plan to continue receiving spiritual wisdom.
                      </p>
                    </div>

                    {/* Plan cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {PLANS.map((plan) => {
                        const Icon = plan.icon;
                        return (
                          <motion.div
                            key={plan.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className={`relative rounded-2xl border ${plan.border} bg-gradient-to-br ${plan.color} p-5 flex flex-col gap-4 overflow-hidden`}
                          >
                            {plan.badge && (
                              <div className="absolute top-3 right-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${plan.badgeColor}`}>
                                  {plan.badge}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl border ${plan.border} bg-white/[0.05] flex items-center justify-center`}>
                                <Icon size={18} className="text-gold-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{plan.label}</p>
                                <p className="text-white/40 text-xs">{plan.chats} AI sessions</p>
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1">
                              <span className="text-white/30 text-lg">₹</span>
                              <span className="font-serif text-4xl text-white">{plan.price}</span>
                              <span className="text-white/30 text-sm">one-time</span>
                            </div>

                            <ul className="space-y-1.5 flex-1">
                              {plan.perks.map((perk) => (
                                <li key={perk} className="flex items-start gap-2 text-xs text-white/55">
                                  <CheckCircle2 size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                                  {perk}
                                </li>
                              ))}
                            </ul>

                            {/* Select Plan → go to payment */}
                            <button
                              onClick={() => handleSelectPlan(plan)}
                              className={`w-full py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 ${plan.btnClass}`}
                            >
                              Get Started — ₹{plan.price}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>

                    <p className="text-center text-xs text-white/20">
                      Credits are added instantly after purchase · No subscription · Use anytime
                    </p>
                  </motion.div>
                )}

                {/* ── STEP 2: Payment ── */}
                {step === 'payment' && selectedPlan && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Header */}
                    <div className="mb-6">
                      <div className="text-xs text-amber-400/70 font-medium uppercase tracking-widest mb-1">
                        Step 2 of 2 — Payment
                      </div>
                      <h2 className="font-serif text-xl text-white">Complete Your Purchase</h2>
                    </div>

                    <PaymentForm
                      plan={selectedPlan}
                      onBack={() => setStep('plans')}
                      onPaid={handlePaid}
                      submitting={submitting}
                    />
                  </motion.div>
                )}

                {/* ── STEP 3: Success ── */}
                {step === 'success' && successData && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="text-center py-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-400/10 border border-gold-500/30 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} className="text-gold-400" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs mb-4">
                      <Crown size={11} /> Premium Activated
                    </div>
                    <h2 className="font-serif text-2xl text-white mb-2">
                      Narayan Narayan! 🙏
                    </h2>
                    <p className="text-white/50 text-sm mb-2">
                      <span className="text-gold-400 font-medium">{successData.plan.label}</span> plan activated!
                    </p>
                    <p className="text-white/35 text-sm mb-8">
                      You now have <span className="text-white/70 font-medium">{successData.data.premiumChatsRemaining} guidance sessions</span> ready to use.
                    </p>
                    <button
                      onClick={handleClose}
                      className="btn-primary py-3 px-8"
                    >
                      Continue to Guidance ✨
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
