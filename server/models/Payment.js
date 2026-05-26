const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // nullable: guest purchases possible
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseTitle: {
    type: DataTypes.STRING,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Buyer contact details (collected at purchase time)
  buyerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  buyerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  buyerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Payment method
  paymentMethod: {
    type: DataTypes.ENUM('card', 'upi'),
    allowNull: false,
    defaultValue: 'card',
  },
  // Masked/safe payment details (no full card numbers stored)
  paymentDetails: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  transactionId: {
    type: DataTypes.STRING,
  },
  itemDetails: {
    type: DataTypes.JSON, // e.g., course details snapshot
  },
  adminNote: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = Payment;
