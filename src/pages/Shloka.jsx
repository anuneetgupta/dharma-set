import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import ShlokaCard from '../components/ShlokaCard';
import { shlokas, getDailyShlokaIndex } from '../data/shlokas';

const allEmotions = [...new Set(shlokas.flatMap(s => s.emotions))].sort();
const allChapters = [...new Set(shlokas.map(s => s.chapter))].sort((a, b) => a - b);

export default function Shloka() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [selectedEmotion, setSelectedEmotion] = useState('All');
  const dailyIdx = getDailyShlokaIndex();

  const filteredShlokas = useMemo(() => {
    return shlokas.filter(s => {
      const matchSearch = !searchQuery ||
        s.sanskrit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchChapter = selectedChapter === 'All' || s.chapter === Number(selectedChapter);
      const matchEmotion = selectedEmotion === 'All' || s.emotions.includes(selectedEmotion);
      return matchSearch && matchChapter && matchEmotion;
    });
  }, [searchQuery, selectedChapter, selectedEmotion]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            Bhagavad Gita
          </div>
          <h1 className="section-title mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl">Shloka Library</h1>
          <p className="section-subtitle mx-auto">
            700 verses. Timeless wisdom. Explore by emotion, chapter, or simply search.
          </p>
        </motion.div>

        {/* Today's Shloka featured */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-xs text-gold-500/70 uppercase tracking-wider font-medium">Today's Shloka</span>
          </div>
          <ShlokaCard shloka={shlokas[dailyIdx]} featured={true} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card border border-white/[0.06] p-5 mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search shlokas by keyword, meaning, or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-white/70 placeholder-white/20 outline-none focus:border-gold-500/30 transition-all"
            />
          </div>

          {/* Chapter filter */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-white/30 flex-shrink-0">Chapter:</span>
            {['All', ...allChapters].map(c => (
              <button
                key={c}
                onClick={() => setSelectedChapter(c === 'All' ? 'All' : String(c))}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  selectedChapter === (c === 'All' ? 'All' : String(c))
                    ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                    : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >
                {c === 'All' ? 'All' : `Ch. ${c}`}
              </button>
            ))}
          </div>

          {/* Emotion filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/30">Emotion:</span>
            {['All', ...allEmotions].map(e => (
              <button
                key={e}
                onClick={() => setSelectedEmotion(e)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  selectedEmotion === e
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                    : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <p className="text-sm text-white/30 mb-6">
          Showing {filteredShlokas.length} shlokas
        </p>

        {filteredShlokas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {filteredShlokas.map((shloka, i) => (
              <motion.div
                key={shloka.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ShlokaCard shloka={shloka} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/30">
            <div className="font-serif text-4xl mb-4">📿</div>
            <p>No shlokas match your search. Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
