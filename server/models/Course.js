const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  thumbnail: {
    type: DataTypes.STRING, // URL to cloudinary or local
  },
  videos: {
    type: DataTypes.JSON, // Array of video URLs
    defaultValue: [],
  },
  pdfs: {
    type: DataTypes.JSON, // Array of PDF URLs
    defaultValue: [],
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = Course;
