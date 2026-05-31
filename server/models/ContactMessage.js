const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // null for guests, linked when user is logged in
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'General Inquiry',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('unread', 'read', 'replied'),
    defaultValue: 'unread',
  },
  adminReply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = ContactMessage;
