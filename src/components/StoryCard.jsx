import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import EmotionTag from './EmotionTag';
import { scriptureColors } from '../data/stories';

export default function StoryCard({ story, featured = false }) {
  const [expanded, setExpanded] = useState(false);
  const scriptureStyle = scriptureColors[story.scripture] || scriptureColors['Bhagavad Gita'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-white/[0.06] overflow-hidden hover:border-gold-500/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${scriptureStyle.bg} ${scriptureStyle.border} ${scriptureStyle.text} border`}>
              {story.scripture}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/30 font-medium">{story.character}</div>
          </div>
        </div>

        <h3 className="font-serif text-xl text-gold-400 mb-3 leading-tight">{story.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{story.summary}</p>

        {/* Emotion tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {story.emotions.map(e => <EmotionTag key={e} emotion={e} />)}
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 border-t border-white/[0.06] text-sm text-white/40 hover:text-gold-400 hover:bg-white/[0.02] transition-all duration-200"
      >
        {expanded ? (
          <><ChevronUp size={14} /> Show less</>
        ) : (
          <><ChevronDown size={14} /> Read the full story</>
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-5">
              {/* Full story */}
              <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.05]">
                <p className="text-sm text-white/60 leading-loose whitespace-pre-line font-light">
                  {story.fullStory}
                </p>
              </div>

              {/* Wisdom */}
              <div className="bg-gold-500/5 border border-gold-500/20 rounded-xl p-5">
                <p className="text-xs text-gold-500/60 uppercase tracking-wider font-medium mb-2">Wisdom Extract</p>
                <p className="text-sm text-gold-400/80 leading-relaxed font-serif italic">{story.wisdom}</p>
              </div>

              {/* Modern parallel */}
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5">
                <p className="text-xs text-indigo-400/60 uppercase tracking-wider font-medium mb-2">In Your Life Today</p>
                <p className="text-sm text-indigo-300/70 leading-relaxed">{story.modernParallel}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
