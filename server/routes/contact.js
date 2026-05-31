const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');

// ── Optional auth — attaches req.user if a valid JWT is present, else continues as guest ──
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
    }
  } catch {
    // Invalid / expired token — continue as guest
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/contact — submit a contact message (public, userId attached if logged in)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const contact = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject || 'General Inquiry',
      message: message.trim(),
      userId: req.user ? req.user.id : null, // link to account when logged in
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon. 🙏',
      data: { id: contact.id },
    });
  } catch (err) {
    console.error('Contact submit error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/contact/my-messages — fetch logged-in user's own messages + admin replies
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-messages', optionalAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Please log in to view your messages.' });
  }

  try {
    const messages = await ContactMessage.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'subject', 'message', 'status', 'adminReply', 'repliedAt', 'createdAt'],
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('My messages error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

module.exports = router;
