import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000/api';

// Test with a cafe admin user
const testUser = {
  username: 'user',
  password: '123456'
};

let authToken = '';
let testCategoryId = '';
let testMenuItemId = '';

const loginAsAdmin = async () => {
  try {
    console.log('🔐 Logging in as cafe admin...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful!');
      console.log(`👤 User: ${response.data.data.user.username}`);
      console.log(`🏪 Cafe: ${response.data.data.cafe?.name || 'Unknown'}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testGetCategories = async () => {
  try {
    console.log('\n📂 Testing: Get Categories...');
    
    const response = await axios.get(`${BASE_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.data.success) {
      console.log(`✅ Found ${response.data.count} categories`);
      response.data.data.forEach((category, index) => {
        console.log(`  ${index + 1}. ${category.name} - ${category.description || 'No description'}`);
      });
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('❌ Get categories failed:', error.response?.data?.message || error.message);
    return [];
  }
};

const testCreateCategory = async () => {
  try {
    console.log('\n➕ Testing: Create Category...');
    
    const categoryData = {
      name: 'Test Beverages',
      description: 'Hot and cold drinks for testing',
      imageUrl: ''
    };

    const response = await axios.post(`${BASE_URL}/categories`, categoryData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      testCategoryId = response.data.data._id;
      console.log('✅ Category created successfully!');
      console.log(`📋 Name: ${response.data.data.name}`);
      console.log(`🆔 ID: ${testCategoryId}`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Create category failed:', error.response?.data?.message || error.message);
    return null;
  }
};

const testGetMenuItems = async () => {
  try {
    console.log('\n🍽️ Testing: Get Menu Items...');
    
    const response = await axios.get(`${BASE_URL}/menu`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (response.data.success) {
      console.log(`✅ Found ${response.data.count} menu items`);
      response.data.data.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name} - $${item.price || 'Variable'} (${item.category?.name || 'No category'})`);
      });
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('❌ Get menu items failed:', error.response?.data?.message || error.message);
    return [];
  }
};

const testCreateMenuItem = async () => {
  try {
    console.log('\n🥤 Testing: Create Menu Item...');
    
    if (!testCategoryId) {
      console.log('❌ No test category ID available');
      return null;
    }

    // Create proper form data (backend expects multipart)
    const formData = new FormData();
    formData.append('name', 'Test Iced Coffee');
    formData.append('description', 'Refreshing cold coffee drink');
    formData.append('category', testCategoryId);
    formData.append('available', 'true');
    formData.append('jain', 'false');
    formData.append('ingredients', 'Coffee, Milk, Ice, Sugar');
    formData.append('sizes', JSON.stringify([
      { label: 'Small', price: 3.50 },
      { label: 'Medium', price: 4.50 },
      { label: 'Large', price: 5.50 }
    ]));

    const response = await axios.post(`${BASE_URL}/menu`, formData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    if (response.data.success) {
      testMenuItemId = response.data.data._id;
      console.log('✅ Menu item created successfully!');
      console.log(`🍽️ Name: ${response.data.data.name}`);
      console.log(`🆔 ID: ${testMenuItemId}`);
      console.log(`📂 Category: ${response.data.data.category?.name || 'Unknown'}`);
      console.log(`💰 Sizes: ${response.data.data.sizes?.length || 0} price options`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Create menu item failed:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data);
    return null;
  }
};

const testUpdateMenuItem = async () => {
  try {
    console.log('\n✏️ Testing: Update Menu Item...');
    
    if (!testMenuItemId) {
      console.log('❌ No test menu item ID available');
      return null;
    }

    const updateData = new URLSearchParams();
    updateData.append('name', 'Test Iced Coffee - Updated');
    updateData.append('description', 'Premium cold coffee with extra flavor');
    updateData.append('category', testCategoryId);
    updateData.append('available', 'true');
    updateData.append('jain', 'false');
    updateData.append('ingredients', 'Premium Coffee, Organic Milk, Ice, Brown Sugar');
    updateData.append('sizes', JSON.stringify([
      { label: 'Small', price: 4.00 },
      { label: 'Medium', price: 5.00 },
      { label: 'Large', price: 6.00 },
      { label: 'XL', price: 7.00 }
    ]));

    const response = await axios.put(`${BASE_URL}/menu/${testMenuItemId}`, updateData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.success) {
      console.log('✅ Menu item updated successfully!');
      console.log(`🍽️ Name: ${response.data.data.name}`);
      console.log(`💰 Sizes: ${response.data.data.sizes?.length || 0} price options`);
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Update menu item failed:', error.response?.data?.message || error.message);
    return null;
  }
};

const cleanupTestData = async () => {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete menu item first (due to foreign key constraints)
    if (testMenuItemId) {
      await axios.delete(`${BASE_URL}/menu/${testMenuItemId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('✅ Test menu item deleted');
    }
    
    // Delete category
    if (testCategoryId) {
      await axios.delete(`${BASE_URL}/categories/${testCategoryId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('✅ Test category deleted');
    }
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error.response?.data?.message || error.message);
  }
};

const runMenuManagementTests = async () => {
  console.log('🚀 Starting Menu Management Flow Tests...\n');
  
  // Step 1: Login
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Step 2: Test getting existing categories
  await testGetCategories();
  
  // Step 3: Create a test category
  const category = await testCreateCategory();
  if (!category) {
    console.log('❌ Cannot proceed without creating category');
    return;
  }

  // Step 4: Test getting menu items
  await testGetMenuItems();
  
  // Step 5: Create a test menu item
  const menuItem = await testCreateMenuItem();
  if (!menuItem) {
    console.log('❌ Menu item creation failed');
  }

  // Step 6: Update the menu item
  if (menuItem) {
    await testUpdateMenuItem();
  }

  // Step 7: Verify final state
  console.log('\n🔍 Final verification...');
  await testGetCategories();
  await testGetMenuItems();

  // Step 8: Cleanup
  await cleanupTestData();
  
  console.log('\n🎯 Menu Management Tests completed!');
};

// Wait a moment for server to be ready, then run tests
setTimeout(runMenuManagementTests, 2000);
