const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');

// @desc    Get all APPROVED journals (public wall - no auth needed)
// @route   GET /api/journal/public
router.get('/public', async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { status: 'approved' },
      order: [['updatedAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name'],
      }],
    });

    // Mask author name for anonymous entries
    const sanitized = entries.map(e => {
      const plain = e.toJSON();
      if (plain.isAnonymous && plain.user) {
        plain.user = { name: 'A Seeker' };
      }
      return plain;
    });

    res.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('[Journal] Public fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch public journals' });
  }
});

// @desc    Get all journal entries for logged-in user
// @route   GET /api/journal
router.get('/', protect, async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('[Journal] Fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch journal entries' });
  }
});

// @desc    Create a new journal entry
// @route   POST /api/journal
router.post('/', protect, async (req, res) => {
  try {
    const { title, text, reflection } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Journal text is required' });
    }
    const entry = await JournalEntry.create({
      userId: req.user.id,
      title: title ? title.trim() : null,
      text: text.trim(),
      reflection: reflection || null,
      status: 'private',
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error('[Journal] Create error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to save journal entry' });
  }
});

// @desc    Submit a journal entry for public approval
// @route   PATCH /api/journal/:id/submit
router.patch('/:id/submit', protect, async (req, res) => {
  try {
    const { isAnonymous } = req.body;
    const entry = await JournalEntry.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    if (entry.status !== 'private' && entry.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Entry is already submitted or approved' });
    }

    const updates = { status: 'pending', rejectionReason: null };
    if (typeof isAnonymous === 'boolean') {
      updates.isAnonymous = isAnonymous;
    }
    await entry.update(updates);

    res.json({
      success: true,
      message: 'Your journal has been submitted for review.',
      data: entry,
    });
  } catch (error) {
    console.error('[Journal] Submit error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit journal entry' });
  }
});

// @desc    Delete a journal entry
// @route   DELETE /api/journal/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    await entry.destroy();
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    console.error('[Journal] Delete error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete entry' });
  }
});

module.exports = router;
