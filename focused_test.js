const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
    username: 'procafeadmin',
    password: 'password123'
};

let authToken = null;
let cafeId = null;
const timestamp = Date.now();

async function testLogin() {
    try {
        console.log('🔐 Testing login...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (response.data && response.data.success && response.data.data && response.data.data.token) {
            authToken = response.data.data.token;
            cafeId = response.data.data.cafe.id || response.data.data.cafe._id;
            console.log('✅ Login successful');
            console.log(`   Token: ${authToken.substring(0, 20)}...`);
            console.log(`   Cafe ID: ${cafeId}`);
            return true;
        }
        return false;
    } catch (error) {
        console.log('❌ Login failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.code) {
            console.log('   Error code:', error.code);
        }
        return false;
    }
}

async function testCategoryCreation() {
    try {
        console.log('\n📂 Testing category creation...');
        const categoryData = {
            name: `Test Category ${timestamp}`,
            description: 'Test description'
        };

        const response = await axios.post(`${BASE_URL}/api/categories`, categoryData, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data?.success) {
            console.log('✅ Category created successfully');
            console.log(`   Category ID: ${response.data.data._id}`);
            return response.data.data._id;
        }
        return null;
    } catch (error) {
        console.log('❌ Category creation failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

async function testTableCreation() {
    try {
        console.log('\n🏦 Testing table creation...');
        const tableData = {
            tableNumber: Math.floor(Math.random() * 1000) + 1,
            tableName: `Test Table ${timestamp}`,
            capacity: 4,
            location: 'Test Area',
            cafeId: cafeId
        };

        const response = await axios.post(`${BASE_URL}/api/tables`, tableData, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data?.success) {
            console.log('✅ Table created successfully');
            console.log(`   Table ID: ${response.data.data._id}`);
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log('❌ Table creation failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

async function testMenuCreation(categoryId) {
    try {
        console.log('\n🍽️ Testing menu item creation...');
        const menuData = {
            name: 'Test Coffee',
            description: 'Test coffee item',
            price: 4.50,
            category: categoryId,
            available: true
        };

        const response = await axios.post(`${BASE_URL}/api/menu`, menuData, {
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data?.success) {
            console.log('✅ Menu item created successfully');
            console.log(`   Menu Item ID: ${response.data.data._id}`);
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log('❌ Menu item creation failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

async function testPublicMenu() {
    try {
        console.log('\n🌐 Testing public menu access...');
        const response = await axios.get(`${BASE_URL}/api/menu?cafeId=${cafeId}`, {
            timeout: 10000
        });

        const items = response.data?.success ? response.data.data : response.data;
        console.log(`✅ Public menu accessed successfully - ${items?.length || 0} items found`);
        return items;
    } catch (error) {
        console.log('❌ Public menu access failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        return [];
    }
}

async function testOrderPlacement(menuItems, table) {
    try {
        console.log('\n🛒 Testing order placement...');
        if (!menuItems || menuItems.length === 0) {
            console.log('❌ Cannot test order placement - no menu items available');
            return null;
        }

        if (!table) {
            console.log('❌ Cannot test order placement - no table available');
            return null;
        }

        const orderData = {
            cafeId: cafeId,
            tableNumber: table.tableNumber,
            items: [
                {
                    menuItem: menuItems[0]._id,
                    quantity: 1,
                    remark: 'Test order'
                }
            ]
        };

        const response = await axios.post(`${BASE_URL}/api/orders`, orderData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (response.data?.success) {
            console.log('✅ Order placed successfully');
            console.log(`   Order ID: ${response.data.data._id}`);
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log('❌ Order placement failed:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

async function runFocusedTests() {
    console.log('🎯 Running Focused DineFlow Tests');
    console.log('================================\n');

    // Test 1: Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
        console.log('\n❌ Cannot proceed without authentication');
        return;
    }

    // Test 2: Category creation
    const categoryId = await testCategoryCreation();

    // Test 3: Table creation  
    const table = await testTableCreation();

    // Test 4: Menu item creation
    let menuItem = null;
    if (categoryId) {
        menuItem = await testMenuCreation(categoryId);
    }

    // Test 5: Public menu access
    const publicMenu = await testPublicMenu();

    // Test 6: Order placement
    const order = await testOrderPlacement(publicMenu, table);

    console.log('\n📊 FOCUSED TEST SUMMARY');
    console.log('======================');
    console.log(`✅ Login: ${loginSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`${categoryId ? '✅' : '❌'} Category Creation: ${categoryId ? 'PASS' : 'FAIL'}`);
    console.log(`${table ? '✅' : '❌'} Table Creation: ${table ? 'PASS' : 'FAIL'}`);
    console.log(`${menuItem ? '✅' : '❌'} Menu Creation: ${menuItem ? 'PASS' : 'FAIL'}`);
    console.log(`${publicMenu?.length > 0 ? '✅' : '❌'} Public Menu: ${publicMenu?.length > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`${order ? '✅' : '❌'} Order Placement: ${order ? 'PASS' : 'FAIL'}`);
}

runFocusedTests().catch(console.error);
