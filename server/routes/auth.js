const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route  POST /api/auth/register
// @desc   Register new user
// @access Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language_preference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, language_preference });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        language_preference: user.language_preference,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route  POST /api/auth/login
// @desc   Login and get token
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Include password for comparison (excluded by default via schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        language_preference: user.language_preference,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route  GET /api/auth/me
// @desc   Get current user
// @access Protected (used by frontend to validate stored token)
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = router;
