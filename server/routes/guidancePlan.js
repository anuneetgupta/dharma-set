const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

const FREE_DAILY_LIMIT = 5;

const PLANS = {
  '99':  { chats: 15, label: 'Seeker',   price: 99 },
  '199': { chats: 35, label: 'Devotee',  price: 199 },
};

// Helper — get today's date string 'YYYY-MM-DD'
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Helper — reset daily counter if date has changed
async function resetIfNewDay(user) {
  const today = todayStr();
  if (user.guidanceLastResetDate !== today) {
    user.guidanceFreeUsedToday = 0;
    user.guidanceLastResetDate = today;
    await user.save();
  }
}

// @route  GET /api/guidance-plan/status
// @desc   Return current user's guidance quota + premium status
// @access Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = req.user;
    await resetIfNewDay(user);

    const freeRemaining = Math.max(0, FREE_DAILY_LIMIT - (user.guidanceFreeUsedToday || 0));

    return res.json({
      success: true,
      data: {
        isPremium: user.isPremium,
        premiumChatsRemaining: user.premiumChatsRemaining || 0,
        freeChatsRemaining: freeRemaining,
        freeDailyLimit: FREE_DAILY_LIMIT,
      },
    });
  } catch (err) {
    console.error('Guidance-plan status error:', err?.message || err);
    return res.status(500).json({ success: false, message: 'Could not fetch plan status' });
  }
});

// @route  POST /api/guidance-plan/buy
// @desc   Simulate plan purchase — add premium chat credits
// @access Private
router.post('/buy', protect, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[String(planId)];

    if (!plan) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const user = req.user;

    // Add credits on top of any existing ones
    user.isPremium = true;
    user.premiumChatsRemaining = (user.premiumChatsRemaining || 0) + plan.chats;
    await user.save();

    return res.json({
      success: true,
      message: `🙏 Plan activated! You now have ${user.premiumChatsRemaining} guidance sessions available.`,
      data: {
        isPremium: user.isPremium,
        premiumChatsRemaining: user.premiumChatsRemaining,
        planLabel: plan.label,
        chatsAdded: plan.chats,
      },
    });
  } catch (err) {
    console.error('Guidance-plan buy error:', err?.message || err);
    return res.status(500).json({ success: false, message: 'Could not process plan purchase' });
  }
});

module.exports = router;
