const { connectDB, sequelize } = require('./config/db');
const User = require('./models/User');

const checkUser = async () => {
  await connectDB();
  
  try {
    const user = await User.findOne({ where: { email: 'admin@dharmaset.com' } });
    if (!user) {
      console.log('User not found!');
    } else {
      console.log('User found:', user.email);
      console.log('Hashed Password:', user.password);
      const isMatch = await user.matchPassword('adminpassword');
      console.log('matchPassword("adminpassword") returned:', isMatch);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

checkUser();
