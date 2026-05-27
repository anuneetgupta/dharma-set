const { sequelize } = require('./server/config/db');
const Payment = require('./server/models/Payment');
const CourseEnrollment = require('./server/models/CourseEnrollment');

async function test() {
  await sequelize.authenticate();
  
  // create dummy payment
  const payment = await Payment.create({
    courseId: 'test-course',
    courseTitle: 'Test Course',
    amount: 100,
    buyerName: 'Test Buyer',
    buyerEmail: 'test@example.com',
    buyerPhone: '1234567890',
    paymentMethod: 'card',
    status: 'pending'
  });

  // create dummy enrollment
  const enrollment = await CourseEnrollment.create({
    courseId: 'test-course',
    courseTitle: 'Test Course',
    coursePrice: 100,
    paymentId: payment.id,
    status: 'pending'
  });

  console.log('Before update:');
  console.log('Payment status:', payment.status);
  console.log('Enrollment status:', enrollment.status);

  // simulate admin update
  await CourseEnrollment.update(
    { status: 'confirmed' },
    { where: { paymentId: payment.id } }
  );

  const updatedEnrollment = await CourseEnrollment.findByPk(enrollment.id);
  
  console.log('After update:');
  console.log('Enrollment status:', updatedEnrollment.status);
  
  await payment.destroy();
  await enrollment.destroy();
  process.exit();
}

test().catch(console.error);
