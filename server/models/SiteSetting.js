const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SiteSetting = sequelize.define('SiteSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // e.g., 'logo_url', 'whatsapp_number', 'social_links'
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = SiteSetting;
