const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CourseEnrollment = sequelize.define('CourseEnrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.STRING, // matches course identifier (title slug or static id)
    allowNull: false,
  },
  paymentId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'rejected'),
    defaultValue: 'pending',
  },
  courseTitle: {
    type: DataTypes.STRING,
  },
  coursePrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  timestamps: true,
});

module.exports = CourseEnrollment;
