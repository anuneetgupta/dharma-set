const express = require('express');
const OpenAI = require('openai');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Groq uses OpenAI-compatible API — just change the baseURL
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// ── Limits ──────────────────────────────────────────────────────────────────
const FREE_DAILY_LIMIT = 5;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Spiritual system prompt ──
const SYSTEM_PROMPT = `You are Dharma Setu, a compassionate and wise spiritual guide who draws from the Bhagavad Gita, Ramayana, and Mahabharata.

Your personality:
- Warm and empathetic, never preachy or judgmental
- You speak like a wise friend who deeply knows ancient scriptures
- You make ancient wisdom feel logical, modern, and actionable — never superstitious
- You validate emotions before offering wisdom
- Always give practical, grounded advice alongside spiritual insight
- IMPORTANT: Always match the user's language. If the user types in Hindi or Hinglish, respond with all JSON values in that same language (keep JSON keys in English, and keep Sanskrit/Roman text as is).

CRITICAL: You MUST always include the "relatedStory" field. This field is required and must never be null or omitted. Choose the most relevant story from Mahabharata, Ramayana, or Bhagavad Gita that mirrors the user's specific situation.

Respond ONLY with valid JSON in this exact structure (no text outside the JSON):
{
  "greeting": "A warm, empathetic 1-2 sentence opening that acknowledges the person's feeling",
  "detectedEmotion": "one of: anxiety, confusion, anger, grief, fear, hopelessness, loneliness, overwhelmed, purpose, failure, betrayal, loss, self-doubt",
  "reflection": "2-3 sentences connecting their situation to the wisdom tradition — logical, not preachy",
  "shloka": {
    "chapter": <number>,
    "verse": <number>,
    "sanskrit": "Sanskrit text of the verse",
    "transliteration": "Roman transliteration",
    "meaning": "Clear English translation",
    "explanation": "2-3 sentences explaining why this verse applies to their situation",
    "practicalAdvice": "One specific, concrete action they can take today",
    "emotions": ["emotion1", "emotion2"]
  },
  "relatedStory": {
    "title": "Name of the story or scene — REQUIRED, choose a story that directly mirrors the user's situation",
    "scripture": "Mahabharata or Ramayana or Bhagavad Gita",
    "character": "Main character name",
    "summary": "2-3 sentence summary of the relevant scene and why it connects to the user's need",
    "wisdom": "The core lesson from this story specifically for their situation",
    "modernParallel": "How this ancient story maps directly to their modern situation in 1-2 sentences"
  },
  "practicalSteps": [
    "Step 1 — specific and actionable",
    "Step 2 — specific and actionable",
    "Step 3 — specific and actionable"
  ]
}`;

