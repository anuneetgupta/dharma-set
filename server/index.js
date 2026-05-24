require('dotenv').config();

// ── Startup env guard ──────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('❌  FATAL: JWT_SECRET is not set in .env — refusing to start.');
  process.exit(1);
}

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB, sequelize } = require('./config/db');
const passport = require('passport');
require('./config/passport'); // Load passport config
require('./models/JournalEntry'); // Ensure model is registered for sync

const app = express();
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────
app.use(helmet());

// Connect to Database and sync models
connectDB().then(() => {
  sequelize.sync({ alter: true }).then(() => console.log('✅ Database models synced'));
});

// ── CORS ─────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (no Origin header) & whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again later.' },
});

const guidanceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many guidance requests — slow down a little 🙏' },
});

// ── Body Parser ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(passport.initialize());

// ── Routes ──────────────────────────────────────────────────────────────
app.use('/api/guidance', guidanceLimiter, require('./routes/guidance'));

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Narayan Narayan! Too many questions, please slow down.' },
});
app.use('/api/chatbot', chatbotLimiter, require('./routes/chatbot'));

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/journal', require('./routes/journal'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🙏 Dharma Setu API is running',
    openai: !!process.env.GROQ_API_KEY,
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
  console.log(`🤖 Groq key: ${process.env.GROQ_API_KEY ? '✅ set' : '❌ missing — set GROQ_API_KEY in .env'}\n`);
});
