// test_analytics.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Cafe from './models/Cafe.js';

dotenv.config();

async function checkAnalyticsData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check existing cafes and their orders
    const cafes = await Cafe.find().select('name subscription.planType');
    console.log('\nExisting Cafes:');
    cafes.forEach(cafe => {
      console.log(`- ${cafe.name} (Plan: ${cafe.subscription.planType})`);
    });

    // Check existing orders
    const orderCount = await Order.countDocuments();
    console.log(`\nTotal Orders in Database: ${orderCount}`);

    if (orderCount > 0) {
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)
        .populate('cafeId', 'name')
        .select('totalPrice status paymentStatus createdAt cafeId');
      
      console.log('\nRecent Orders:');
      recentOrders.forEach(order => {
        console.log(`- ${order.cafeId?.name || 'Unknown'}: $${order.totalPrice} (${order.status}, ${order.paymentStatus}) - ${order.createdAt.toDateString()}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAnalyticsData();
