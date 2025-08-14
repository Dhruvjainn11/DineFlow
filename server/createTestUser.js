// createTestUser.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Cafe from "./models/Cafe.js";

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const testUsername = "procafeadmin";
    const testPassword = "password123";

    // Check if the user already exists
    const existingUser = await User.findOne({ username: testUsername });
    
    if (existingUser) {
      console.log(`🔄 User "${testUsername}" already exists. Updating password...`);
      
      // Update the existing user's password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      existingUser.password = hashedPassword;
      existingUser.isActive = true;
      await existingUser.save();
      
      console.log(`✅ Password updated for user "${testUsername}"`);
      console.log(`   Username: ${testUsername}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   Cafe: ${existingUser.cafeId ? 'Linked to cafe' : 'No cafe linked'}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Active: ${existingUser.isActive}`);
    } else {
      console.log(`👤 Creating new test user "${testUsername}"...`);
      
      // Find an active pro cafe to link the user to
      const testCafe = await Cafe.findOne({ 
        status: 'active',
        'subscription.planType': 'pro'
      });
      
      if (!testCafe) {
        console.log("❌ No active pro cafe found. Creating a test cafe first...");
        
        // Create a test cafe
        const newCafe = await Cafe.create({
          name: "E2E Test Cafe",
          email: "e2etest@dineflow.com",
          subdomain: "e2etest",
          status: "active",
          subscription: {
            planType: "pro",
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          },
          features: {
            maxMenuItems: 1000,
            maxTables: 100,
            advancedAnalytics: true,
            customization: true,
            multipleLocations: true
          }
        });
        
        console.log(`✅ Created test cafe: ${newCafe.name}`);
        
        // Create the test user linked to this cafe
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const testUser = await User.create({
          username: testUsername,
          password: hashedPassword,
          role: "admin",
          cafeId: newCafe._id,
          isActive: true,
          permissions: {
            canManageMenu: true,
            canManageOrders: true,
            canManageTables: true,
            canViewAnalytics: true,
            canManageUsers: true,
            canManageSettings: true
          }
        });
        
        console.log(`✅ Created test user: ${testUser.username}`);
      } else {
        // Create the test user linked to existing cafe
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const testUser = await User.create({
          username: testUsername,
          password: hashedPassword,
          role: "admin",
          cafeId: testCafe._id,
          isActive: true,
          permissions: {
            canManageMenu: true,
            canManageOrders: true,
            canManageTables: true,
            canViewAnalytics: true,
            canManageUsers: true,
            canManageSettings: true
          }
        });
        
        console.log(`✅ Created test user: ${testUser.username}`);
        console.log(`   Linked to existing cafe: ${testCafe.name}`);
      }
      
      console.log(`   Username: ${testUsername}`);
      console.log(`   Password: ${testPassword}`);
    }

    console.log(`\n🧪 Test credentials ready!`);
    console.log(`   You can now run the E2E tests with these credentials.`);

  } catch (err) {
    console.error("❌ Error creating test user:", err);
    process.exit(1);
  } finally {
    // Close the MongoDB connection after the operation
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

createTestUser().catch(err => {
    console.error("Fatal error during script execution:", err);
    process.exit(1);
});
