import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AnnouncementStrip() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="overflow-hidden w-full"
        >
          <div className="relative bg-gradient-to-r from-gold-600/20 via-gold-500/25 to-indigo-600/20 border-b border-gold-500/30 text-center px-4 py-2">
            {/* Subtle shimmer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                style={{ animation: 'shimmerSlide 3s ease-in-out infinite' }}
              />
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Sparkles size={13} className="text-gold-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white/80 font-medium">
                🙏 Dharma Setu is now live! Explore AI-powered wisdom from the Bhagavad Gita, Ramayana & Mahabharata.
              </span>
              <Link
                to="/guidance"
                className="inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 font-semibold transition-colors group whitespace-nowrap"
              >
                Try it free <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <button
              onClick={() => setVisible(false)}
              aria-label="Close announcement"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>

          {/* CSS keyframe for shimmer */}
          <style>{`
            @keyframes shimmerSlide {
              0%   { transform: translateX(-200%); }
              100% { transform: translateX(400%); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
