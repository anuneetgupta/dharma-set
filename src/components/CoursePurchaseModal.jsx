import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, CreditCard, Smartphone,
  CheckCircle, Loader2, ArrowRight, ArrowLeft,
  ShieldCheck, AlertCircle, Eye, EyeOff, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Use relative path so Vite proxy forwards to localhost:5000
// This avoids CORS issues and works identically to the rest of the app
const API_PREFIX = '/api';

// ── Utility: format card number with spaces ───────────────────────────────
const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

// ── OTP Input Component ────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = (value + '      ').slice(0, 6).split('');

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const newVal = value.slice(0, idx) + ' ' + value.slice(idx + 1);
      onChange(newVal.trimEnd());
      if (idx > 0) inputs.current[idx - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const arr = (value + '      ').slice(0, 6).split('');
      arr[idx] = e.key;
      onChange(arr.join('').trimEnd());
      if (idx < 5) inputs.current[idx + 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onKeyDown={e => handleKey(e, i)}
          onChange={() => {}}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg font-bold bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-gold-400/60 focus:bg-white/10 transition-all disabled:opacity-40"
        />
      ))}
    </div>
  );
}

// ── OTP Field Block ────────────────────────────────────────────────────────
function OtpBlock({ label, contact, type, verified, onVerified }) {
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint = type === 'email' ? '/courses/otp/send-email' : '/courses/otp/send-phone';
      const body = type === 'email' ? { email: contact } : { phone: contact };
      const res = await fetch(`${API_PREFIX}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server is unreachable or restarting. Please try again in a moment.');
      }
      
      if (!data.success) throw new Error(data.message);
      setSent(true);
      setCountdown(60);
      setOtp('');
      if (data.devOtp) setDevOtp(data.devOtp); // dev mode helper
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.replace(/\s/g, '').length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const endpoint = type === 'email' ? '/courses/otp/verify-email' : '/courses/otp/verify-phone';
      const body = type === 'email'
        ? { email: contact, otp: otp.replace(/\s/g, '') }
        : { phone: contact, otp: otp.replace(/\s/g, '') };
      const res = await fetch(`${API_PREFIX}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server is unreachable. Please try again.');
      }

      if (!data.success) throw new Error(data.message);
      onVerified();
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
        <CheckCircle size={16} /> {label} verified ✓
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 text-xs text-white/40 truncate">{contact}</div>
        <button
          onClick={sendOtp}
          disabled={loading || countdown > 0 || !contact}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gold-500/15 border border-gold-500/25 text-gold-400 hover:bg-gold-500/25 disabled:opacity-40 transition-all"
        >
          {loading && !sent ? <Loader2 size={12} className="animate-spin" /> : <Phone size={12} />}
          {countdown > 0 ? (
            <span className="flex items-center gap-1"><Clock size={11} />{countdown}s</span>
          ) : (sent ? 'Resend OTP' : 'Send OTP')}
        </button>
      </div>

      {/* Dev OTP helper */}
      {devOtp && (
        <div className="text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-amber-300 flex items-center gap-2">
          <ShieldCheck size={12} /> Dev mode — OTP: <span className="font-bold font-mono">{devOtp}</span>
        </div>
      )}

      {sent && (
        <div className="space-y-2">
          <p className="text-xs text-white/40">Enter the 6-digit OTP sent to your {type}:</p>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <button
            onClick={verifyOtp}
            disabled={loading || otp.replace(/\s/g, '').length < 6}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gold-500/20 border border-gold-500/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/30 disabled:opacity-40 transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Verify OTP
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN MODAL
// ══════════════════════════════════════════════════════════════════════════════
export default function CoursePurchaseModal({ course, onClose }) {
  const { user, token } = useAuth();

  // Step: 1 = buyer details, 2 = payment, 3 = success
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Step 1 form data
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Step 2 payment data
  const [payMethod, setPayMethod] = useState('card'); // 'card' | 'upi'
  const [cardData, setCardData] = useState({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [payError, setPayError] = useState('');

  // Result
  const [txnId, setTxnId] = useState('');

  const priceNum = parseInt((course.price || '₹0').replace(/[^0-9]/g, ''));

  // ── Step 1: validate & proceed ───────────────────────────────────────────
  const handleStep1Next = () => {
    setGlobalError('');
    if (!form.name.trim()) return setGlobalError('Please enter your full name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setGlobalError('Please enter a valid email address');
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) return setGlobalError('Please enter a valid 10-digit Indian mobile number');
    if (!emailVerified) return setGlobalError('Please verify your email address with OTP');
    if (!phoneVerified) return setGlobalError('Please verify your mobile number with OTP');
    setStep(2);
  };

  // ── Step 2: submit payment ────────────────────────────────────────────────
  const handlePaymentSubmit = async () => {
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

    setSubmitting(true);
    try {
      const paymentDetails = payMethod === 'card'
        ? { cardNumber: cardData.cardNumber, cardHolder: cardData.cardHolder, expiry: cardData.expiry }
        : { upiId };

      const res = await fetch(`${API_PREFIX}/courses/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          courseId: course.title.toLowerCase().replace(/\s+/g, '-'),
          courseTitle: course.title,
          coursePrice: priceNum,
          buyerName: form.name,
          buyerEmail: form.email,
          buyerPhone: form.phone,
          paymentMethod: payMethod,
          paymentDetails,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server is currently restarting or unavailable. Please try again in a few seconds.');
      }

      if (!data.success) throw new Error(data.message);
      setTxnId(data.data.transactionId);
      setStep(3);
    } catch (err) {
      setPayError(err.message || 'Payment submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={step !== 3 ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d0a1a] border border-white/10 rounded-3xl shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0d0a1a 0%, #120e24 50%, #0d0a1a 100%)' }}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-t-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="text-xs text-amber-400/70 font-medium uppercase tracking-widest mb-1">
              {step === 1 ? 'Step 1 of 2 — Your Details' : step === 2 ? 'Step 2 of 2 — Payment' : 'Enrollment Submitted'}
            </div>
            <h2 className="font-serif text-xl text-white leading-snug">{course.title}</h2>
            <p className="text-sm text-white/40 mt-0.5">{course.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <div className="font-serif text-2xl text-amber-400">{course.price}</div>
              <div className="text-xs text-white/30 line-through">{course.originalPrice}</div>
            </div>
            {step !== 3 && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex gap-2 px-6 pt-4">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  s <= step ? 'bg-amber-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── STEP 1: Buyer Details ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="p-6 space-y-5"
            >
              <p className="text-sm text-white/50">
                Please fill in your details below. Both your email and mobile number need to be verified with OTP.
              </p>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <User size={11} /> Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="buyer-name"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/50 focus:bg-white/8 transition-all"
                />
              </div>

              {/* Email + OTP */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={11} /> Email Address <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="buyer-email"
                    type="email"
                    value={form.email}
                    onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setEmailVerified(false); }}
                    placeholder="you@example.com"
                    disabled={emailVerified}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-all disabled:opacity-50"
                  />
                </div>
                <OtpBlock
                  label="Email"
                  contact={form.email}
                  type="email"
                  verified={emailVerified}
                  onVerified={() => setEmailVerified(true)}
                />
              </div>

              {/* Phone + OTP */}
              <div className="space-y-2">
                <label className="text-xs text-white/50 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={11} /> Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="buyer-phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => { setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })); setPhoneVerified(false); }}
                  placeholder="10-digit mobile number"
                  disabled={phoneVerified}
                  maxLength={10}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-400/50 transition-all disabled:opacity-50"
                />
                <OtpBlock
                  label="Mobile"
                  contact={form.phone}
                  type="phone"
                  verified={phoneVerified}
                  onVerified={() => setPhoneVerified(true)}
                />
              </div>

              {globalError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={16} /> {globalError}
                </div>
              )}

              <button
                id="purchase-step1-next"
                onClick={handleStep1Next}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold text-sm hover:from-amber-500 hover:to-amber-400 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-amber-900/30"
              >
                Continue to Payment <ArrowRight size={16} />
              </button>

              <p className="text-center text-xs text-white/25 flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} /> Your details are encrypted and secure
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: Payment ─────────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="p-6 space-y-5"
            >
              {/* Buyer summary */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-1.5 text-xs text-white/50">
                <div className="flex items-center gap-2"><User size={11} className="text-amber-400/60" /> {form.name}</div>
                <div className="flex items-center gap-2"><Mail size={11} className="text-amber-400/60" /> {form.email}</div>
                <div className="flex items-center gap-2"><Phone size={11} className="text-amber-400/60" /> +91 {form.phone}</div>
              </div>

              {/* Method Toggle */}
              <div className="flex gap-2">
                {['card', 'upi'].map(m => (
                  <button
                    key={m}
                    id={`pay-method-${m}`}
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
                      id="card-number"
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
                      id="card-holder"
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
                        id="card-expiry"
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
                          id="card-cvv"
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
                  {/* QR Code placeholder */}
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
                      id="upi-id"
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

              {/* Amount summary */}
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Total Amount</p>
                  <p className="font-serif text-2xl text-amber-400">{course.price}</p>
                </div>
                <div className="text-right text-xs text-white/30">
                  <p>Incl. all taxes</p>
                  <p className="text-emerald-400 mt-0.5">Lifetime access</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.07] text-sm transition-all"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  id="pay-submit-btn"
                  onClick={handlePaymentSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold text-sm hover:from-amber-500 hover:to-amber-400 hover:scale-[1.02] disabled:opacity-60 transition-all duration-300 shadow-lg shadow-amber-900/30"
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
                    : <><ShieldCheck size={16} /> Pay {course.price}</>
                  }
                </button>
              </div>

              <p className="text-center text-xs text-white/20 flex items-center justify-center gap-1.5">
                <ShieldCheck size={11} /> 256-bit SSL encrypted · Your payment is secure
              </p>
            </motion.div>
          )}

          {/* ── STEP 3: Success ─────────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="p-8 flex flex-col items-center text-center gap-5"
            >
              {/* Animated check */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle size={44} className="text-emerald-400" />
                  </motion.div>
                </motion.div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
              </div>

              <div>
                <h3 className="font-serif text-2xl text-white mb-2">Payment Submitted!</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                  Your enrollment request for <span className="text-amber-400">{course.title}</span> has been received.
                  Admin will verify the payment and unlock your course shortly.
                </p>
              </div>

              {txnId && (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-3 text-center w-full">
                  <p className="text-xs text-white/30 mb-1">Transaction Reference</p>
                  <p className="font-mono text-sm text-amber-400 font-semibold">{txnId}</p>
                </div>
              )}

              <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 text-left w-full space-y-2">
                {[
                  'Admin reviews your payment',
                  'Course access is activated',
                  'You receive a confirmation',
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3 text-sm text-white/50">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">{i + 1}</div>
                    {step}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  id="success-back-courses"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07] text-sm font-medium transition-all"
                >
                  Browse More Courses
                </button>
                <a
                  href="/dashboard"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:from-amber-500 hover:to-amber-400 transition-all"
                >
                  Go to Dashboard
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
