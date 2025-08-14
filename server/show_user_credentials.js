import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Cafe from './models/Cafe.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  console.log('\n=== USER LOGIN CREDENTIALS FOR TESTING ===');
  
  // Get super admin user
  const superAdmin = await User.findOne({ role: 'super-admin' });
  if (superAdmin) {
    console.log('\n🔥 SUPER ADMIN:');
    console.log(`Username: ${superAdmin.username}`);
    console.log(`Email: ${superAdmin.email || 'Not set'}`);
    console.log(`Password: [Check database or docs]`);
    console.log(`Active: ${superAdmin.isActive}`);
  }
  
  // Get cafe admin users
  const cafeAdmins = await User.find({ role: 'admin', cafeId: { $ne: null } }).populate('cafeId', 'name email');
  if (cafeAdmins.length > 0) {
    console.log('\n🏪 CAFE ADMIN USERS:');
    cafeAdmins.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email || 'Not set'}`);
      console.log(`   Cafe: ${user.cafeId?.name}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Password: [Check database or docs]`);
      console.log('');
    });
  }
  
  mongoose.disconnect();
}).catch(err => console.error('MongoDB connection error:', err));
