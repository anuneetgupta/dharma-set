const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const JournalEntry = sequelize.define('JournalEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  reflection: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  // 'private' = only visible to the user
  // 'pending'  = user submitted for public approval
  // 'approved' = admin approved, visible to everyone
  // 'rejected' = admin rejected
  status: {
    type: DataTypes.ENUM('private', 'pending', 'approved', 'rejected'),
    defaultValue: 'private',
    allowNull: false,
  },
}, {
  timestamps: true,
});

User.hasMany(JournalEntry, { foreignKey: 'userId', as: 'journalEntries' });
JournalEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = JournalEntry;
