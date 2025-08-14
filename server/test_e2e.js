// test_e2e.js - Final End-to-End Testing
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000';

class E2ETest {
  constructor() {
    this.tokens = {};
    this.cafes = {};
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const url = method === 'GET' && data ? 
        `${BASE_URL}${endpoint}?${new URLSearchParams(data)}` : 
        `${BASE_URL}${endpoint}`;

      console.log(`${method} ${url}`);
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      return {
        status: response.status,
        data: responseData
      };
    } catch (error) {
      console.error(`Request failed: ${error.message}`);
      return { status: 500, error: error.message };
    }
  }

  async testSuperAdminLogin() {
    console.log('\n🔐 Testing Super Admin Login...');
    const response = await this.makeRequest('POST', '/api/auth/login', {
      username: 'superadmin',
      password: 'superadmin123'
    });

    if (response.status === 200 && response.data.token) {
      this.tokens.superAdmin = response.data.token;
      console.log('✅ Super Admin login successful');
      return true;
    } else {
      console.log('❌ Super Admin login failed:', response.data);
      return false;
    }
  }

  async testCafeList() {
    console.log('\n📋 Testing Cafe List Retrieval...');
    const response = await this.makeRequest('GET', '/api/super-admin/cafes', null, this.tokens.superAdmin);
    
    if (response.status === 200 && response.data.cafes) {
      console.log(`✅ Found ${response.data.cafes.length} cafes`);
      response.data.cafes.forEach(cafe => {
        console.log(`   - ${cafe.name} (${cafe.subscription.planType})`);
        this.cafes[cafe.subscription.planType] = cafe;
      });
      return true;
    } else {
      console.log('❌ Failed to retrieve cafe list:', response.data);
      return false;
    }
  }

  async testAnalyticsSummary() {
    console.log('\n📊 Testing Basic Analytics (Summary)...');
    const response = await this.makeRequest('GET', '/api/analytics/summary', null, this.tokens.superAdmin);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Analytics summary retrieved successfully');
      console.log(`   - Total Orders: ${response.data.data.totalOrders}`);
      console.log(`   - Total Revenue: $${response.data.data.payments.totalRevenue}`);
      return true;
    } else {
      console.log('❌ Failed to retrieve analytics:', response.data);
      return false;
    }
  }

  async testAdvancedAnalytics() {
    console.log('\n📈 Testing Advanced Analytics (Pro Feature)...');
    const response = await this.makeRequest('GET', '/api/analytics/advanced', null, this.tokens.superAdmin);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Advanced analytics retrieved successfully');
      console.log(`   - Order trends: ${response.data.data.orderTrends?.length || 0} entries`);
      console.log(`   - Popular items: ${response.data.data.popularItems?.length || 0} items`);
      return true;
    } else {
      console.log('❌ Failed to retrieve advanced analytics:', response.data);
      return false;
    }
  }

  async testCafeStatusUpdate() {
    console.log('\n🔄 Testing Cafe Status Management...');
    const basicCafe = this.cafes.basic;
    if (!basicCafe) {
      console.log('❌ No basic cafe found to test');
      return false;
    }

    // Test suspend
    const suspendResponse = await this.makeRequest('PUT', `/api/super-admin/cafes/${basicCafe._id}/status`, {
      status: 'suspended'
    }, this.tokens.superAdmin);

    if (suspendResponse.status === 200) {
      console.log('✅ Cafe suspended successfully');
      
      // Test reactivate
      const reactivateResponse = await this.makeRequest('PUT', `/api/super-admin/cafes/${basicCafe._id}/status`, {
        status: 'active'
      }, this.tokens.superAdmin);

      if (reactivateResponse.status === 200) {
        console.log('✅ Cafe reactivated successfully');
        return true;
      } else {
        console.log('❌ Failed to reactivate cafe:', reactivateResponse.data);
        return false;
      }
    } else {
      console.log('❌ Failed to suspend cafe:', suspendResponse.data);
      return false;
    }
  }

  async testOrdersEndpoint() {
    console.log('\n📦 Testing Orders Endpoint...');
    const response = await this.makeRequest('GET', '/api/orders', null, this.tokens.superAdmin);
    
    if (response.status === 200) {
      console.log('✅ Orders endpoint accessible');
      console.log(`   - Found ${response.data.orders?.length || 0} orders`);
      return true;
    } else {
      console.log('❌ Failed to access orders:', response.data);
      return false;
    }
  }

  async testMenuEndpoint() {
    console.log('\n🍽️ Testing Menu Endpoint...');
    const response = await this.makeRequest('GET', '/api/menu', null, this.tokens.superAdmin);
    
    if (response.status === 200) {
      console.log('✅ Menu endpoint accessible');
      console.log(`   - Found ${response.data.menuItems?.length || 0} menu items`);
      return true;
    } else {
      console.log('❌ Failed to access menu:', response.data);
      return false;
    }
  }

  async runTests() {
    console.log('🚀 Starting End-to-End Testing...');
    console.log('==========================================');

    const tests = [
      { name: 'Super Admin Login', test: () => this.testSuperAdminLogin() },
      { name: 'Cafe List Retrieval', test: () => this.testCafeList() },
      { name: 'Analytics Summary', test: () => this.testAnalyticsSummary() },
      { name: 'Advanced Analytics', test: () => this.testAdvancedAnalytics() },
      { name: 'Cafe Status Management', test: () => this.testCafeStatusUpdate() },
      { name: 'Orders Endpoint', test: () => this.testOrdersEndpoint() },
      { name: 'Menu Endpoint', test: () => this.testMenuEndpoint() }
    ];

    const results = [];

    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        results.push({ name: testCase.name, passed: result });
      } catch (error) {
        console.error(`❌ ${testCase.name} threw error:`, error.message);
        results.push({ name: testCase.name, passed: false, error: error.message });
      }
    }

    console.log('\n\n📋 Final Test Results:');
    console.log('=====================');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
    });

    console.log(`\n🎯 Test Summary: ${passed}/${total} tests passed`);

    if (passed === total) {
      console.log('🎉 All tests passed! System is ready for production.');
    } else {
      console.log(`⚠️  ${total - passed} test(s) failed. Please check the issues above.`);
    }

    return passed === total;
  }
}

async function main() {
  const tester = new E2ETest();
  const allPassed = await tester.runTests();
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
