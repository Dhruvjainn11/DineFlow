import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const resetTestPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const testPassword = '123456';

    // Reset super admin password
    const superAdmin = await User.findOne({ role: 'super-admin' });
    if (superAdmin) {
      superAdmin.password = testPassword; // Set plain text - pre-save hook will hash it
      await superAdmin.save();
      console.log('✅ Super admin password reset successfully');
    }

    // Reset cafe admin passwords
    const cafeAdmins = await User.find({ role: 'admin', cafeId: { $ne: null } });
    for (const admin of cafeAdmins) {
      admin.password = testPassword; // Set plain text - pre-save hook will hash it
      await admin.save();
      console.log(`✅ Cafe admin '${admin.username}' password reset successfully`);
    }

    console.log(`\n🔑 All test passwords reset to: ${testPassword}`);
    console.log('\nTest Users:');
    console.log('- superadmin / 123456 (Super Admin)');
    
    const updatedCafeAdmins = await User.find({ role: 'admin', cafeId: { $ne: null } }).populate('cafeId', 'name');
    updatedCafeAdmins.forEach(admin => {
      console.log(`- ${admin.username} / 123456 (Cafe Admin - ${admin.cafeId?.name || 'Unknown Cafe'})`);
    });

    mongoose.disconnect();
    console.log('\n✅ Password reset completed!');

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    mongoose.disconnect();
  }
};

resetTestPasswords();
