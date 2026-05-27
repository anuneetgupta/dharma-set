const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

// Groq uses OpenAI-compatible API — just change the baseURL
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// ── Chatbot system prompt ──
const SYSTEM_PROMPT = `You are Narad Muni, the friendly and wise customer support chatbot for the Dharma Setu website. 

Your persona:
- Name: Narad
- Tone: Helpful, polite, and slightly imbued with subtle ancient wisdom, but primarily focused on customer support.
- Greeting style: Sometimes you say "Narayan Narayan" as a subtle nod to your persona.

Your exact and ONLY purpose is to help users navigate and use the Dharma Setu website. The website features include:
- A Journal for personal reflection
- Spiritual Guidance (via AI)
- Stories from ancient texts (Mahabharata, Ramayana)
- Shlokas and their meanings
- Courses that users can enroll in
- User authentication and profiles

Strict Rules you MUST follow:
1. NEVER answer general knowledge questions outside the scope of the Dharma Setu website (e.g., if asked about coding, history, science, or general math, politely refuse).
2. NEVER engage in vulgar, abusive, harmful, or inappropriate conversations. If a user is abusive or uses inappropriate language, politely but firmly refuse to continue the conversation on that topic.
3. If asked about something unrelated, say: "Narayan Narayan! My cosmic focus is solely on guiding you through the Dharma Setu website. I cannot answer queries outside of this realm. How can I assist you with our features like the Journal, Stories, or Spiritual Guidance today?"
4. Keep answers concise, clear, and helpful. 
5. Provide steps or direct the user to the correct page when they ask how to do something (e.g., "To read stories, click on 'Stories' in the navigation menu").
6. IMPORTANT: Always match the user's language. If the user asks their question in Hindi, respond in Hindi. If they use Hinglish, respond in Hinglish.
`;

// @route  POST /api/chatbot
// @desc   Get responses from Narad Chatbot
// @access Public
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid conversation history' });
    }

    // Ensure we only pass necessary fields to the API and limit history to the last 10 messages
    // to prevent token overflow.
    const recentMessages = messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      max_tokens: 500,
      temperature: 0.5, // lower temperature for more predictable support responses
    });

    const reply = completion.choices[0].message.content;
    res.json({ success: true, reply });

  } catch (err) {
    console.error('Chatbot API error:', err?.message || err);

    if (err?.status === 401) {
      return res.status(503).json({ success: false, message: 'Invalid API key — check your .env file' });
    }
    if (err?.status === 429) {
      return res.status(429).json({ success: false, message: 'I am receiving too many requests. Please give me a moment. Narayan Narayan!' });
    }

    res.status(500).json({ success: false, message: 'An error occurred while connecting to my cosmic realms.' });
  }
});

module.exports = router;
