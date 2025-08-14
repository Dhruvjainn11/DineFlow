import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const grantMenuPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update cafe admin users to have menu management permissions
    const result = await User.updateMany(
      { role: 'admin', cafeId: { $ne: null } },
      {
        $set: {
          'permissions.canManageMenu': true,
          'permissions.canManageOrders': true,
          'permissions.canManageTables': true,
          'permissions.canViewAnalytics': true
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} cafe admin users with proper permissions`);

    // Show updated users
    const updatedUsers = await User.find({ role: 'admin', cafeId: { $ne: null } })
      .populate('cafeId', 'name')
      .select('username permissions cafeId');

    console.log('\n📋 Updated Cafe Admin Users:');
    updatedUsers.forEach(user => {
      console.log(`👤 ${user.username} (${user.cafeId?.name}):`);
      console.log(`  - Menu Management: ${user.permissions?.canManageMenu ? '✅' : '❌'}`);
      console.log(`  - Order Management: ${user.permissions?.canManageOrders ? '✅' : '❌'}`);
      console.log(`  - Table Management: ${user.permissions?.canManageTables ? '✅' : '❌'}`);
      console.log(`  - View Analytics: ${user.permissions?.canViewAnalytics ? '✅' : '❌'}`);
    });

    mongoose.disconnect();
    console.log('\n✅ Permissions updated successfully!');

  } catch (error) {
    console.error('❌ Error updating permissions:', error);
    mongoose.disconnect();
  }
};

grantMenuPermissions();
