const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test order data
const testOrder = {
  tableId: "your-table-id", // Replace with actual table ID
  items: [
    {
      menuItem: "your-menu-item-id", // Replace with actual menu item ID
      quantity: 2,
      sizeLabel: null
    },
    {
      menuItem: "your-menu-item-id-2", // Replace with another menu item ID
      quantity: 1,
      sizeLabel: null
    }
  ]
};

async function testAutoPrint() {
  try {
    console.log('🚀 Testing Auto-Print Functionality');
    console.log('=====================================');
    
    // Place order to trigger auto-print
    console.log('📝 Placing test order...');
    const response = await axios.post(`${BASE_URL}/api/orders`, testOrder);
    
    if (response.data.success) {
      console.log('✅ Order placed successfully!');
      console.log('📋 Order ID:', response.data.data._id);
      console.log('🏪 Table:', response.data.data.tableNumber);
      console.log('💰 Total:', response.data.data.finalAmount);
      console.log('\n🖨️  Check your server console for auto-printed ticket!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

// Run test
testAutoPrint();