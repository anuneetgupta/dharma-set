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
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium || false,
      premiumChatsRemaining: user.premiumChatsRemaining || 0,
      token,
    },
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

    // Link any previous guest purchases made with this email to the new account
    const Payment = require('../models/Payment');
    const CourseEnrollment = require('../models/CourseEnrollment');
    
    await Payment.update({ userId: user.id }, { where: { buyerEmail: email, userId: null } });
    
    // For CourseEnrollments, they don't have buyerEmail directly. But we can update enrollments
    // where paymentId is in the list of payments we just updated, or simply find all payments by this user.
    const userPayments = await Payment.findAll({ where: { userId: user.id }, attributes: ['id'] });
    const paymentIds = userPayments.map(p => p.id);
    if (paymentIds.length > 0) {
      await CourseEnrollment.update({ userId: user.id }, { where: { paymentId: paymentIds, userId: null } });
    }

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

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
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
  // Parse interests JSON if stored as text
  let interests = null;
  if (req.user.interests) {
    try { interests = JSON.parse(req.user.interests); } catch { interests = req.user.interests; }
  }

  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isPremium: req.user.isPremium || false,
      premiumChatsRemaining: req.user.premiumChatsRemaining || 0,
      createdAt: req.user.createdAt,
      // Spiritual preferences
      preferredLanguage: req.user.preferredLanguage || 'en',
      spiritualPath: req.user.spiritualPath || null,
      interests,
      favoriteDeity: req.user.favoriteDeity || null,
      preferredScripture: req.user.preferredScripture || null,
      meditationLevel: req.user.meditationLevel || 'beginner',
    },
  });
});

// @desc    Update spiritual preferences
// @route   PATCH /api/auth/preferences
router.patch('/preferences', protect, async (req, res) => {
  try {
    const allowedFields = ['preferredLanguage', 'spiritualPath', 'interests', 'favoriteDeity', 'preferredScripture', 'meditationLevel'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'interests' && Array.isArray(req.body[field])) {
          updates[field] = JSON.stringify(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid preference fields provided.' });
    }

    await req.user.update(updates);

    // Parse interests back for response
    let interests = null;
    if (req.user.interests) {
      try { interests = JSON.parse(req.user.interests); } catch { interests = req.user.interests; }
    }

    res.json({
      success: true,
      message: 'Preferences updated.',
      data: {
        preferredLanguage: req.user.preferredLanguage,
        spiritualPath: req.user.spiritualPath,
        interests,
        favoriteDeity: req.user.favoriteDeity,
        preferredScripture: req.user.preferredScripture,
        meditationLevel: req.user.meditationLevel,
      },
    });
  } catch (error) {
    console.error('[Auth] Update preferences error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update preferences.' });
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
