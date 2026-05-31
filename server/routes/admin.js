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
const ContactMessage = require('../models/ContactMessage');
const { sequelize } = require('../config/db');
const { getTransporter, sendContactReplyEmail, sendPaymentConfirmationEmail, sendPaymentRejectionEmail } = require('../utils/mailer');

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

    // Send confirmation email to buyer (non-blocking)
    sendPaymentConfirmationEmail({
      to: payment.buyerEmail,
      userName: payment.buyerName,
      courseTitle: payment.courseTitle,
      transactionId: payment.transactionId,
      amount: payment.amount,
    }).catch(err => console.error('Payment confirm email error (non-fatal):', err.message));

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

    // Send rejection email to buyer (non-blocking)
    sendPaymentRejectionEmail({
      to: payment.buyerEmail,
      userName: payment.buyerName,
      courseTitle: payment.courseTitle,
      adminNote: adminNote || '',
    }).catch(err => console.error('Payment reject email error (non-fatal):', err.message));

  } catch (error) {
    console.error('Admin reject payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Contact Messages ─────────────────────────────────────────────────────────

// GET /api/admin/contacts — list all contact messages
router.get('/contacts', async (req, res) => {
  try {
    const { status } = req.query; // optional: unread | read | replied
    const where = {};
    if (status && ['unread', 'read', 'replied'].includes(status)) where.status = status;

    const messages = await ContactMessage.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Admin contacts list error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/admin/contacts/:id/read — mark as read
router.patch('/contacts/:id/read', async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    if (msg.status === 'unread') await msg.update({ status: 'read' });
    res.json({ success: true, data: msg });
  } catch (err) {
    console.error('Admin mark read error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/contacts/:id/reply — save reply and/or email the user
router.post('/contacts/:id/reply', async (req, res) => {
  try {
    const { replyText, sendEmail = true, saveOnly = false } = req.body;
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text is required.' });
    }
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });

    // Save reply to DB unless admin chose email-only mode
    if (!saveOnly) {
      await msg.update({
        adminReply: replyText.trim(),
        repliedAt: new Date(),
        status: 'replied',
      });
    }

    // Send email — BLOCKING so we can report real errors back to admin
    let emailStatus = null;
    if (sendEmail) {
      try {
        await sendContactReplyEmail({
          to: msg.email,
          userName: msg.name,
          userMessage: msg.message,
          subject: msg.subject,
          replyText: replyText.trim(),
        });
        emailStatus = 'sent';
      } catch (mailErr) {
        console.error('Contact reply email FAILED:', mailErr.message);
        emailStatus = mailErr.message; // send real error back to frontend
      }
    }

    res.json({
      success: true,
      message: 'Reply handled.',
      emailStatus, // 'sent' | null | '<error message>'
      data: msg,
    });
  } catch (err) {
    console.error('Admin reply error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/test-email — verify SMTP is working (admin only)
router.get('/test-email', async (req, res) => {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    
    // Send a test email to the SMTP_USER itself
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: '✅ Dharma Setu — SMTP Test',
      text: 'SMTP is working correctly! This is a test email from your Dharma Setu admin panel.',
    });
    res.json({ success: true, message: `Test email sent to ${process.env.SMTP_USER}` });
  } catch (err) {
    console.error('SMTP test error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
