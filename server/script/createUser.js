// scripts/createUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config(); // load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed');
    process.exit(1);
  }
};

const createUsers = async () => {
  await connectDB();

  const existing = await User.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin already exists');
    return process.exit(0);
  }

  await User.create([
    {
      username: 'dineflow-admin',
      password: 'dineflow@admin', // will be hashed automatically
      role: 'admin',
    },
    {
      username: 'kitchen',
      password: 'kitchen@123',
      role: 'kitchen',
    },
  ]);

  console.log('Users created ✅');
  process.exit();
};

createUsers();
