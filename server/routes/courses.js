const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const CourseEnrollment = require('../models/CourseEnrollment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendPaymentOtpEmail } = require('../utils/mailer');

// ── In-memory OTP store (dev/demo — replace with Redis in production) ──────
// Structure: { [sessionKey]: { otp, expiresAt, verified } }
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Helper: get or create a purchase session key ──────────────────────────
const sessionKey = (type, contact) => `${type}:${contact.toLowerCase()}`;

// ─────────────────────────────────────────────────────────────────────────────
// OTP — Send Email OTP
// POST /api/courses/otp/send-email
// ─────────────────────────────────────────────────────────────────────────────
router.post('/otp/send-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const otp = generateOTP();
    const key = sessionKey('email', email);
    otpStore.set(key, { otp, expiresAt: Date.now() + OTP_TTL_MS, verified: false });

    // Send real OTP email via Nodemailer
    try {
      await sendPaymentOtpEmail({ to: email, userName: email, otp, courseTitle: req.body.courseTitle || 'your course' });
    } catch (mailErr) {
      console.error('OTP email send error:', mailErr.message);
      // In dev, still return devOtp so you can test without SMTP configured
    }
    console.log(`\n📧 [OTP] Email OTP for ${email}: ${otp}  (expires in 5 min)\n`);

    res.json({
      success: true,
      message: 'OTP sent to your email address',
      // In development, return OTP so frontend can show it (remove in production!)
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (err) {
    console.error('OTP send-email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// OTP — Verify Email OTP
// POST /api/courses/otp/verify-email
// ─────────────────────────────────────────────────────────────────────────────
router.post('/otp/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const key = sessionKey('email', email);
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    record.verified = true;
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('OTP verify-email error:', err);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// OTP — Send Phone OTP
// POST /api/courses/otp/send-phone
// ─────────────────────────────────────────────────────────────────────────────
router.post('/otp/send-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit Indian mobile number is required' });
    }

    const otp = generateOTP();
    const key = sessionKey('phone', phone);
    otpStore.set(key, { otp, expiresAt: Date.now() + OTP_TTL_MS, verified: false });

    // TODO: Replace with real SMS sender (Twilio / MSG91)
    console.log(`\n📱 [OTP] Phone OTP for ${phone}: ${otp}  (expires in 5 min)\n`);

    res.json({
      success: true,
      message: 'OTP sent to your mobile number',
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (err) {
    console.error('OTP send-phone error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// OTP — Verify Phone OTP
// POST /api/courses/otp/verify-phone
// ─────────────────────────────────────────────────────────────────────────────
router.post('/otp/verify-phone', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const key = sessionKey('phone', phone);
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    record.verified = true;
    res.json({ success: true, message: 'Phone number verified successfully' });
  } catch (err) {
    console.error('OTP verify-phone error:', err);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Purchase — Submit Payment
// POST /api/courses/purchase
// Body: { courseId, courseTitle, coursePrice, buyerName, buyerEmail, buyerPhone,
//         paymentMethod, paymentDetails }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/purchase', async (req, res) => {
  try {
    const {
      courseId,
      courseTitle,
      coursePrice,
      buyerName,
      buyerEmail,
      buyerPhone,
      paymentMethod,
      paymentDetails = {},
    } = req.body;

    // Validate required fields
    if (!courseId || !courseTitle || !buyerName || !buyerEmail || !buyerPhone || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // ── Enforce email OTP verification ──────────────────────────────────────
    const emailKey = sessionKey('email', buyerEmail);
    const emailRecord = otpStore.get(emailKey);
    if (!emailRecord || !emailRecord.verified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please complete OTP verification before submitting payment.',
      });
    }
    // Consume the verified session so it can't be reused
    otpStore.delete(emailKey);



    // Sanitize payment details — never store full card number
    const safePaymentDetails = {};
    if (paymentMethod === 'card') {
      safePaymentDetails.cardLast4 = (paymentDetails.cardNumber || '').replace(/\s/g, '').slice(-4);
      safePaymentDetails.cardHolder = paymentDetails.cardHolder || '';
      safePaymentDetails.expiry = paymentDetails.expiry || '';
      // CVV is intentionally NOT stored
    } else if (paymentMethod === 'upi') {
      safePaymentDetails.upiId = paymentDetails.upiId || '';
    }

    // Determine userId if user is authenticated (optional — token may not be present)
    let userId = null;
    try {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        userId = decoded.id;
      }
    } catch (_) { /* guest purchase — no userId from token */ }

    // If not authenticated, check if user exists by email and link it anyway
    if (!userId && buyerEmail) {
      const user = await User.findOne({ where: { email: buyerEmail } });
      if (user) {
        userId = user.id;
      }
    }

    // Create Payment record
    const payment = await Payment.create({
      userId,
      courseId,
      courseTitle,
      amount: parseFloat(coursePrice) || 0,
      buyerName,
      buyerEmail,
      buyerPhone,
      paymentMethod,
      paymentDetails: safePaymentDetails,
      status: 'pending',
      transactionId: `TXN-${uuidv4().split('-')[0].toUpperCase()}`,
      itemDetails: { courseId, courseTitle, price: coursePrice },
    });

    // Create Enrollment record
    await CourseEnrollment.create({
      userId,
      courseId,
      courseTitle,
      coursePrice: parseFloat(coursePrice) || 0,
      paymentId: payment.id,
      status: 'pending',
    });



    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully. Awaiting admin confirmation.',
      data: {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        status: 'pending',
      },
    });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ success: false, message: 'Purchase failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/courses/my-enrollments  — logged-in user's enrolled courses
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-enrollments', protect, async (req, res) => {
  try {
    // Auto-link any legacy orphaned purchases made with this email
    const orphanedPayments = await Payment.findAll({
      where: { buyerEmail: req.user.email, userId: null },
      attributes: ['id']
    });
    
    if (orphanedPayments.length > 0) {
      const paymentIds = orphanedPayments.map(p => p.id);
      await Payment.update({ userId: req.user.id }, { where: { id: paymentIds } });
    }

    // Also ensure all enrollments linked to the user's payments have the correct userId
    // This catches edge cases where the payment was linked but the enrollment was missed
    const allUserPayments = await Payment.findAll({
      where: { userId: req.user.id },
      attributes: ['id']
    });
    
    if (allUserPayments.length > 0) {
      const allPaymentIds = allUserPayments.map(p => p.id);
      await CourseEnrollment.update(
        { userId: req.user.id }, 
        { where: { paymentId: allPaymentIds, userId: null } }
      );
    }

    const enrollments = await CourseEnrollment.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: enrollments });
  } catch (err) {
    console.error('My enrollments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
  }
});

module.exports = router;
