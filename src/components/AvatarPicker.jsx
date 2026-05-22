import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 12 beautiful illustrated avatars using DiceBear API — dharmic / spiritual styles
const AVATAR_STYLES = [
  { seed: 'Arjuna',    style: 'avataaars',   label: 'Warrior'    },
  { seed: 'Radha',     style: 'avataaars',   label: 'Devotee'    },
  { seed: 'Sage',      style: 'bottts',      label: 'Sage'       },
  { seed: 'Lotus',     style: 'fun-emoji',   label: 'Seeker'     },
  { seed: 'Krishna',   style: 'avataaars',   label: 'Mystic'     },
  { seed: 'Ganga',     style: 'avataaars',   label: 'River'      },
  { seed: 'Dhruva',    style: 'bottts',      label: 'Star'       },
  { seed: 'Meera',     style: 'avataaars',   label: 'Bhakta'     },
  { seed: 'Veda',      style: 'fun-emoji',   label: 'Scholar'    },
  { seed: 'Shiva',     style: 'bottts',      label: 'Ascetic'    },
  { seed: 'Priya',     style: 'avataaars',   label: 'Wanderer'   },
  { seed: 'Ananda',    style: 'fun-emoji',   label: 'Joyful'     },
];

function getAvatarUrl(style, seed) {
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear`;
}

export default function AvatarPicker() {
  const { user, updateUser } = useAuth();
  const [selected, setSelected] = useState(null);  // null = nothing chosen yet
  const [saving, setSaving] = useState(false);

  // Don't render if user is not logged in OR already chose an avatar
  if (!user || user.avatarChosen) return null;

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    
    // Simulate a tiny delay for UX so it doesn't feel jarring
    await new Promise(r => setTimeout(r, 600));

    const avatarUrl = getAvatarUrl(
      AVATAR_STYLES.find(a => a.seed === selected)?.style,
      selected
    );

    // Save strictly to local storage
    localStorage.setItem(`dharma_avatar_${user.email}`, avatarUrl);
    
    // Update frontend state immediately
    updateUser({ avatar: avatarUrl, avatarChosen: true });
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(10, 8, 20, 0.92)', backdropFilter: 'blur(16px)' }}
      >
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/[0.08] bg-cosmic-800/95 shadow-card"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-cosmic-800/95 backdrop-blur-xl px-6 pt-8 pb-5 border-b border-white/[0.06]">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs mb-3">
                <Sparkles size={11} />
                Choose your avatar
              </div>
              <h2 className="font-serif text-2xl text-white mb-1">
                Welcome, {user.name?.split(' ')[0]} 🙏
              </h2>
              <p className="text-sm text-white/40">
                Pick an avatar that represents your journey on Dharma Setu
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Illustrated avatars grid */}
            <div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {AVATAR_STYLES.map((av) => {
                  const url = getAvatarUrl(av.style, av.seed);
                  const isSelected = selected === av.seed;
                  return (
                    <motion.button
                      key={av.seed}
                      onClick={() => setSelected(av.seed)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-gold-500/60 bg-gold-500/10 shadow-[0_0_0_3px_rgba(201,169,110,0.15)]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 z-10">
                          <CheckCircle2 size={14} className="text-gold-400" />
                        </div>
                      )}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                        <img
                          src={url}
                          alt={av.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-[10px] text-white/40 font-medium tracking-wide">
                        {av.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Confirm button */}
            <motion.button
              onClick={handleConfirm}
              disabled={!selected || saving}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: selected ? 'linear-gradient(135deg, #C9A96E 0%, #A07840 50%, #C9A96E 100%)' : undefined, backgroundColor: selected ? undefined : '#1e1b2e', color: selected ? '#0a0814' : 'rgba(255,255,255,0.3)' }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-cosmic-900/40 border-t-cosmic-900 rounded-full animate-spin" />
                  Saving your avatar locally…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  {selected ? 'Confirm Avatar & Begin' : 'Select an avatar to continue'}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
