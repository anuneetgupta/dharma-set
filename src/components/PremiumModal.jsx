import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Crown, CheckCircle2, Loader2 } from 'lucide-react';
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

export default function PremiumModal({ isOpen, onClose, onSuccess }) {
  const { authFetch, updateUser } = useAuth();
  const [buying, setBuying] = useState(null); // planId being purchased
  const [success, setSuccess] = useState(null); // success state

  const handleBuy = async (plan) => {
    setBuying(plan.id);
    try {
      const res = await authFetch('/guidance-plan/buy', {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess({ plan, data: data.data });
        // Update user in context so Profile badge shows immediately
        updateUser({ isPremium: true, premiumChatsRemaining: data.data.premiumChatsRemaining });
        // Notify parent to refresh quota
        if (onSuccess) onSuccess(data.data);
      } else {
        alert(data.message || 'Purchase failed. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setBuying(null);
    }
  };

  const handleClose = () => {
    setSuccess(null);
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

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
            >
              <X size={14} />
            </button>

            <div className="p-6 sm:p-8">
              {!success ? (
                <>
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
                      const isLoading = buying === plan.id;
                      return (
                        <motion.div
                          key={plan.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={`relative rounded-2xl border ${plan.border} bg-gradient-to-br ${plan.color} p-5 flex flex-col gap-4 overflow-hidden`}
                        >
                          {/* Best value badge */}
                          {plan.badge && (
                            <div className="absolute top-3 right-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${plan.badgeColor}`}>
                                {plan.badge}
                              </span>
                            </div>
                          )}

                          {/* Plan header */}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl border ${plan.border} bg-white/[0.05] flex items-center justify-center`}>
                              <Icon size={18} className="text-gold-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{plan.label}</p>
                              <p className="text-white/40 text-xs">{plan.chats} AI sessions</p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-white/30 text-lg">₹</span>
                            <span className="font-serif text-4xl text-white">{plan.price}</span>
                            <span className="text-white/30 text-sm">one-time</span>
                          </div>

                          {/* Perks */}
                          <ul className="space-y-1.5 flex-1">
                            {plan.perks.map((perk) => (
                              <li key={perk} className="flex items-start gap-2 text-xs text-white/55">
                                <CheckCircle2 size={12} className="text-gold-400 mt-0.5 flex-shrink-0" />
                                {perk}
                              </li>
                            ))}
                          </ul>

                          {/* Buy button */}
                          <button
                            onClick={() => handleBuy(plan)}
                            disabled={!!buying}
                            className={`w-full py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 ${plan.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isLoading ? (
                              <><Loader2 size={14} className="animate-spin" /> Processing…</>
                            ) : (
                              <>Buy Now — ₹{plan.price}</>
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer note */}
                  <p className="text-center text-xs text-white/20">
                    Credits are added instantly after purchase · No subscription · Use anytime
                  </p>
                </>
              ) : (
                /* ── Success State ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                    <span className="text-gold-400 font-medium">{success.plan.label}</span> plan activated!
                  </p>
                  <p className="text-white/35 text-sm mb-8">
                    You now have <span className="text-white/70 font-medium">{success.data.premiumChatsRemaining} guidance sessions</span> ready to use.
                  </p>
                  <button
                    onClick={handleClose}
                    className="btn-primary py-3 px-8"
                  >
                    Continue to Guidance ✨
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
