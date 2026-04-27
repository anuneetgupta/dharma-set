const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
      trim: true,
      maxlength: [5000, 'Journal entry cannot exceed 5000 characters'],
    },
    ai_response: {
      // Stores the full AI reflection object
      acknowledgment: String,
      reflection: String,
      question: String,
      shloka: {
        chapter: Number,
        verse: Number,
        sanskrit: String,
        transliteration: String,
        meaning: String,
        explanation: String,
        practicalAdvice: String,
        emotions: [String],
      },
    },
    detected_emotion: {
      type: String,
      default: 'confusion',
    },
  },
  { timestamps: true }
);

// Index for efficient user-specific queries
JournalSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', JournalSchema);
