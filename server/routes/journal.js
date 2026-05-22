const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const JournalEntry = require('../models/JournalEntry');

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
    const { text, reflection } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Journal text is required' });
    }
    const entry = await JournalEntry.create({
      userId: req.user.id,
      text: text.trim(),
      reflection: reflection || null,
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error('[Journal] Create error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to save journal entry' });
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
