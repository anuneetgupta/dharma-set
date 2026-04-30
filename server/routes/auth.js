const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);
  res.status(statusCode).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token,
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language_preference } = req.body;
    
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = await User.create({ name, email, password, language_preference });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    }
  });
});

// Helper for social login redirects
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const handleSocialAuthCallback = (req, res) => {
  const token = generateToken(req.user.id);
  // Redirect back to frontend with token in query params
  res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
};

// @desc    Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google OAuth Callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=google_auth_failed` }),
  handleSocialAuthCallback
);

// @desc    Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// @desc    Facebook OAuth Callback
router.get('/facebook/callback', 
  passport.authenticate('facebook', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=facebook_auth_failed` }),
  handleSocialAuthCallback
);

// @desc    Twitter OAuth
router.get('/twitter', passport.authenticate('twitter'));

// @desc    Twitter OAuth Callback
router.get('/twitter/callback', 
  passport.authenticate('twitter', { session: false, failureRedirect: `${CLIENT_URL}/auth?error=twitter_auth_failed` }),
  handleSocialAuthCallback
);

module.exports = router;
