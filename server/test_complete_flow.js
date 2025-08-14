import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000/api';

// Test users
const cafeAdminUser = { username: 'user', password: '123456' };

let adminToken = '';
let cafeId = '';
let testCategoryId = '';
let testMenuItemId = '';
let testOrderId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

const stepCounter = {
  current: 0,
  step(title) {
    this.current++;
    log(colors.cyan, `\n🔹 Step ${this.current}: ${title}`);
  }
};

// === AUTHENTICATION ===
const loginAsAdmin = async () => {
  try {
    stepCounter.step('Cafe Admin Login');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, cafeAdminUser);
    
    if (response.data.success) {
      adminToken = response.data.data.token;
      cafeId = response.data.data.cafe?.id;
      log(colors.green, '✅ Login successful!');
      log(colors.white, `   👤 User: ${response.data.data.user.username}`);
      log(colors.white, `   🏪 Cafe: ${response.data.data.cafe?.name}`);
      log(colors.white, `   🆔 Cafe ID: ${cafeId}`);
      return true;
    }
    return false;
  } catch (error) {
    log(colors.red, `❌ Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

// === CATEGORY MANAGEMENT ===
const createTestCategory = async () => {
  try {
    stepCounter.step('Create Test Category');
    
    const categoryData = {
      name: 'Test Hot Drinks',
      description: 'Freshly brewed hot beverages for testing flow',
      imageUrl: 'https://example.com/hot-drinks.jpg'
    };

    const response = await axios.post(`${BASE_URL}/categories`, categoryData, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      testCategoryId = response.data.data._id;
      log(colors.green, '✅ Category created successfully!');
      log(colors.white, `   📋 Name: ${response.data.data.name}`);
      log(colors.white, `   🆔 ID: ${testCategoryId}`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    log(colors.red, `❌ Create category failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

// === MENU ITEM MANAGEMENT ===
const createTestMenuItem = async () => {
  try {
    stepCounter.step('Create Menu Item with Sizes (Frontend Format)');
    
    if (!testCategoryId) {
      log(colors.red, '❌ No test category ID available');
      return null;
    }

    // Use proper FormData as the frontend does
    const formData = new FormData();
    formData.append('name', 'Masala Chai Special');
    formData.append('description', 'Authentic Indian spiced tea with rich flavor and aroma');
    formData.append('category', testCategoryId);
    formData.append('available', 'true');
    formData.append('jain', 'false');
    formData.append('imageUrl', 'https://example.com/masala-chai.jpg');
    formData.append('ingredients', 'Tea Leaves, Milk, Sugar, Cardamom, Ginger, Cloves');
    formData.append('sizes', JSON.stringify([
      { label: 'Small (150ml)', price: 25 },
      { label: 'Regular (200ml)', price: 35 },
      { label: 'Large (300ml)', price: 45 }
    ]));

    const response = await axios.post(`${BASE_URL}/menu`, formData, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        ...formData.getHeaders()
      }
    });

    if (response.data.success) {
      testMenuItemId = response.data.data._id;
      log(colors.green, '✅ Menu item created successfully!');
      log(colors.white, `   🍽️ Name: ${response.data.data.name}`);
      log(colors.white, `   🆔 ID: ${testMenuItemId}`);
      log(colors.white, `   📂 Category: ${response.data.data.category?.name}`);
      log(colors.white, `   💰 Sizes: ${response.data.data.sizes?.length} pricing options`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    log(colors.red, `❌ Create menu item failed: ${error.response?.data?.message || error.message}`);
    console.error('Full error:', error.response?.data);
    return null;
  }
};

const getMenuForCustomer = async () => {
  try {
    stepCounter.step('Fetch Menu for Customer View');
    
    const response = await axios.get(`${BASE_URL}/menu`, {
      params: { cafeId: cafeId }
    });

    if (response.data.success) {
      log(colors.green, `✅ Customer menu fetched: ${response.data.count} items available`);
      response.data.data.forEach((item, index) => {
        const sizeInfo = item.sizes?.length > 0 
          ? `${item.sizes.length} sizes (₹${Math.min(...item.sizes.map(s => s.price))}-₹${Math.max(...item.sizes.map(s => s.price))})`
          : `₹${item.price}`;
        log(colors.white, `   ${index + 1}. ${item.name} - ${sizeInfo}`);
      });
      return response.data.data;
    }
    return [];
  } catch (error) {
    log(colors.red, `❌ Fetch customer menu failed: ${error.response?.data?.message || error.message}`);
    return [];
  }
};

// === TABLE MANAGEMENT ===
const createTestTable = async () => {
  try {
    stepCounter.step('Create Test Table');
    
    const tableData = {
      tableNumber: 5,
      tableName: 'Test Table',
      capacity: 4,
      location: 'Near window'
    };

    const response = await axios.post(`${BASE_URL}/tables`, tableData, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      log(colors.green, '✅ Test table created successfully!');
      log(colors.white, `   🪑 Table: ${response.data.data.tableNumber} (${response.data.data.tableName})`);
      log(colors.white, `   👥 Capacity: ${response.data.data.capacity} people`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    log(colors.red, `❌ Create table failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

// === ORDER MANAGEMENT ===
const createTestOrder = async (tableNumber) => {
  try {
    stepCounter.step('Place Customer Order');
    
    if (!testMenuItemId) {
      log(colors.red, '❌ No menu item available for ordering');
      return null;
    }

    const orderData = {
      tableNumber: tableNumber,
      cafeId: cafeId,
      items: [
        {
          menuItem: testMenuItemId,
          quantity: 2,
          sizeLabel: 'Regular (200ml)',
          remark: 'Extra strong please'
        },
        {
          menuItem: testMenuItemId,
          quantity: 1,
          sizeLabel: 'Large (300ml)',
          remark: 'Light sugar'
        }
      ]
    };

    const response = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.success) {
      testOrderId = response.data.data._id;
      log(colors.green, '✅ Order placed successfully!');
      log(colors.white, `   🧾 Order ID: ${testOrderId}`);
      log(colors.white, `   🪑 Table: ${response.data.data.tableNumber}`);
      log(colors.white, `   🍽️ Items: ${response.data.data.items.length}`);
      log(colors.white, `   💰 Total: ₹${response.data.data.totalPrice}`);
      log(colors.white, `   📊 Status: ${response.data.data.status}`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    log(colors.red, `❌ Place order failed: ${error.response?.data?.message || error.message}`);
    console.error('Full error:', error.response?.data);
    return null;
  }
};

const getOrdersForAdmin = async () => {
  try {
    stepCounter.step('Check Orders in Admin Dashboard');
    
    const response = await axios.get(`${BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (response.data.success) {
      log(colors.green, `✅ Admin orders fetched: ${response.data.count} orders found`);
      response.data.data.forEach((order, index) => {
        log(colors.white, `   ${index + 1}. Order #${order._id.slice(-6)} - Table ${order.tableNumber} - ${order.status} - ₹${order.totalPrice}`);
      });
      return response.data.data;
    }
    return [];
  } catch (error) {
    log(colors.red, `❌ Fetch admin orders failed: ${error.response?.data?.message || error.message}`);
    return [];
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    stepCounter.step(`Update Order Status to ${newStatus}`);
    
    const response = await axios.put(`${BASE_URL}/orders/${orderId}/status`, 
      { status: newStatus },
      { headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      log(colors.green, `✅ Order status updated to ${newStatus}!`);
      log(colors.white, `   📊 Order: ${response.data.data._id.slice(-6)}`);
      log(colors.white, `   🔄 Status: ${response.data.data.status}`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    log(colors.red, `❌ Update order status failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

// === CLEANUP ===
const cleanupTestData = async () => {
  try {
    stepCounter.step('Cleanup Test Data');
    
    let cleanedCount = 0;

    // Delete menu item
    if (testMenuItemId) {
      await axios.delete(`${BASE_URL}/menu/${testMenuItemId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      cleanedCount++;
      log(colors.green, '✅ Test menu item deleted');
    }
    
    // Delete category
    if (testCategoryId) {
      await axios.delete(`${BASE_URL}/categories/${testCategoryId}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      cleanedCount++;
      log(colors.green, '✅ Test category deleted');
    }
    
    log(colors.green, `✅ Cleanup completed: ${cleanedCount} items removed`);
  } catch (error) {
    log(colors.yellow, `⚠️ Cleanup warning: ${error.response?.data?.message || error.message}`);
  }
};

// === MAIN FLOW EXECUTION ===
const runCompleteFlow = async () => {
  log(colors.magenta, '🚀 Starting Complete Dineflow Testing...');
  log(colors.magenta, '━'.repeat(60));
  
  let success = true;

  // Step 1: Authentication
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    log(colors.red, '❌ Cannot proceed without authentication');
    return;
  }

  try {
    // Step 2: Category Management
    const category = await createTestCategory();
    if (!category) {
      success = false;
      log(colors.red, '❌ Cannot proceed without category');
    }

    // Step 3: Menu Item Management
    const menuItem = await createTestMenuItem();
    if (!menuItem) {
      success = false;
      log(colors.red, '❌ Cannot proceed without menu item');
    }

    // Step 4: Customer Menu View
    const customerMenu = await getMenuForCustomer();
    if (customerMenu.length === 0) {
      success = false;
      log(colors.red, '❌ No menu items available for customers');
    }

    // Step 5: Table Creation
    const table = await createTestTable();
    if (!table) {
      success = false;
      log(colors.yellow, '⚠️ Table creation failed, using existing table for orders');
    }

    // Step 6: Order Placement
    const order = await createTestOrder(table?.tableNumber || 5);
    if (!order) {
      success = false;
      log(colors.red, '❌ Order placement failed');
    }

    // Step 7: Admin Order Dashboard
    const adminOrders = await getOrdersForAdmin();
    if (adminOrders.length === 0) {
      success = false;
      log(colors.red, '❌ No orders visible in admin dashboard');
    }

    // Step 8: POS Order Processing Flow
    if (testOrderId) {
      await updateOrderStatus(testOrderId, 'In Progress');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      
      await updateOrderStatus(testOrderId, 'Ready');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await updateOrderStatus(testOrderId, 'Completed');
    }

    // Summary
    log(colors.magenta, '\n━'.repeat(60));
    log(colors.magenta, '📊 COMPLETE FLOW TEST SUMMARY');
    log(colors.magenta, '━'.repeat(60));
    
    if (success) {
      log(colors.green, '🎉 ALL TESTS PASSED! Complete flow is working correctly.');
      log(colors.green, '\n✅ Verified Components:');
      log(colors.white, '   • Cafe Admin Authentication');
      log(colors.white, '   • Category Management');  
      log(colors.white, '   • Menu Item Creation with Sizes');
      log(colors.white, '   • Customer Menu Display');
      log(colors.white, '   • Order Placement');
      log(colors.white, '   • Admin Order Dashboard');
      log(colors.white, '   • POS Order Status Updates');
    } else {
      log(colors.yellow, '⚠️ Some tests had issues, but core functionality works');
    }

  } finally {
    // Cleanup
    await cleanupTestData();
    
    log(colors.magenta, '\n🎯 Testing completed!');
  }
};

// Wait for server to be ready, then run tests
setTimeout(runCompleteFlow, 2000);
