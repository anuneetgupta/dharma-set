import { sequelize } from './server/config/db.js';
import User from './server/models/User.js';
import Payment from './server/models/Payment.js';
import CourseEnrollment from './server/models/CourseEnrollment.js';

async function debugData() {
  await sequelize.authenticate();
  
  const email = 'guptaanuneet10june@gmail.com';
  console.log(`\n--- Debugging Data for ${email} ---\n`);

  const user = await User.findOne({ where: { email } });
  if (user) {
    console.log('USER RECORD FOUND:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
  } else {
    console.log('USER NOT FOUND IN DB');
  }

  const payments = await Payment.findAll({ where: { buyerEmail: email } });
  console.log('\nPAYMENTS:');
  payments.forEach(p => {
    console.log(`- Payment ID: ${p.id}, Status: ${p.status}, userId: ${p.userId}, Course: ${p.courseTitle}`);
  });

  // Also try to find enrollments by payment ID or userId
  const paymentIds = payments.map(p => p.id);
  let enrollments = [];
  if (paymentIds.length > 0) {
    enrollments = await CourseEnrollment.findAll({ where: { paymentId: paymentIds } });
  }

  console.log('\nENROLLMENTS (matched by paymentId):');
  enrollments.forEach(e => {
    console.log(`- Enrollment ID: ${e.id}, Status: ${e.status}, userId: ${e.userId}, Course: ${e.courseTitle}`);
  });

  const enrollmentsByUser = await CourseEnrollment.findAll({ where: { userId: user ? user.id : 'none' } });
  console.log('\nENROLLMENTS (matched by userId):');
  enrollmentsByUser.forEach(e => {
    console.log(`- Enrollment ID: ${e.id}, Status: ${e.status}, userId: ${e.userId}, Course: ${e.courseTitle}`);
  });

  process.exit();
}

debugData().catch(console.error);
