import { motion } from 'framer-motion';
import { BookOpen, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { emotionTagColors } from '../data/shlokas';
import EmotionTag from './EmotionTag';

export default function ShlokaCard({ shloka, featured = false, compact = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shloka.sanskrit}\n\n${shloka.meaning}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2, borderColor: 'rgba(201,169,110,0.3)' }}
        className="glass-card p-5 cursor-default border border-white/[0.06] transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs text-white/30 font-medium">Chapter {shloka.chapter} · Verse {shloka.verse}</span>
          <BookOpen size={14} className="text-gold-500/40" />
        </div>
        <p className="font-serif text-gold-400 text-sm italic leading-relaxed mb-3 line-clamp-2">
          {shloka.sanskrit.split('\n')[0]}…
        </p>
        <p className="text-white/50 text-xs leading-relaxed line-clamp-3">{shloka.meaning}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {shloka.emotions.slice(0, 2).map(e => <EmotionTag key={e} emotion={e} />)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden ${featured ? 'glass-card-gold' : 'glass-card border border-white/[0.06]'} p-6 md:p-8`}
    >
      {featured && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-6 rounded-full ${featured ? 'bg-gold-500' : 'bg-gold-500/50'}`} />
          <span className="text-xs text-white/40 font-medium tracking-wider uppercase">
            Bhagavad Gita · Chapter {shloka.chapter}, Verse {shloka.verse}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg text-white/30 hover:text-gold-400 hover:bg-white/5 transition-all duration-200"
          title="Copy shloka"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Sanskrit text */}
      <div className="mb-5">
        <p className={`font-serif text-lg md:text-xl leading-relaxed ${featured ? 'shimmer-text' : 'text-gold-400'}`}>
          {shloka.sanskrit}
        </p>
      </div>

      {/* Divider */}
      <div className="sacred-divider mb-5">
        <span className="text-xs text-white/20 tracking-widest">✦</span>
      </div>

      {/* Transliteration */}
      <p className="text-white/40 text-sm italic mb-4 font-light leading-relaxed">
        {shloka.transliteration}
      </p>

      {/* Meaning */}
      <div className="mb-5">
        <p className="text-base text-white/70 leading-relaxed font-light">{shloka.meaning}</p>
      </div>

      {/* Explanation */}
      {!compact && (
        <div className="bg-white/[0.03] rounded-xl p-4 mb-5 border border-white/[0.05]">
          <p className="text-sm text-white/60 leading-relaxed">{shloka.explanation}</p>
        </div>
      )}

      {/* Practical advice */}
      {featured && (
        <div className="bg-gold-500/5 border border-gold-500/20 rounded-xl p-4 mb-5">
          <p className="text-xs text-gold-500/70 font-medium uppercase tracking-wider mb-2">Today's Practice</p>
          <p className="text-sm text-gold-400/80 leading-relaxed">{shloka.practicalAdvice}</p>
        </div>
      )}

      {/* Emotion tags */}
      <div className="flex flex-wrap gap-2">
        {shloka.emotions.map(emotion => (
          <EmotionTag key={emotion} emotion={emotion} />
        ))}
      </div>
    </motion.div>
  );
}
