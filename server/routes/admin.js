const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const HomepageSetting = require('../models/HomepageSetting');
const Announcement = require('../models/Announcement');
const Payment = require('../models/Payment');
const SiteSetting = require('../models/SiteSetting');
const JournalEntry = require('../models/JournalEntry');
const { sequelize } = require('../config/db');

// Apply protection to all admin routes
router.use(protect, isAdmin);

// ── Dashboard Overview ──
router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    
    // Sum total revenue
    const payments = await Payment.findAll({ where: { status: 'completed' }});
    const totalRevenue = payments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    // Recent activity (Last 5 users)
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'createdAt'],
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalRevenue,
        recentUsers,
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Users Management ──
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Journal Moderation ──
// GET all pending journals for admin review
router.get('/journals', async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Admin journals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH approve or reject a journal
router.patch('/journals/:id', async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    const entry = await JournalEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await entry.update({ status: action === 'approve' ? 'approved' : 'rejected' });
    res.json({ success: true, data: entry });
  } catch (error) {
    console.error('Admin journal action error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
