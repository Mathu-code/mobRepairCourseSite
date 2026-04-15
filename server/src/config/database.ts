import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI ||
      `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}/${process.env.DB_NAME || 'mobrepairhouse'}`;
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connection established successfully.');
    return mongoose;
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error);
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
    throw error;
  }
};

export default connectDB;
