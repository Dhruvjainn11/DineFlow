import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Cafe from './models/Cafe.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const cafes = await Cafe.find({}).select('name email adminUser status subscription.planType');
  console.log('\n=== CAFES ===');
  console.log('\n=== CAFES ===');
  cafes.forEach((cafe, index) => {
    console.log(`${index + 1}. ${cafe.name} (${cafe.email}) - Admin: ${cafe.adminUser} - Status: ${cafe.status} - Plan: ${cafe.subscription?.planType}`);
  });
  
  const cafeAdmins = await User.find({ role: 'admin', cafeId: { $ne: null } }).populate('cafeId', 'name email');
  console.log('\n=== CAFE ADMIN USERS ===');
  cafeAdmins.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username} - Email: ${user.email} - Cafe: ${user.cafeId?.name} - Active: ${user.isActive}`);
  });
  
  const superAdmins = await User.find({ role: 'super-admin' });
  console.log('\n=== SUPER ADMIN USERS ===');
  superAdmins.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username} - Email: ${user.email} - Active: ${user.isActive}`);
  });
  
  mongoose.disconnect();
}).catch(err => console.error('MongoDB connection error:', err));
