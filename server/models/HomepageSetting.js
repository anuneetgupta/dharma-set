const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HomepageSetting = sequelize.define('HomepageSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // e.g., 'hero_title', 'faq_list'
  },
  value: {
    type: DataTypes.JSON, // JSON allows flexibility for text or arrays
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = HomepageSetting;
