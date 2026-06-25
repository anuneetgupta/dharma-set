const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Optional for social login
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  instagramId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  language_preference: {
    type: DataTypes.STRING,
    defaultValue: 'en',
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  // ── AI Guidance freemium fields ──────────────────────────────────────────
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  premiumChatsRemaining: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  guidanceFreeUsedToday: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  guidanceLastResetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  // ── Spiritual preferences (for AI personalization) ──────────────────────
  preferredLanguage: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
  },
  spiritualPath: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  interests: {
    type: DataTypes.TEXT, // JSON array stored as text, e.g. '["meditation","gita-study"]'
    allowNull: true,
  },
  favoriteDeity: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  preferredScripture: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  meditationLevel: {
    type: DataTypes.STRING(20),
    defaultValue: 'beginner',
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
