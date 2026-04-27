const express = require('express');
const OpenAI = require('openai');
const Journal = require('../models/Journal');
const { protect } = require('../middleware/auth');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Journal reflection system prompt
const JOURNAL_SYSTEM_PROMPT = `You are Dharma Setu, a warm and wise journaling companion who gently reflects a person's thoughts back through the lens of ancient Indian wisdom.

Respond ONLY with valid JSON in this exact structure:
{
  "acknowledgment": "1-2 sentence empathetic opening that shows you truly read and understood their entry",
  "detectedEmotion": "one word emotion",
  "reflection": "2-3 sentences connecting their journal entry to a relevant philosophical insight — logical, not preachy",
  "shloka": {
    "chapter": <number>,
    "verse": <number>,
    "sanskrit": "Sanskrit text",
    "transliteration": "Roman transliteration",
    "meaning": "Clear English meaning",
    "explanation": "Why this verse speaks to what they wrote",
    "practicalAdvice": "One gentle, specific action step",
    "emotions": ["emotion1"]
  },
  "question": "A single, thoughtful open-ended question to help them reflect deeper — not rhetorical"
}`;

// @route  POST /api/journal
// @desc   Create a new journal entry with AI reflection
// @access Protected
router.post('/', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Journal entry must be at least 10 characters' });
    }

    // Get AI reflection from OpenAI
    let ai_response = null;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: JOURNAL_SYSTEM_PROMPT },
          { role: 'user', content: `Journal entry: "${content}"` },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 900,
        temperature: 0.7,
      });
      ai_response = JSON.parse(completion.choices[0].message.content);
    } catch (aiErr) {
      console.error('OpenAI journal error:', aiErr.message);
      // Entry still saved even if AI fails
    }

    const entry = await Journal.create({
      user_id: req.user._id,
      content,
      ai_response,
      detected_emotion: ai_response?.detectedEmotion || 'unknown',
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error('Journal POST error:', err);
    res.status(500).json({ success: false, message: 'Error saving journal entry' });
  }
});

// @route  GET /api/journal
// @desc   Get all journal entries for current user
// @access Protected
router.get('/', protect, async (req, res) => {
  try {
    const entries = await Journal.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    console.error('Journal GET error:', err);
    res.status(500).json({ success: false, message: 'Error fetching journal entries' });
  }
});

// @route  DELETE /api/journal/:id
// @desc   Delete a journal entry
// @access Protected
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    await entry.deleteOne();
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    console.error('Journal DELETE error:', err);
    res.status(500).json({ success: false, message: 'Error deleting entry' });
  }
});

module.exports = router;
