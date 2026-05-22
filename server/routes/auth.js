const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

// ── Token helpers ─────────────────────────────────────────────────────────
const generateToken = (id) => {
  // JWT_SECRET is guaranteed to be set (server/index.js fails fast otherwise)
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);
  res.status(statusCode).json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, avatarChosen: user.avatarChosen, role: user.role, token },
  });
};

// ── Validation rules ──────────────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return null;
};

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', registerRules, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { name, email, password, language_preference } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, language_preference });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('[Auth] Register error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', loginRules, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: { id: req.user.id, name: req.user.name, email: req.user.email, avatar: req.user.avatar, avatarChosen: req.user.avatarChosen, role: req.user.role },
  });
});

// @desc    Update user avatar
// @route   PATCH /api/auth/avatar
router.patch('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ success: false, message: 'Avatar URL is required' });

    await req.user.update({ avatar, avatarChosen: true });

    res.json({
      success: true,
      data: { avatar: req.user.avatar, avatarChosen: req.user.avatarChosen },
    });
  } catch (error) {
    console.error('[Auth] Avatar update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update avatar' });
  }
});

// ── OAuth Social Auth ─────────────────────────────────────────────────────
// SECURITY NOTE: The token is currently passed as a URL query param which
// exposes it in browser history and server logs. TODO: Replace with a
// short-lived one-time code that the frontend exchanges for the JWT server-side.
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const handleSocialAuthCallback = (req, res) => {
  const token = generateToken(req.user.id);
  res.redirect(`${CLIENT_URL}/auth?token=${token}`);
};

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=google_auth_failed` }),
  handleSocialAuthCallback
);

// Facebook
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=facebook_auth_failed` }),
  handleSocialAuthCallback
);

// Instagram
router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/callback',
  passport.authenticate('instagram', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=instagram_auth_failed` }),
  handleSocialAuthCallback
);

module.exports = router;
