# DineFlow E2E Test Suite

A comprehensive end-to-end test script for the DineFlow multi-tenant cafe management system.

## Overview

This test suite validates the complete working flow for a single cafe in DineFlow, covering both admin panel and customer-side interactions.

## Features Tested

### Admin Flow
- ✅ Admin authentication and login
- ✅ Cafe information verification
- ✅ Plan limits verification
- ✅ Menu management (CRUD operations)
- ✅ Order management and status updates
- ✅ Analytics and reporting

### Customer Flow
- ✅ Public menu fetching
- ✅ Order placement
- ✅ Payment simulation
- ✅ Order verification in admin panel

### Verification Tests
- ✅ Cross-flow verification (customer orders appear in admin)
- ✅ Analytics updates after orders
- ✅ Order status management
- ✅ Data cleanup after tests

## Prerequisites

1. **Node.js** (version 14 or higher)
2. **DineFlow Backend** running on `http://localhost:5000`
3. **Test Cafe Admin Account** with credentials:
   - Username: `procafeadmin`
   - Password: `password123`

## Installation

1. Install dependencies:
```bash
npm install
```

Or if you prefer to install axios directly:
```bash
npm install axios
```

## Running the Tests

### Basic Execution
```bash
npm test
```

Or directly with Node:
```bash
node testCafeFlow.js
```

### Expected Output

The test will provide detailed console output with:
- 🔧 **Admin Flow Testing** - Authentication, cafe info, plan limits
- 📖 **Menu Management Testing** - CRUD operations on menu items
- 📋 **Order Management Testing** - Fetching and updating orders
- 📈 **Analytics Testing** - Retrieving cafe analytics
- 🛍️ **Customer Flow Testing** - Public menu and order placement
- 🔍 **Post-Order Verification** - Cross-validation between flows
- 🧹 **Cleanup** - Removing test data
- 📊 **Test Summary** - Final results table

### Sample Output
```
🚀 Starting DineFlow E2E Test Suite
=====================================

🔧 ADMIN FLOW TESTING
=====================

🔐 Logging in as cafe admin...
✅ PASSED: Admin Login - Successfully authenticated

🏪 Verifying cafe information...
✅ PASSED: Cafe Info Verification - Cafe ID: 12345, Name: Pro Cafe

...

📊 TEST SUMMARY
===============

Total Tests: 15
✅ Passed: 14
❌ Failed: 1
Success Rate: 93.3%
```

## Test Configuration

You can modify the test configuration at the top of `testCafeFlow.js`:

```javascript
const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
    username: 'procafeadmin',
    password: 'password123'
};
```

## API Endpoints Tested

The test script validates the following API endpoints:

### Authentication
- `POST /api/auth/login`

### Cafe Management
- `GET /api/cafe/info`
- `GET /api/cafe/plan-limits`

### Menu Management
- `GET /api/menu/items`
- `POST /api/menu/items`
- `PUT /api/menu/items/:id`
- `DELETE /api/menu/items/:id`

### Order Management
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

### Analytics
- `GET /api/analytics/summary`

### Public APIs
- `GET /api/public/cafe/:id/menu`

### Payment Webhook
- `POST /api/payments/webhook/success`

## Test Data Management

The script automatically:
- Creates test menu items during execution
- Places test customer orders
- Cleans up all test data at the end
- Handles errors gracefully without leaving orphaned data

## Error Handling

The test includes comprehensive error handling:
- Network timeouts and connection errors
- Authentication failures
- API response validation
- Graceful cleanup on failures
- Detailed error reporting in the summary

## Extending the Tests

The script is modular and can be easily extended. Each test function is independent and can be used separately:

```javascript
const { loginAdmin, createMenuItem, fetchAnalytics } = require('./testCafeFlow');

// Use individual functions for custom testing
async function customTest() {
    const token = await loginAdmin();
    // Your custom test logic
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure DineFlow backend is running on localhost:5000
2. **Authentication Failed**: Verify the admin credentials exist in your database
3. **Test Data Conflicts**: Clear any existing test data with similar names
4. **Network Timeouts**: Check if the backend is responsive and not overloaded

### Debug Mode

For detailed debugging, you can modify the axios configuration to include request/response logging:

```javascript
// Add this to createAuthenticatedAxios function for debugging
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request.url);
    return request;
});
```

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Use the `logTest()` function for consistent logging
3. Ensure proper cleanup of test data
4. Add error handling for all API calls
5. Update this README with new endpoints tested

## License

MIT License - See package.json for details.

# DineFlow

DineFlow is a modern MERN-stack application designed to streamline the dine-in ordering experience. It offers a seamless interface for customers, kitchen staff, and administrators, ensuring efficient order management and real-time updates.

## Features

- **Customer Interface**: Scan QR codes to browse menus, place orders, and track order status in real-time.
- **Kitchen Dashboard**: View incoming orders, update order statuses, and manage preparation queues.
- **Admin Panel**: Manage menu items, tables, monitor payments, and access sales analytics.
- **Real-time Updates**: Leveraging Socket.IO for instant communication across the platform.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code Generation**: qrcode library
  
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Dhruvjainn11/DineFlow.git

2. Navigate to the project directory:
   
   cd DineFlow

4. Install server dependencies:
   
   cd server

   npm install

5. Set up environment variables:

Create a .env file in the server directory.

Add the following variables:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

6. Start the server:

   npm run dev


6. 🚧 Future Improvements
Role-based Access (e.g. staff)

Sales & Order Report Downloads

PWA Support

Feedback & Ratings System

Multi-language Support



## Postman Collection

A comprehensive Postman collection is available to test all API endpoints. You can import the collection using the following link:

[Download Postman Collection](./Postman/DineFlow_POSTMAN-COLLECTION.json)

Ensure to set the appropriate environment variables and headers as required.


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.


