// verifyPassword.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const verifyPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const testUsername = "procafeadmin";
    const testPassword = "password123";

    // Find the user
    const user = await User.findOne({ username: testUsername });
    
    if (!user) {
      console.log(`❌ User "${testUsername}" not found`);
      return;
    }

    console.log(`👤 Found user: ${user.username}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Cafe ID: ${user.cafeId}`);
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);

    // Test password match
    const isMatch = await user.matchPassword(testPassword);
    console.log(`\n🔐 Password verification:`);
    console.log(`   Testing password: "${testPassword}"`);
    console.log(`   Match result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

    if (!isMatch) {
      console.log(`\n🔄 Attempting to reset password...`);
      // Set the plain password - let the pre-save hook hash it
      user.password = testPassword;
      await user.save();
      
      // Reload user to get fresh data
      const updatedUser = await User.findOne({ username: testUsername });
      const newMatch = await updatedUser.matchPassword(testPassword);
      console.log(`   After reset: ${newMatch ? '✅ MATCH' : '❌ STILL NO MATCH'}`);
    }

  } catch (err) {
    console.error("❌ Error verifying password:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

verifyPassword().catch(err => {
    console.error("Fatal error during script execution:", err);
    process.exit(1);
});
