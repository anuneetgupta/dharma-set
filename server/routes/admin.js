const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const HomepageSetting = require('../models/HomepageSetting');
const Announcement = require('../models/Announcement');
const Payment = require('../models/Payment');
const SiteSetting = require('../models/SiteSetting');
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

module.exports = router;
