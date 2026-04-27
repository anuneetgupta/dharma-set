const express = require('express');
const OpenAI = require('openai');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The spiritual system prompt — controls tone and structure
const SYSTEM_PROMPT = `You are Dharma Setu, a compassionate and wise spiritual guide who draws from the Bhagavad Gita, Ramayana, and Mahabharata.

Your personality:
- You are warm and empathetic, never preachy or judgmental
- You speak like a wise friend who happens to know ancient scriptures deeply
- You make ancient wisdom feel logical, modern, and actionable — never superstitious
- You validate emotions before offering wisdom
- You always give practical, grounded advice alongside spiritual insight

You MUST respond ONLY with valid JSON in this exact structure (no extra text outside the JSON):
{
  "greeting": "A warm, empathetic 1-2 sentence opening that acknowledges the person's feeling",
  "detectedEmotion": "one of: anxiety, confusion, anger, grief, fear, hopelessness, loneliness, overwhelmed, purpose, failure, betrayal, loss, self-doubt",
  "reflection": "2-3 sentences connecting their situation to the wisdom tradition in a non-preachy, logical way",
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
    "title": "Name of the story/scene",
    "scripture": "Mahabharata or Ramayana or Bhagavad Gita",
    "character": "Main character",
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
// @desc   Get AI spiritual guidance (OpenAI GPT-4o)
// @access Public (auth optional — future: personalize for logged-in users)
router.post('/', async (req, res) => {
  try {
    const { query, emotion } = req.body;

    if (!query && !emotion) {
      return res.status(400).json({ success: false, message: 'Please provide a query or emotion' });
    }

    const userMessage = query
      ? `The user says: "${query}"${emotion ? ` They also selected the emotion: "${emotion}"` : ''}`
      : `The user selected the emotion: "${emotion}" but did not write a detailed query.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.75,
    });

    const rawContent = completion.choices[0].message.content;
    const parsed = JSON.parse(rawContent);

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Guidance API error:', err);

    // If OpenAI key is missing or quota exceeded
    if (err?.status === 401) {
      return res.status(503).json({ success: false, message: 'AI service temporarily unavailable — invalid API key' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ success: false, message: 'AI service is at capacity, please try again shortly' });
    }

    res.status(500).json({ success: false, message: 'Error generating spiritual guidance' });
  }
});

module.exports = router;
