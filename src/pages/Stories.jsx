import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Users } from 'lucide-react';
import StoryCard from '../components/StoryCard';
import { stories } from '../data/stories';

// Pre-compute unique values at module level
const allEmotions = [...new Set(stories.flatMap(s => s.emotions))].sort();
const allScriptures = [...new Set(stories.map(s => s.scripture))];
const allCharacters = [...new Set(stories.map(s => s.character))];

const scriptureColors = {
  Mahabharata:    { active: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400', dot: 'bg-indigo-400' },
  Ramayana:       { active: 'bg-orange-500/20 border-orange-500/40 text-orange-400', dot: 'bg-orange-400' },
  'Bhagavad Gita':{ active: 'bg-gold-500/20  border-gold-500/40  text-gold-400',    dot: 'bg-gold-400'  },
};

const characterEmoji = {
  Arjuna:       '🏹',
  Rama:         '🌿',
  Draupadi:     '⚖️',
  Hanuman:      '🌊',
  Karna:        '☀️',
  Sita:         '🔥',
  Yudhishthira: '🐕',
  Eklavya:      '🎯',
};

/** Score a story against the search query.
 *  Returns: 2 = strong match (title or character), 1 = weak match (summary/themes), 0 = no match */
function scoreStory(story, query) {
  if (!query) return 2;
  const q = query.toLowerCase().trim();
  if (!q) return 2;

  const inTitle     = story.title.toLowerCase().includes(q);
  const inCharacter = story.character.toLowerCase().includes(q);
  const inSummary   = story.summary.toLowerCase().includes(q);
  const inThemes    = (story.themes || []).some(t => t.toLowerCase().includes(q));
  const inEmotions  = story.emotions.some(e => e.toLowerCase().includes(q));

  if (inTitle || inCharacter) return 2;          // exact intent match
  if (inSummary || inThemes || inEmotions) return 1; // contextual match
  return 0;
}

export default function Stories() {
  const [searchQuery,       setSearchQuery]       = useState('');
  const [selectedScripture, setSelectedScripture] = useState('All');
  const [selectedCharacter, setSelectedCharacter] = useState('All');
  const [selectedEmotion,   setSelectedEmotion]   = useState('All');

  const activeFilterCount = [
    selectedScripture !== 'All',
    selectedCharacter !== 'All',
    selectedEmotion   !== 'All',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearchQuery('');
    setSelectedScripture('All');
    setSelectedCharacter('All');
    setSelectedEmotion('All');
  };

  // Scored + filtered stories, sorted by relevance
  const filteredStories = useMemo(() => {
    const results = [];

    for (const story of stories) {
      const score         = scoreStory(story, searchQuery.trim());
      const matchSearch   = score > 0;
      const matchScripture = selectedScripture === 'All' || story.scripture  === selectedScripture;
      const matchCharacter = selectedCharacter === 'All' || story.character  === selectedCharacter;
      const matchEmotion   = selectedEmotion   === 'All' || story.emotions.includes(selectedEmotion);

      if (matchSearch && matchScripture && matchCharacter && matchEmotion) {
        results.push({ story, score });
      }
    }

    // Strong matches (title/character) first, then contextual matches
    results.sort((a, b) => b.score - a.score);
    return results;
  }, [searchQuery, selectedScripture, selectedCharacter, selectedEmotion]);

  const hasWeakMatches = filteredStories.some(r => r.score === 1);
  const hasStrongMatches = filteredStories.some(r => r.score === 2);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="page-container">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
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

        {/* ── Filter Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/[0.06] p-5 mb-6 space-y-5"
        >
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by character name, title, or emotion…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-10 py-3 text-sm text-white/70 placeholder-white/20 outline-none focus:border-gold-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Character filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} className="text-white/30" />
              <span className="text-xs text-white/30 uppercase tracking-wider font-medium">Character</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCharacter('All')}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200 ${
                  selectedCharacter === 'All'
                    ? 'bg-white/10 border-white/30 text-white/80'
                    : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
                }`}
              >
                All Characters
              </button>
              {allCharacters.map(char => (
                <button
                  key={char}
                  onClick={() => setSelectedCharacter(selectedCharacter === char ? 'All' : char)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200 flex items-center gap-1.5 ${
                    selectedCharacter === char
                      ? 'bg-gold-500/20 border-gold-500/40 text-gold-400'
                      : 'border-white/10 text-white/30 hover:border-gold-500/20 hover:text-white/50'
                  }`}
                >
                  <span>{characterEmoji[char] || '✦'}</span>
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Scripture + Emotion filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scripture */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={13} className="text-white/30" />
                <span className="text-xs text-white/30 uppercase tracking-wider font-medium">Scripture</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedScripture('All')}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200 ${
                    selectedScripture === 'All'
                      ? 'bg-white/10 border-white/30 text-white/80'
                      : 'border-white/10 text-white/30 hover:border-white/20'
                  }`}
                >
                  All
                </button>
                {allScriptures.map(s => {
                  const colors = scriptureColors[s] || scriptureColors.Mahabharata;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedScripture(selectedScripture === s ? 'All' : s)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200 flex items-center gap-1.5 ${
                        selectedScripture === s
                          ? colors.active
                          : 'border-white/10 text-white/30 hover:border-white/20'
                      }`}
                    >
                      {selectedScripture === s && <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emotion */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/30 text-xs">💭</span>
                <span className="text-xs text-white/30 uppercase tracking-wider font-medium">Emotion / Theme</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedEmotion('All')}
                  className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 ${
                    selectedEmotion === 'All'
                      ? 'bg-white/10 border-white/30 text-white/80'
                      : 'border-white/10 text-white/30 hover:border-white/20'
                  }`}
                >
                  All
                </button>
                {allEmotions.map(e => (
                  <button
                    key={e}
                    onClick={() => setSelectedEmotion(selectedEmotion === e ? 'All' : e)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all duration-200 ${
                      selectedEmotion === e
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                        : 'border-white/10 text-white/30 hover:border-white/20'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Results bar ── */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <p className="text-sm text-white/30">
            {filteredStories.length === 0
              ? 'No stories found'
              : `${filteredStories.length} ${filteredStories.length === 1 ? 'story' : 'stories'} found`}
            {searchQuery.trim() && (
              <span className="text-white/20">
                {' '}for <span className="text-white/50 italic">"{searchQuery}"</span>
              </span>
            )}
          </p>

          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
              >
                <X size={12} />
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Story Grid ── */}
        <AnimatePresence mode="wait">
          {filteredStories.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Strong matches (title / character) */}
              {hasStrongMatches && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {filteredStories
                    .filter(r => r.score === 2)
                    .map(({ story }, i) => (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <StoryCard story={story} />
                      </motion.div>
                    ))}
                </div>
              )}

              {/* Weak / contextual matches — only shown if there's a search query */}
              {hasWeakMatches && searchQuery.trim() && (
                <>
                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-xs text-white/25 uppercase tracking-wider px-2">Also mentions this</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 opacity-60">
                    {filteredStories
                      .filter(r => r.score === 1)
                      .map(({ story }, i) => (
                        <motion.div
                          key={story.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <StoryCard story={story} />
                        </motion.div>
                      ))}
                  </div>
                </>
              )}

              {/* No search query — just show all matched normally */}
              {!searchQuery.trim() && hasWeakMatches && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4">
                  {filteredStories
                    .filter(r => r.score === 1)
                    .map(({ story }, i) => (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <StoryCard story={story} />
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="text-5xl mb-4">📜</div>
              <p className="text-white/40 text-base mb-2">No stories match your filters.</p>
              <p className="text-white/25 text-sm mb-6">
                Try searching by a character name like <span className="text-gold-400/60">Arjuna</span>,{' '}
                <span className="text-gold-400/60">Hanuman</span>, or <span className="text-gold-400/60">Karna</span>.
              </p>
              <button
                onClick={clearAll}
                className="px-5 py-2 rounded-full border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-sm transition-all"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
