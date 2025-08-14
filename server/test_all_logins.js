import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test credentials (these are from our database check)
const testUsers = [
  {
    type: 'Super Admin',
    username: 'superadmin',
    password: '123456' // From testSuperAdminLogin.js
  },
  {
    type: 'Cafe Admin - user',
    username: 'user',
    password: '123456' // Common default
  },
  {
    type: 'Cafe Admin - testprocafeadmin', 
    username: 'testprocafeadmin',
    password: '123456' // Common default
  }
];

const testLogin = async (user, endpoint) => {
  try {
    console.log(`\n🧪 Testing ${user.type} login at ${endpoint}...`);
    
    const loginData = {
      username: user.username,
      password: user.password
    };

    const response = await axios.post(`${BASE_URL}${endpoint}`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`✅ ${user.type} Login Successful!`);
      console.log(`📝 User Info:`, {
        username: response.data.data.user.username,
        role: response.data.data.user.role,
        cafeId: response.data.data.user.cafeId || 'None'
      });
      console.log(`🏪 Cafe:`, response.data.data.cafe ? response.data.data.cafe.name : 'None');
      return { success: true, token: response.data.data.token, user: response.data.data.user };
    } else {
      console.log(`❌ ${user.type} Login failed:`, response.data.message);
      return { success: false, error: response.data.message };
    }

  } catch (error) {
    console.log(`❌ ${user.type} Login error:`, error.response?.data?.message || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Login Tests...\n');
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results = [];

  for (const user of testUsers) {
    // Test with general login endpoint
    const generalResult = await testLogin(user, '/auth/login');
    results.push({ ...generalResult, user: user.type, endpoint: '/auth/login' });
    
    // Test with super-admin endpoint (only for super admin)
    if (user.type.includes('Super Admin')) {
      const superAdminResult = await testLogin(user, '/auth/login/super-admin');
      results.push({ ...superAdminResult, user: user.type, endpoint: '/auth/login/super-admin' });
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log('\n📊 SUMMARY:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.user} - ${result.endpoint}: ${result.success ? 'SUCCESS' : result.error}`);
  });
  
  console.log('\n🎯 Tests completed!');
};

runAllTests().catch(console.error);
