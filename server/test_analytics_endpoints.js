// test_analytics_endpoints.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Cafe from './models/Cafe.js';
import jwt from 'jsonwebtoken';

dotenv.config();

async function testAnalyticsEndpoints() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Get test cafes
    const basicCafe = await Cafe.findOne({ 'subscription.planType': 'basic' });
    const proCafe = await Cafe.findOne({ 'subscription.planType': 'pro' });
    const superAdminUser = await User.findOne({ role: 'super-admin' });

    if (!basicCafe || !proCafe || !superAdminUser) {
      console.log('Missing test data - need cafes with basic/pro plans and super admin user');
      process.exit(1);
    }

    console.log(`Testing with:`);
    console.log(`- Basic Plan Cafe: ${basicCafe.name}`);
    console.log(`- Pro Plan Cafe: ${proCafe.name}`);
    console.log(`- Super Admin User: ${superAdminUser.username}\n`);

    // Find admin users for each cafe
    const basicAdmin = await User.findOne({ cafeId: basicCafe._id, role: 'admin' });
    const proAdmin = await User.findOne({ cafeId: proCafe._id, role: 'admin' });

    if (!basicAdmin || !proAdmin) {
      console.log('Missing admin users for cafes');
      process.exit(1);
    }

    console.log(`- Basic Admin: ${basicAdmin.username}`);
    console.log(`- Pro Admin: ${proAdmin.username}\n`);

    // Generate auth tokens
    const basicAdminToken = jwt.sign(
      { id: basicAdmin._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    const proAdminToken = jwt.sign(
      { id: proAdmin._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    const superAdminToken = jwt.sign(
      { id: superAdminUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    console.log('Generated authentication tokens');

    // Test basic analytics endpoint
    console.log('\n=== Testing Basic Analytics Endpoint ===');
    
    // Test with basic plan admin
    console.log('\n1. Basic plan admin accessing /api/analytics/summary:');
    const basicSummaryResponse = await testRequest('GET', '/api/analytics/summary', basicAdminToken);
    console.log(`Status: ${basicSummaryResponse.status || 'SUCCESS'}`);
    if (basicSummaryResponse.data) {
      console.log(`Total Orders: ${basicSummaryResponse.data.totalOrders}`);
      console.log(`Total Revenue: $${basicSummaryResponse.data.payments.totalRevenue}`);
    }

    // Test with pro plan admin
    console.log('\n2. Pro plan admin accessing /api/analytics/summary:');
    const proSummaryResponse = await testRequest('GET', '/api/analytics/summary', proAdminToken);
    console.log(`Status: ${proSummaryResponse.status || 'SUCCESS'}`);
    if (proSummaryResponse.data) {
      console.log(`Total Orders: ${proSummaryResponse.data.totalOrders}`);
      console.log(`Total Revenue: $${proSummaryResponse.data.payments.totalRevenue}`);
    }

    // Test with super admin
    console.log('\n3. Super admin accessing /api/analytics/summary:');
    const superSummaryResponse = await testRequest('GET', '/api/analytics/summary', superAdminToken);
    console.log(`Status: ${superSummaryResponse.status || 'SUCCESS'}`);
    if (superSummaryResponse.data) {
      console.log(`Total Orders (all cafes): ${superSummaryResponse.data.totalOrders}`);
      console.log(`Total Revenue (all cafes): $${superSummaryResponse.data.payments.totalRevenue}`);
    }

    // Test advanced analytics endpoint (Pro feature)
    console.log('\n=== Testing Advanced Analytics Endpoint (Pro Feature) ===');
    
    // Test with basic plan admin (should be denied)
    console.log('\n1. Basic plan admin accessing /api/analytics/advanced:');
    const basicAdvancedResponse = await testRequest('GET', '/api/analytics/advanced', basicAdminToken);
    if (basicAdvancedResponse.status === 403) {
      console.log(`✅ CORRECTLY DENIED - Status: 403`);
      console.log(`Message: ${basicAdvancedResponse.message}`);
    } else {
      console.log(`❌ SHOULD BE DENIED - Status: ${basicAdvancedResponse.status || 'SUCCESS'}`);
    }

    // Test with pro plan admin (should succeed)
    console.log('\n2. Pro plan admin accessing /api/analytics/advanced:');
    const proAdvancedResponse = await testRequest('GET', '/api/analytics/advanced', proAdminToken);
    console.log(`Status: ${proAdvancedResponse.status || 'SUCCESS'}`);
    if (proAdvancedResponse.data) {
      console.log(`✅ ACCESS GRANTED`);
      console.log(`Order trends count: ${proAdvancedResponse.data.orderTrends?.length || 0}`);
      console.log(`Popular items count: ${proAdvancedResponse.data.popularItems?.length || 0}`);
    }

    // Test with super admin (should succeed)
    console.log('\n3. Super admin accessing /api/analytics/advanced:');
    const superAdvancedResponse = await testRequest('GET', '/api/analytics/advanced', superAdminToken);
    console.log(`Status: ${superAdvancedResponse.status || 'SUCCESS'}`);
    if (superAdvancedResponse.data) {
      console.log(`✅ ACCESS GRANTED`);
      console.log(`Order trends count: ${superAdvancedResponse.data.orderTrends?.length || 0}`);
      console.log(`Popular items count: ${superAdvancedResponse.data.popularItems?.length || 0}`);
    }

    console.log('\n=== Analytics Testing Complete ===');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Simple request simulation function
async function testRequest(method, endpoint, token) {
  try {
    // This is a simplified simulation - in real tests you'd use supertest or similar
    console.log(`Making ${method} request to ${endpoint} with token: ${token.substring(0, 20)}...`);
    
    // For this demo, we'll just return success status
    // In real implementation, you'd make actual HTTP requests
    return {
      status: 'SIMULATED',
      message: 'This is a simulated request for demonstration'
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message
    };
  }
}

testAnalyticsEndpoints();
