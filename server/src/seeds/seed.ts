import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/database';
import { User, Category, Course, Note, Video, Enrollment, Purchase } from '../models';
import { UserRole } from '../models/User';
import { CourseStatus, CourseLevel } from '../models/Course';
import { NoteStatus } from '../models/Note';

// Import models to set up associations
import '../models/index';

const seedDatabase = async () => {
  try {
    console.log('🔄 Starting database seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database (force: true will drop existing tables - use with caution!)
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');

    // Create Admin User
    const admin = await User.create({
      email: 'admin@mobrepairhouse.com',
      password: 'Admin@123',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      bio: 'System Administrator for MobRepairHouse',
      isActive: true
    });
    console.log('✅ Admin user created:', admin.email);

    // Create Instructor Users
    const instructor1 = await User.create({
      email: 'instructor1@mobrepairhouse.com',
      password: 'Instructor@123',
      firstName: 'John',
      lastName: 'Smith',
      role: UserRole.INSTRUCTOR,
      bio: 'Expert mobile repair technician with 10+ years of experience in iPhone and Samsung repairs.',
      phone: '+1234567890',
      isActive: true
    });
    console.log('✅ Instructor 1 created:', instructor1.email);

    const instructor2 = await User.create({
      email: 'instructor2@mobrepairhouse.com',
      password: 'Instructor@123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.INSTRUCTOR,
      bio: 'Certified electronics technician specializing in motherboard repairs and data recovery.',
      phone: '+0987654321',
      isActive: true
    });
    console.log('✅ Instructor 2 created:', instructor2.email);

    const instructor3 = await User.create({
      email: 'instructor3@mobrepairhouse.com',
      password: 'Instructor@123',
      firstName: 'Mike',
      lastName: 'Williams',
      role: UserRole.INSTRUCTOR,
      bio: 'Software and firmware specialist with expertise in unlocking and flashing mobile devices.',
      phone: '+1122334455',
      isActive: true
    });
    console.log('✅ Instructor 3 created:', instructor3.email);

    // Create Sample Student
    const student = await User.create({
      email: 'student@example.com',
      password: 'Student@123',
      firstName: 'Demo',
      lastName: 'Student',
      role: UserRole.STUDENT,
      bio: 'Aspiring mobile repair technician',
      isActive: true
    });
    console.log('✅ Sample student created:', student.email);

    // Create Categories
    const categories = await Category.bulkCreate([
      { name: 'iPhone Repair', slug: 'iphone-repair', description: 'All iPhone repair courses and notes', icon: 'smartphone' },
      { name: 'Samsung Repair', slug: 'samsung-repair', description: 'Samsung device repair guides', icon: 'smartphone' },
      { name: 'Screen Replacement', slug: 'screen-replacement', description: 'Screen replacement tutorials', icon: 'monitor' },
      { name: 'Battery Replacement', slug: 'battery-replacement', description: 'Battery replacement guides', icon: 'battery' },
      { name: 'Motherboard Repair', slug: 'motherboard-repair', description: 'Advanced motherboard repair', icon: 'cpu' },
      { name: 'Software & Firmware', slug: 'software-firmware', description: 'Software and firmware solutions', icon: 'code' },
      { name: 'Data Recovery', slug: 'data-recovery', description: 'Data recovery techniques', icon: 'database' },
      { name: 'Tools & Equipment', slug: 'tools-equipment', description: 'Tools and equipment guides', icon: 'tool' }
    ]);
    console.log('✅ Categories created:', categories.length);

    // Create Sample Courses
    const course1 = await Course.create({
      title: 'Complete iPhone Screen Replacement Guide',
      description: 'Learn how to replace iPhone screens from iPhone 6 to iPhone 14. This comprehensive course covers all the tools, techniques, and troubleshooting methods you need to master iPhone screen replacement.',
      shortDescription: 'Master iPhone screen replacement from beginner to expert level.',
      price: 49.99,
      discountPrice: 39.99,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
      level: CourseLevel.BEGINNER,
      status: CourseStatus.PUBLISHED,
      duration: 480,
      totalLessons: 12,
      requirements: 'Basic understanding of electronics\nPhone repair toolkit\nPractice devices recommended',
      whatYouWillLearn: 'Replace screens on any iPhone model\nProper disassembly techniques\nHandling fragile components\nQuality testing after repair'
    });
    console.log('✅ Course 1 created:', course1.title);

    const course2 = await Course.create({
      title: 'Samsung Battery Replacement Masterclass',
      description: 'Complete guide to replacing batteries in Samsung Galaxy devices. Learn safe removal techniques, battery selection, and post-replacement testing.',
      shortDescription: 'Learn professional Samsung battery replacement techniques.',
      price: 39.99,
      instructorId: instructor2.id,
      categoryId: categories[1].id,
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      duration: 300,
      totalLessons: 8,
      requirements: 'Basic phone repair knowledge\nHeat gun or hot plate\nSamsung repair toolkit',
      whatYouWillLearn: 'Safe battery removal techniques\nAdhesive application methods\nBattery calibration\nSafety precautions'
    });
    console.log('✅ Course 2 created:', course2.title);

    const course3 = await Course.create({
      title: 'Advanced Motherboard Micro-soldering',
      description: 'Master the art of micro-soldering for motherboard repairs. This advanced course covers component level diagnosis, soldering techniques, and complex repairs.',
      shortDescription: 'Advanced micro-soldering techniques for motherboard repairs.',
      price: 149.99,
      discountPrice: 129.99,
      instructorId: instructor1.id,
      categoryId: categories[4].id,
      level: CourseLevel.ADVANCED,
      status: CourseStatus.PUBLISHED,
      duration: 720,
      totalLessons: 20,
      requirements: 'Prior phone repair experience\nMicro-soldering station\nMicroscope\nBasic electronics knowledge',
      whatYouWillLearn: 'Component level diagnosis\nMicro-soldering techniques\nBGA reballing\nBoard level troubleshooting'
    });
    console.log('✅ Course 3 created:', course3.title);

    // Create Sample Videos for Course 1
    const videos = await Video.bulkCreate([
      {
        title: 'Introduction to iPhone Screen Replacement',
        description: 'Overview of tools and workspace setup for iPhone screen replacement.',
        videoUrl: '/uploads/videos/sample-intro.mp4',
        courseId: course1.id,
        order: 1,
        duration: 600,
        isFree: true
      },
      {
        title: 'Understanding iPhone Display Components',
        description: 'Learn about LCD, OLED, and digitizer components.',
        videoUrl: '/uploads/videos/sample-components.mp4',
        courseId: course1.id,
        order: 2,
        duration: 900,
        isFree: false
      },
      {
        title: 'iPhone 12 Screen Replacement Step by Step',
        description: 'Complete walkthrough of iPhone 12 screen replacement.',
        videoUrl: '/uploads/videos/sample-iphone12.mp4',
        courseId: course1.id,
        order: 3,
        duration: 1800,
        isFree: false
      },
      {
        title: 'Troubleshooting Common Issues',
        description: 'How to diagnose and fix common screen replacement problems.',
        videoUrl: '/uploads/videos/sample-troubleshooting.mp4',
        courseId: course1.id,
        order: 4,
        duration: 1200,
        isFree: false
      }
    ]);
    console.log('✅ Sample videos created:', videos.length);

    // Create Sample Notes
    const note1 = await Note.create({
      title: 'iPhone Repair Quick Reference Guide',
      description: 'A comprehensive PDF guide with step-by-step instructions for common iPhone repairs. Includes detailed diagrams, part numbers, and troubleshooting tips.',
      fileUrl: '/uploads/notes/iphone-repair-guide.pdf',
      price: 9.99,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
      status: NoteStatus.PUBLISHED,
      pages: 45,
      fileSize: 5242880,
      downloads: 150
    });
    console.log('✅ Note 1 created:', note1.title);

    const note2 = await Note.create({
      title: 'Samsung Galaxy Disassembly Cheat Sheet',
      description: 'Quick reference for Samsung Galaxy S and Note series disassembly. Includes screw maps and adhesive locations.',
      fileUrl: '/uploads/notes/samsung-disassembly.pdf',
      price: 7.99,
      discountPrice: 5.99,
      instructorId: instructor2.id,
      categoryId: categories[1].id,
      status: NoteStatus.PUBLISHED,
      pages: 28,
      fileSize: 3145728,
      downloads: 89
    });
    console.log('✅ Note 2 created:', note2.title);

    const note3 = await Note.create({
      title: 'Micro-soldering Fundamentals Handbook',
      description: 'Essential handbook for micro-soldering beginners. Covers equipment, techniques, and common repairs.',
      fileUrl: '/uploads/notes/microsoldering-handbook.pdf',
      price: 19.99,
      instructorId: instructor1.id,
      categoryId: categories[4].id,
      status: NoteStatus.PUBLISHED,
      pages: 72,
      fileSize: 8388608,
      downloads: 234
    });
    console.log('✅ Note 3 created:', note3.title);

    console.log('\n========================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('========================================\n');
    console.log('📝 Login Credentials:');
    console.log('----------------------------------------');
    console.log('Admin:');
    console.log('  Email: admin@mobrepairhouse.com');
    console.log('  Password: Admin@123');
    console.log('----------------------------------------');
    console.log('Instructors:');
    console.log('  Email: instructor1@mobrepairhouse.com');
    console.log('  Password: Instructor@123');
    console.log('  Email: instructor2@mobrepairhouse.com');
    console.log('  Password: Instructor@123');
    console.log('  Email: instructor3@mobrepairhouse.com');
    console.log('  Password: Instructor@123');
    console.log('----------------------------------------');
    console.log('Student:');
    console.log('  Email: student@example.com');
    console.log('  Password: Student@123');
    console.log('----------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
