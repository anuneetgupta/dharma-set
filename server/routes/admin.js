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
const CourseEnrollment = require('../models/CourseEnrollment');
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

// ── Payment Management ──────────────────────────────────────────────────────

// GET all payments with optional status filter
// GET /api/admin/payments?status=pending|completed|failed
router.get('/payments', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      where.status = status;
    }

    const payments = await Payment.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Admin payments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/admin/payments/:id/confirm — Admin confirms payment
router.patch('/payments/:id/confirm', async (req, res) => {
  try {
    const { adminNote } = req.body;
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payment is already ${payment.status}` });
    }

    let finalUserId = payment.userId;
    if (!finalUserId && payment.buyerEmail) {
      const user = await User.findOne({ where: { email: payment.buyerEmail } });
      if (user) {
        finalUserId = user.id;
      }
    }

    await payment.update({ status: 'completed', adminNote: adminNote || '', userId: finalUserId });

    // Update matching enrollment
    const enrollmentUpdate = { status: 'confirmed' };
    if (finalUserId) {
      enrollmentUpdate.userId = finalUserId;
    }
    await CourseEnrollment.update(
      enrollmentUpdate,
      { where: { paymentId: payment.id } }
    );

    res.json({ success: true, message: 'Payment confirmed. Course unlocked for user.', data: payment });
  } catch (error) {
    console.error('Admin confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/admin/payments/:id/reject — Admin rejects payment
router.patch('/payments/:id/reject', async (req, res) => {
  try {
    const { adminNote } = req.body;
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Payment is already ${payment.status}` });
    }

    await payment.update({ status: 'failed', adminNote: adminNote || '' });

    await CourseEnrollment.update(
      { status: 'rejected' },
      { where: { paymentId: payment.id } }
    );

    res.json({ success: true, message: 'Payment rejected.', data: payment });
  } catch (error) {
    console.error('Admin reject payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
