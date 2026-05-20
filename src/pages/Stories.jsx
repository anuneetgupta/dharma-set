import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import { stories } from '../data/stories';

const allEmotions = [...new Set(stories.flatMap(s => s.emotions))].sort();
const allScriptures = [...new Set(stories.map(s => s.scripture))];

export default function Stories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScripture, setSelectedScripture] = useState('All');
  const [selectedEmotion, setSelectedEmotion] = useState('All');

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchSearch = !searchQuery ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.character.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchScripture = selectedScripture === 'All' || story.scripture === selectedScripture;
      const matchEmotion = selectedEmotion === 'All' || story.emotions.includes(selectedEmotion);
      return matchSearch && matchScripture && matchEmotion;
    });
  }, [searchQuery, selectedScripture, selectedEmotion]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs mb-4">
            <span>📖</span>
            Epic Wisdom
          </div>
          <h1 className="section-title mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl">Sacred Stories</h1>
          <p className="section-subtitle mx-auto">
            Every crisis in the epics mirrors a crisis in your life. Find yours.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/[0.06] p-5 mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search by story, character, or theme..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-sm text-white/70 placeholder-white/20 outline-none focus:border-gold-500/30 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-start gap-2 sm:gap-3">
            {/* Scripture filter */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={14} className="text-white/30 flex-shrink-0" />
              <span className="text-xs text-white/30 flex-shrink-0">Scripture:</span>
              {['All', ...allScriptures].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedScripture(s)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    selectedScripture === s
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                      : 'border-white/10 text-white/30 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Emotion filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-white/30 mr-1 self-center">Emotion:</span>
            {['All', ...allEmotions].map(e => (
              <button
                key={e}
                onClick={() => setSelectedEmotion(e)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${
                  selectedEmotion === e
                    ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                    : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/30">
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
          </p>
        </div>

        {/* Story grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {filteredStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StoryCard story={story} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/30">
            <div className="font-serif text-4xl mb-4">📜</div>
            <p>No stories match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
