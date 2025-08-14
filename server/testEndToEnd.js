// testEndToEnd.js - Comprehensive End-to-End Test for DineFlow
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const TEST_DATA = {
  superAdmin: {
    username: 'superadmin',
    password: '123456'
  },
  basicCafe: {
    name: 'Test Basic Cafe',
    email: 'basiccafe@test.com',
    phone: '1234567890',
    planType: 'basic',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'India'
    }
  },
  proCafe: {
    name: 'Test Pro Cafe',
    email: 'procafe@test.com',
    phone: '0987654321',
    planType: 'pro',
    subdomain: 'testprocafe',
    address: {
      street: '456 Pro Street',
      city: 'Pro City',
      state: 'Pro State',
      zipCode: '67890',
      country: 'India'
    },
    adminUser: {
      username: 'procafeadmin',
      password: 'procafe123',
      profile: {
        firstName: 'Pro',
        lastName: 'Admin',
        phone: '9876543210'
      }
    }
  }
};

let superAdminToken = '';
let createdBasicCafe = null;
let createdProCafe = null;
let proAdminToken = '';

const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

const logError = (message, error) => {
  console.error(`❌ ${message}`);
  console.error(error.response?.data?.message || error.message);
};

// Test Super Admin Login
const testSuperAdminLogin = async () => {
  try {
    log('Testing Super Admin Login...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login/super-admin`, TEST_DATA.superAdmin);
    
    if (response.data.success) {
      superAdminToken = response.data.data.token;
      logSuccess('Super Admin login successful');
      log('User Info:', {
        username: response.data.data.user.username,
        role: response.data.data.user.role,
        email: response.data.data.user.email
      });
      return true;
    }
    return false;
  } catch (error) {
    logError('Super Admin login failed', error);
    return false;
  }
};

// Test Cafe Creation - Basic Plan
const testCreateBasicCafe = async () => {
  try {
    log('Creating Basic Plan Cafe...');
    
    const response = await axios.post(`${BASE_URL}/api/cafes`, TEST_DATA.basicCafe, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      createdBasicCafe = response.data.data;
      logSuccess('Basic cafe created successfully');
      log('Basic Cafe Info:', {
        id: createdBasicCafe._id,
        name: createdBasicCafe.name,
        plan: createdBasicCafe.subscription.planType,
        status: createdBasicCafe.subscription.status
      });
      return true;
    }
    return false;
  } catch (error) {
    logError('Basic cafe creation failed', error);
    return false;
  }
};

// Test Cafe Creation - Pro Plan
const testCreateProCafe = async () => {
  try {
    log('Creating Pro Plan Cafe with Admin User...');
    
    const response = await axios.post(`${BASE_URL}/api/cafes`, TEST_DATA.proCafe, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      createdProCafe = response.data.data;
      logSuccess('Pro cafe created successfully');
      log('Pro Cafe Info:', {
        id: createdProCafe._id,
        name: createdProCafe.name,
        plan: createdProCafe.subscription.planType,
        subdomain: createdProCafe.subdomain,
        adminUser: createdProCafe.adminUser?.username
      });
      return true;
    }
    return false;
  } catch (error) {
    logError('Pro cafe creation failed', error);
    return false;
  }
};

// Test Get All Cafes
const testGetCafes = async () => {
  try {
    log('Fetching all cafes...');
    
    const response = await axios.get(`${BASE_URL}/api/cafes`, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.data.pagination.totalCafes} cafes`);
      log('Cafes List:', response.data.data.cafes.map(cafe => ({
        name: cafe.name,
        plan: cafe.subscription.planType,
        status: cafe.status
      })));
      return true;
    }
    return false;
  } catch (error) {
    logError('Get cafes failed', error);
    return false;
  }
};

// Test Edit Cafe
const testEditCafe = async () => {
  if (!createdBasicCafe) {
    logError('Edit cafe test skipped - no basic cafe created');
    return false;
  }
  
  try {
    log('Editing basic cafe...');
    
    const updateData = {
      name: 'Updated Basic Cafe Name',
      status: 'suspended',
      subscription: {
        planType: 'pro'  // Upgrade to pro
      },
      subdomain: 'updatedbasic'
    };
    
    const response = await axios.put(`${BASE_URL}/api/cafes/${createdBasicCafe._id}`, updateData, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Cafe updated successfully');
      log('Updated Cafe:', {
        name: response.data.data.name,
        status: response.data.data.status,
        plan: response.data.data.subscription.planType,
        subdomain: response.data.data.subdomain
      });
      return true;
    }
    return false;
  } catch (error) {
    logError('Edit cafe failed', error);
    return false;
  }
};

// Test Deactivate Cafe
const testDeactivateCafe = async () => {
  if (!createdProCafe) {
    logError('Deactivate cafe test skipped - no pro cafe created');
    return false;
  }
  
  try {
    log('Deactivating pro cafe...');
    
    const response = await axios.delete(`${BASE_URL}/api/cafes/${createdProCafe._id}`, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Cafe deactivated successfully');
      return true;
    }
    return false;
  } catch (error) {
    logError('Deactivate cafe failed', error);
    return false;
  }
};

// Test Reactivate Cafe
const testReactivateCafe = async () => {
  if (!createdProCafe) {
    logError('Reactivate cafe test skipped - no pro cafe created');
    return false;
  }
  
  try {
    log('Reactivating pro cafe...');
    
    const response = await axios.put(`${BASE_URL}/api/cafes/${createdProCafe._id}/reactivate`, {}, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Cafe reactivated successfully');
      return true;
    }
    return false;
  } catch (error) {
    logError('Reactivate cafe failed', error);
    return false;
  }
};

// Test Cafe Admin Login
const testCafeAdminLogin = async () => {
  if (!createdProCafe || !createdProCafe.adminUser) {
    logError('Cafe admin login test skipped - no admin user created');
    return false;
  }
  
  try {
    log('Testing Pro Cafe Admin Login...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: TEST_DATA.proCafe.adminUser.username,
      password: TEST_DATA.proCafe.adminUser.password,
      cafeId: createdProCafe._id
    });
    
    if (response.data.success) {
      proAdminToken = response.data.data.token;
      logSuccess('Cafe admin login successful');
      log('Admin Info:', {
        username: response.data.data.user.username,
        role: response.data.data.user.role,
        cafeName: response.data.data.cafe?.name
      });
      return true;
    }
    return false;
  } catch (error) {
    logError('Cafe admin login failed', error);
    return false;
  }
};

// Test Super Admin Analytics
const testSuperAdminAnalytics = async () => {
  try {
    log('Testing Super Admin Analytics...');
    
    const response = await axios.get(`${BASE_URL}/api/super-admin/analytics`, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Super admin analytics retrieved');
      log('Analytics Summary:', {
        totalCafes: response.data.data.totalCafes,
        totalUsers: response.data.data.totalUsers,
        totalOrders: response.data.data.totalOrders,
        totalRevenue: response.data.data.totalRevenue
      });
      return true;
    }
    return false;
  } catch (error) {
    logError('Super admin analytics failed', error);
    return false;
  }
};

// Test Cafe Statistics
const testCafeStatistics = async () => {
  try {
    log('Testing Cafe Statistics...');
    
    const response = await axios.get(`${BASE_URL}/api/cafes/stats/overview`, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    
    if (response.data.success) {
      logSuccess('Cafe statistics retrieved');
      log('Statistics:', {
        totalCafes: response.data.data.overview.totalCafes,
        activeCafes: response.data.data.overview.activeCafes,
        proCafes: response.data.data.overview.proCafes,
        basicCafes: response.data.data.overview.basicCafes
      });
      return true;
    }
    return false;
  } catch (error) {
    logError('Cafe statistics failed', error);
    return false;
  }
};

// Test subscription plan limits
const testSubscriptionPlanLimits = async () => {
  console.log('\n🔒 Testing Subscription Plan Limits...');
  
  try {
    // Login as basic cafe admin
    const basicCafeAdmin = await loginUser('basiccafeadmin', 'basiccafe123');
    
    // Create 20 menu items to reach Basic plan limit
    console.log('Creating menu items to test Basic plan limit...');
    let menuItems = [];
    
    for (let i = 1; i <= 20; i++) {
      try {
        const menuResponse = await axios.post(`${BASE_URL}/api/menu`, {
          name: `Test Menu Item ${i}`,
          description: `Test description ${i}`,
          price: 100 + i,
          category: createdBasicCafe.categories[0]._id,
          available: true
        }, {
          headers: { Authorization: `Bearer ${basicCafeAdmin.token}` }
        });
        
        menuItems.push(menuResponse.data.data);
        console.log(`✅ Created menu item ${i}/20`);
      } catch (error) {
        console.error(`❌ Failed to create menu item ${i}:`, error.response?.data?.message);
        break;
      }
    }
    
    // Try to create 21st menu item (should fail)
    console.log('Testing Basic plan limit enforcement...');
    try {
      await axios.post(`${BASE_URL}/api/menu`, {
        name: 'Test Menu Item 21 - Should Fail',
        description: 'This should fail due to Basic plan limit',
        price: 121,
        category: createdBasicCafe.categories[0]._id,
        available: true
      }, {
        headers: { Authorization: `Bearer ${basicCafeAdmin.token}` }
      });
      
      console.log('❌ ERROR: 21st menu item creation should have failed but succeeded');
    } catch (error) {
      if (error.response?.data?.planLimit) {
        console.log('✅ Basic plan limit correctly enforced');
        console.log(`   Current: ${error.response.data.planLimit.current}, Limit: ${error.response.data.planLimit.limit}`);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }
    
    // Test table management restriction for Basic plan
    console.log('Testing table management restriction for Basic plan...');
    try {
      await axios.post(`${BASE_URL}/api/tables`, {
        tableNumber: 1,
        tableName: 'Table 1',
        capacity: 4,
        location: 'Main Floor'
      }, {
        headers: { Authorization: `Bearer ${basicCafeAdmin.token}` }
      });
      
      console.log('❌ ERROR: Table creation should have failed for Basic plan');
    } catch (error) {
      if (error.response?.data?.planLimit) {
        console.log('✅ Table management restriction correctly enforced for Basic plan');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }
    
    // Test Pro plan has no limits
    console.log('Testing Pro plan unlimited access...');
    const proCafeAdmin = await loginUser('procafeadmin', 'procafe123');
    
    // Create table for Pro plan (should succeed)
    try {
      const tableResponse = await axios.post(`${BASE_URL}/api/tables`, {
        tableNumber: 1,
        tableName: 'Pro Table 1',
        capacity: 4,
        location: 'Main Floor'
      }, {
        headers: { Authorization: `Bearer ${proCafeAdmin.token}` }
      });
      
      console.log('✅ Pro plan table creation successful');
    } catch (error) {
      console.log('❌ Pro plan table creation failed:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Subscription plan limits test failed:', error.message);
  }
};

// Run All Tests
const runAllTests = async () => {
  console.log('🚀 Starting DineFlow End-to-End Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  const tests = [
    { name: 'Super Admin Login', fn: testSuperAdminLogin },
    { name: 'Create Basic Cafe', fn: testCreateBasicCafe },
    { name: 'Create Pro Cafe', fn: testCreateProCafe },
    { name: 'Get All Cafes', fn: testGetCafes },
    { name: 'Edit Cafe', fn: testEditCafe },
    { name: 'Deactivate Cafe', fn: testDeactivateCafe },
    { name: 'Reactivate Cafe', fn: testReactivateCafe },
    { name: 'Cafe Admin Login', fn: testCafeAdminLogin },
    { name: 'Super Admin Analytics', fn: testSuperAdminAnalytics },
    { name: 'Cafe Statistics', fn: testCafeStatistics },
    { name: 'Subscription Plan Limits', fn: testSubscriptionPlanLimits }
  ];
  
  for (const test of tests) {
    totalTests++;
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Running: ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
        console.log(`✅ ${test.name} - PASSED`);
      } else {
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR:`, error.message);
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎯 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
  console.log(`${'='.repeat(60)}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! DineFlow backend is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }
};

// Check if server is running first
const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${BASE_URL}`);
    return response.data.includes('DineFlow');
  } catch (error) {
    console.error('❌ Server is not running on port 5000. Please start the server first.');
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('🔍 Checking if DineFlow server is running...');
  
  const isServerRunning = await checkServerHealth();
  if (!isServerRunning) {
    console.log('\n💡 To start the server, run:');
    console.log('   cd server && node server.js');
    return;
  }
  
  console.log('✅ Server is running!\n');
  
  await runAllTests();
};

main().catch(console.error);
