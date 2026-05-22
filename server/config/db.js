const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.DATABASE_URL;

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Automatically create tables based on models if they don't exist
    await sequelize.sync({ alter: true });
    console.log(`✅ ${isProduction ? 'PostgreSQL' : 'SQLite'} database connected and synced successfully.`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
