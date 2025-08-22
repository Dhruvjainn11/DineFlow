// createSuperAdminCafe.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Cafe from "./models/Cafe.js";

dotenv.config();

const createSuperAdminCafe = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Find the super admin user
    const superAdmin = await User.findOne({ 
      email: "dhruvjainn25@gmail.com",
      role: "super-admin" 
    });

    if (!superAdmin) {
      console.log("❌ Super admin not found. Please create super admin first.");
      return;
    }

    // Check if super admin already has a cafe
    if (superAdmin.cafeId) {
      console.log("⚠ Super admin already has a cafe assigned.");
      return;
    }

    // Create a demo cafe for super admin
    const cafe = await Cafe.create({
      name: "DineFlow Demo Cafe",
      email: "dhruv@dineflow.com",
      phone: "1234567890",
      address: {
        street: "123 Demo Street",
        city: "Demo City",
        state: "Demo State",
        zipCode: "12345",
        country: "India"
      },
      subscription: {
        planType: "pro",
        status: "active"
      },
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#F3F4F6",
        fontFamily: "Inter"
      },
      adminUser: superAdmin._id
    });

    // Update super admin with cafe reference
    superAdmin.cafeId = cafe._id;
    await superAdmin.save();

    console.log("🎉 Super Admin Cafe created successfully:");
    console.log("Cafe ID:", cafe._id);
    console.log("Cafe Name:", cafe.name);
    console.log("Super Admin updated with cafe reference");

  } catch (err) {
    console.error("❌ Error creating Super Admin Cafe:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

createSuperAdminCafe().catch(err => {
  console.error("Fatal error during script execution:", err);
  process.exit(1);
});