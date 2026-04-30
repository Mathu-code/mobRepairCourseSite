import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/database';
import User, { UserRole } from '../models/User';

const createInstructorUser = async () => {
  try {
    await connectDB();
    console.log('✅ Database connection established');

    const instructorEmail = (process.env.INSTRUCTOR_EMAIL || '').toString().trim().toLowerCase();
    const instructorPassword = (process.env.INSTRUCTOR_PASSWORD || '').toString();

    if (!instructorEmail || !instructorPassword) {
      console.error('❌ INSTRUCTOR_EMAIL and INSTRUCTOR_PASSWORD must be set in .env');
      process.exit(1);
    }

    // Check if instructor already exists
    const existingUser = await User.findOne({ email: instructorEmail });
    if (existingUser) {
      console.log(`⚠️  User already exists: ${instructorEmail}`);
      process.exit(0);
    }

    const instructor = await User.create({
      email: instructorEmail,
      password: instructorPassword,
      firstName: 'Instructor',
      lastName: 'Instructor',
      role: UserRole.INSTRUCTOR,
      isActive: true
    });

    console.log(`✅ Instructor created successfully`);
    console.log(`   Email: ${instructor.email}`);
    console.log(`   Role: ${instructor.role}`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating instructor:', error.message);
    process.exit(1);
  }
};

createInstructorUser();