// testSuperAdminLogin.js - Test super admin login functionality
import axios from 'axios';

const testSuperAdminLogin = async () => {
  try {
    console.log('🧪 Testing Super Admin Login...');
    
    const loginData = {
      username: 'superadmin',
      password: '123456'
    };

    const response = await axios.post('http://localhost:5000/api/auth/login/super-admin', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Super Admin Login Successful!');
      console.log('📝 User Info:', {
        id: response.data.data.user._id,
        username: response.data.data.user.username,
        role: response.data.data.user.role,
        email: response.data.data.user.email
      });
      console.log('🎟️ JWT Token received:', response.data.data.token ? 'Yes' : 'No');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Error during login test:', error.response?.data?.message || error.message);
    return false;
  }
};

const testGetCafes = async (token) => {
  try {
    console.log('\n🧪 Testing Get Cafes API...');
    
    const response = await axios.get('http://localhost:5000/api/cafes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Get Cafes Successful!');
      console.log(`📊 Total Cafes: ${response.data.data.pagination.totalCafes}`);
      console.log('🏪 Cafes:', response.data.data.cafes.map(cafe => ({
        name: cafe.name,
        email: cafe.email,
        plan: cafe.subscription.planType,
        status: cafe.status
      })));
      return true;
    } else {
      console.log('❌ Get cafes failed:', response.data.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Error during get cafes test:', error.response?.data?.message || error.message);
    return false;
  }
};

const runTests = async () => {
  console.log('🚀 Starting Super Admin API Tests...\n');
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test login
  const loginSuccess = await testSuperAdminLogin();
  
  if (loginSuccess) {
    // Get the token for further tests
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login/super-admin', {
      username: 'superadmin',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    
    // Test getting cafes
    await testGetCafes(token);
  }
  
  console.log('\n🎯 Tests completed!');
};

runTests().catch(console.error);
