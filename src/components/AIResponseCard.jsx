import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, MessageCircle, Scroll } from 'lucide-react';
import ShlokaCard from './ShlokaCard';
import EmotionTag from './EmotionTag';

export default function AIResponseCard({ response }) {
  if (!response) return null;

  const { greeting, detectedEmotion, shloka, secondaryShloka, relatedStory, reflection, practicalSteps } = response;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Greeting */}
      <div className="glass-card-gold p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-cosmic-900 font-serif text-sm flex-shrink-0 mt-0.5">
            ॐ
          </div>
          <div>
            <p className="text-xs text-gold-500/60 uppercase tracking-wider font-medium mb-2">Dharma Setu</p>
            <p className="text-base text-white/80 leading-relaxed font-light">{greeting}</p>
            <div className="mt-3">
              <EmotionTag emotion={detectedEmotion} />
            </div>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div className="glass-card border border-white/[0.06] p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={16} className="text-indigo-400" />
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Reflection</span>
        </div>
        <p className="text-sm text-white/65 leading-loose font-light">{reflection}</p>
      </div>

      {/* Primary Shloka */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-gold-500" />
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">From the Bhagavad Gita</span>
        </div>
        <ShlokaCard shloka={shloka} featured={true} />
      </div>

      {/* Practical Steps */}
      <div className="glass-card border border-white/[0.06] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb size={16} className="text-saffron-400" />
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Practical Steps</span>
        </div>
        <div className="space-y-4">
          {practicalSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs text-gold-500 font-medium flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-light">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Story */}
      {relatedStory && (
        <div className="glass-card border border-indigo-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scroll size={16} className="text-indigo-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Related Story</span>
          </div>
          <div className="mb-2">
            <span className="text-xs text-indigo-400/60">{relatedStory.scripture}</span>
            <h4 className="font-serif text-lg text-indigo-300 mt-1">{relatedStory.title}</h4>
          </div>
          <p className="text-sm text-white/50 leading-relaxed mb-4">{relatedStory.summary}</p>
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
            <p className="text-sm text-indigo-300/70 font-serif italic">{relatedStory.wisdom}</p>
          </div>
        </div>
      )}

      {/* Secondary Shloka */}
      {secondaryShloka && (
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">Also Relevant</p>
          <ShlokaCard shloka={secondaryShloka} compact={true} />
        </div>
      )}
    </motion.div>
  );
}
