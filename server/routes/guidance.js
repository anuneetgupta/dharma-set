const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

// Groq uses OpenAI-compatible API — just change the baseURL
const groq = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// ── Spiritual system prompt ──
const SYSTEM_PROMPT = `You are Dharma Setu, a compassionate and wise spiritual guide who draws from the Bhagavad Gita, Ramayana, and Mahabharata.

Your personality:
- Warm and empathetic, never preachy or judgmental
- You speak like a wise friend who deeply knows ancient scriptures
- You make ancient wisdom feel logical, modern, and actionable — never superstitious
- You validate emotions before offering wisdom
- Always give practical, grounded advice alongside spiritual insight

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
    "title": "Name of the story or scene",
    "scripture": "Mahabharata or Ramayana or Bhagavad Gita",
    "character": "Main character name",
    "summary": "2-3 sentence summary of the relevant scene",
    "wisdom": "The core lesson from this story for their situation",
    "modernParallel": "How this maps to their modern situation in 1-2 sentences"
  },
  "practicalSteps": [
    "Step 1 — specific and actionable",
    "Step 2 — specific and actionable",
    "Step 3 — specific and actionable"
  ]
}`;

// @route  POST /api/guidance
// @desc   Get AI spiritual guidance (Groq LLM)
// @access Public
router.post('/', async (req, res) => {
  try {
    const { query, emotion } = req.body;

    if (!query && !emotion) {
      return res.status(400).json({ success: false, message: 'Please provide a query or emotion' });
    }

    const userMessage = query
      ? `The user says: "${query}"${emotion ? `. They also selected the emotion: "${emotion}"` : ''}`
      : `The user selected the emotion: "${emotion}" but did not write a detailed message.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',   // Groq's fastest + smartest model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.75,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, data: parsed });

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
