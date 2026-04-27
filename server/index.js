require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// ── Routes ──
app.use('/api/guidance', require('./routes/guidance'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🙏 Dharma Setu API is running',
    openai: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Dharma Setu server running on http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 OpenAI key: ${process.env.OPENAI_API_KEY ? '✅ set' : '❌ missing — set OPENAI_API_KEY in .env'}\n`);
});
