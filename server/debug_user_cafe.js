// Debug script to check the user and cafe association issue
import mongoose from 'mongoose';
import User from './models/User.js';
import Cafe from './models/Cafe.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUserCafeAssociation = async () => {
  try {
    console.log('=== DEBUGGING USER CAFE ASSOCIATION ===');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the specific user
    const username = 'procafeadmin';
    const user = await User.findOne({ username }).populate('cafeId');
    
    if (!user) {
      console.log(`❌ User '${username}' not found`);
      return;
    }

    console.log('\n📋 USER DETAILS:');
    console.log('User ID:', user._id.toString());
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('CafeId in user record:', user.cafeId ? user.cafeId._id.toString() : 'NULL');
    console.log('Is Active:', user.isActive);
    console.log('Permissions:', user.permissions);

    // Check if cafeId exists and find the cafe
    if (user.cafeId) {
      const cafeId = user.cafeId._id || user.cafeId;
      console.log('\n🏪 CAFE DETAILS:');
      console.log('Cafe ID:', cafeId.toString());
      console.log('Cafe Name:', user.cafeId.name || 'Not populated');
      console.log('Cafe Status:', user.cafeId.status || 'Not populated');
      
      // Get full cafe details
      const fullCafe = await Cafe.findById(cafeId);
      if (fullCafe) {
        console.log('Full Cafe Name:', fullCafe.name);
        console.log('Full Cafe Status:', fullCafe.status);
        console.log('Subscription:', fullCafe.subscription);
        console.log('Features:', fullCafe.features);
      } else {
        console.log('❌ Cafe not found in database');
      }
    } else {
      console.log('\n❌ User has no cafeId associated');
    }

    // Check what the problematic cafe ID is
    const problematicCafeId = '689e1d4415cd872989c06bef';
    console.log('\n🔍 CHECKING PROBLEMATIC CAFE ID:', problematicCafeId);
    
    const problematicCafe = await Cafe.findById(problematicCafeId);
    if (problematicCafe) {
      console.log('✅ Problematic cafe exists:');
      console.log('Name:', problematicCafe.name);
      console.log('Status:', problematicCafe.status);
      console.log('Admin User:', problematicCafe.adminUser);
    } else {
      console.log('❌ Problematic cafe does not exist');
    }

    // Find users associated with this cafe
    const usersForProblematicCafe = await User.find({ cafeId: problematicCafeId });
    console.log(`\n👥 Users associated with cafe ${problematicCafeId}:`);
    usersForProblematicCafe.forEach(u => {
      console.log(`- Username: ${u.username}, Role: ${u.role}, Active: ${u.isActive}`);
    });

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`User ${username}:`);
    console.log(`  - User's cafeId: ${user.cafeId ? user.cafeId._id.toString() : 'NULL'}`);
    console.log(`  - Requested cafeId: ${problematicCafeId}`);
    console.log(`  - Match: ${user.cafeId ? (user.cafeId._id.toString() === problematicCafeId ? '✅ YES' : '❌ NO') : '❌ NO CAFEID'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
  }
};

checkUserCafeAssociation();
