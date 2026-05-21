require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  const adminEmail = 'admin@dharmaset.com';
  
  try {
    let adminUser = await User.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      console.log(`Creating new admin user: ${adminEmail}`);
      adminUser = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'adminpassword', // IMPORTANT: change this after logging in or before deployment
        role: 'admin'
      });
      console.log('✅ Admin user created successfully.');
    } else {
      console.log(`Promoting existing user ${adminEmail} to admin.`);
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ User promoted to admin.');
    }

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    process.exit();
  }
};

seedAdmin();
