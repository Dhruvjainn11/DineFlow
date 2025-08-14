// createSuperAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Cafe from "./models/Cafe.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const email = "super@dineflow.com";
    const username = "superadmin";
    const password = "123456"; // Use a strong password in production

    // Check if a super admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if the existing user is a super-admin
      if (existingUser.role === 'super-admin') {
        console.log(`⚠ Super Admin with email "${email}" already exists. No action taken.`);
        return;
      }
      // If a user with that email exists but isn't a super-admin, you might want to handle this case
      console.log(`⚠ A user with email "${email}" exists but is not a super-admin. Aborting.`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Password "${password}" hashed successfully. New hash: ${hashedPassword}`);

    // Create super admin
    const superAdmin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "super-admin",
    });

    console.log("🎉 Super Admin created successfully:", superAdmin);
  } catch (err) {
    console.error("❌ Error creating Super Admin:", err);
    process.exit(1);
  } finally {
    // Close the MongoDB connection after the operation
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

createSuperAdmin().catch(err => {
    console.error("Fatal error during script execution:", err);
    process.exit(1);
});