require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/guidance', require('./routes/guidance'));
app.use('/api/journal', require('./routes/journal'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Dharma Setu API is running 🙏', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Dharma Setu server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
