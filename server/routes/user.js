const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Update user avatar
// @route   PATCH /api/user/avatar
router.patch('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ success: false, message: 'Avatar URL is required' });

    await req.user.update({ avatar, avatarChosen: true });
    await req.user.reload();

    res.json({
      success: true,
      data: { avatar: req.user.avatar, avatarChosen: req.user.avatarChosen },
    });
  } catch (error) {
    console.error('[User] Avatar update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update avatar' });
  }
});

module.exports = router;