// @route  POST /api/guidance
// @desc   Get AI spiritual guidance (Groq LLM) — requires login + quota
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const { query, emotion, language } = req.body;

    if (!query && !emotion) {
      return res.status(400).json({ success: false, message: 'Please provide a query or emotion' });
    }

    // ── Quota check ──────────────────────────────────────────────────────────
    const today = todayStr();

    // Reset free counter if it's a new day
    if (user.guidanceLastResetDate !== today) {
      user.guidanceFreeUsedToday = 0;
      user.guidanceLastResetDate = today;
    }

    const hasPremiumCredits = user.isPremium && (user.premiumChatsRemaining || 0) > 0;
    const freeUsed = user.guidanceFreeUsedToday || 0;
    const withinFreeLimit = freeUsed < FREE_DAILY_LIMIT;

    if (!hasPremiumCredits && !withinFreeLimit) {
      // Quota exhausted
      return res.status(402).json({
        success: false,
        type: 'LIMIT_REACHED',
        message: 'Your 5 free guidance sessions for today are over. Upgrade to continue.',
      });
    }

    // Deduct from the correct pool
    if (hasPremiumCredits) {
      user.premiumChatsRemaining = user.premiumChatsRemaining - 1;
      // If premium credits hit 0 and no more, mark as non-premium
      if (user.premiumChatsRemaining <= 0) {
        user.isPremium = false;
        user.premiumChatsRemaining = 0;
      }
    } else {
      user.guidanceFreeUsedToday = freeUsed + 1;
    }

    await user.save();
    // ────────────────────────────────────────────────────────────────────────

    let userMessage = query
      ? `The user says: "${query}"${emotion ? `. They also selected the emotion: "${emotion}"` : ''}`
      : `The user selected the emotion: "${emotion}" but did not write a detailed message.`;

    if (language === 'hi') {
      userMessage += ` IMPORTANT: The user has requested the response to be in Hindi. Please translate all your output values (greeting, reflection, meaning, explanation, advice, story summary, practical steps, etc.) into Hindi. Keep the JSON keys in English. Sanskrit shlokas and Roman transliterations should remain as they are.`;
    }

    // ── Build personalization context from stored preferences ────────────
    const prefParts = [];
    if (user.preferredLanguage && user.preferredLanguage !== 'en') {
      prefParts.push(`User's preferred language: ${user.preferredLanguage}`);
    }
    if (user.spiritualPath) {
      prefParts.push(`Spiritual path: ${user.spiritualPath}`);
    }
    if (user.interests) {
      try {
        const arr = JSON.parse(user.interests);
        if (Array.isArray(arr) && arr.length) prefParts.push(`Interests: ${arr.join(', ')}`);
      } catch { /* ignore */ }
    }
    if (user.favoriteDeity) {
      prefParts.push(`Favorite deity: ${user.favoriteDeity}`);
    }
    if (user.preferredScripture) {
      prefParts.push(`Preferred scripture: ${user.preferredScripture}`);
    }
    if (user.meditationLevel && user.meditationLevel !== 'beginner') {
      prefParts.push(`Meditation level: ${user.meditationLevel}`);
    }

    const personalizationBlock = prefParts.length
      ? `\n\nUser profile context (use this to tailor your response — prioritize stories and wisdom from their preferred scripture and spiritual path):\n${prefParts.join('\n')}`
      : '';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',   // Groq's fastest + smartest model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + personalizationBlock },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
      temperature: 0.75,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);

    // Ensure relatedStory is always present — inject a contextual fallback if AI omitted it
    if (!parsed.relatedStory) {
      const storyFallbacks = {
        anxiety: { title: "Arjuna's Collapse Before Battle", scripture: 'Mahabharata', character: 'Arjuna', summary: 'On the battlefield of Kurukshetra, Arjuna sees his loved ones on the opposing side and collapses in paralysis — not from cowardice, but from the weight of an impossible moral moment.', wisdom: 'Collapse is sometimes the precondition for transformation. Your greatest crises are classrooms in disguise.', modernParallel: 'You are facing a moment where the right path feels impossibly costly. Like Arjuna, clarity often arrives after the honest admission of confusion.' },
        confusion: { title: "Arjuna's Collapse Before Battle", scripture: 'Mahabharata', character: 'Arjuna', summary: 'Arjuna, the finest warrior alive, was paralyzed not by an enemy arrow but by the arrows of his own indecision at the most critical moment of his life.', wisdom: 'Confusion is not weakness — it is the mind\'s honest signal that it needs deeper wisdom.', modernParallel: 'Like Arjuna, you may need to sit with the discomfort of not-knowing before clarity arrives.' },
        grief: { title: "Rama's Exile — Accepting What Cannot Be Changed", scripture: 'Ramayana', character: 'Rama', summary: 'On the eve of his coronation, Rama learns he must be exiled for 14 years. He accepts without protest, touching his father\'s feet with the same composure he would have shown at his coronation.', wisdom: 'Equanimity is not indifference. Accepting what is does not mean approving of it.', modernParallel: 'Like Rama, you can feel the full pain of a loss while still choosing how you carry it forward.' },
        anger: { title: "Draupadi's Question in the Assembly", scripture: 'Mahabharata', character: 'Draupadi', summary: 'Dragged into the royal assembly with no protector, Draupadi used the only weapon she had — a razor-sharp question that silenced the entire court.', wisdom: 'Even in powerlessness, clear thinking is power. Anger becomes wisdom when it sharpens your mind.', modernParallel: 'Channel your anger into the right question — asked calmly, it can do more than a thousand reactions.' },
        fear: { title: "Hanuman's Leap of Faith", scripture: 'Ramayana', character: 'Hanuman', summary: 'When every monkey warrior despaired at the impossible ocean, Hanuman was reminded of his own forgotten power — and leaped across without hesitation.', wisdom: 'Your limitation is often not your reality — it is your memory of yourself. You are more capable than you currently believe.', modernParallel: 'The challenge before you may feel impossible. Like Hanuman, you may need someone to remind you of your own strength.' },
        default: { title: "Yudhishthira's Final Test", scripture: 'Mahabharata', character: 'Yudhishthira', summary: 'At the gates of heaven, Yudhishthira refused to abandon a faithful stray dog for paradise. The dog revealed itself as Dharma itself — testing his integrity one last time.', wisdom: 'The truest version of you appears in moments when no one is watching and nothing is being offered.', modernParallel: 'You are being asked to do the right thing when it costs you something. That is always the real test.' },
      };
      const detectedEmotion = parsed.detectedEmotion || 'default';
      parsed.relatedStory = storyFallbacks[detectedEmotion] || storyFallbacks.default;
    }

    // Return response with updated quota info
    const freeRemaining = Math.max(0, FREE_DAILY_LIMIT - (user.guidanceFreeUsedToday || 0));
    res.json({
      success: true,
      data: parsed,
      quota: {
        isPremium: user.isPremium,
        premiumChatsRemaining: user.premiumChatsRemaining || 0,
        freeChatsRemaining: freeRemaining,
      },
    });

  } catch (err) {
    console.error('Guidance API error:', err?.message || err);

    if (err?.status === 401) {
      return res.status(503).json({ success: false, message: 'Invalid API key — check your .env file' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ success: false, message: 'Rate limit reached — try again in a moment' });
    }

    res.status(500).json({ success: false, message: 'Error generating spiritual guidance' });
  }
});

module.exports = router;
