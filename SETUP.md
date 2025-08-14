# DineFlow E2E Tests Setup Guide

## Quick Start

The E2E tests are now ready to run! Here are your options:

### Option 1: Run tests with automatic server startup
```bash
npm run test:with-server
```
This will automatically start the DineFlow server if it's not running and then execute the tests.

### Option 2: Start server manually and run tests
```bash
# Terminal 1: Start the server
cd server
node server.js

# Terminal 2: Run tests
npm test
```

## Prerequisites Checklist

Before running the tests, ensure:

### 1. ✅ Dependencies Installed
- **Root directory**: `npm install` (installs axios for tests)
- **Server directory**: `cd server && npm install` (installs server dependencies)

### 2. ✅ Database Setup
Your DineFlow server needs:
- **MongoDB running** (local or cloud)
- **Database connection configured** in server/.env

### 3. ✅ Environment Variables
Create `server/.env` with required variables:
```env
# Database
MONGO_URI=mongodb://localhost:27017/dineflow

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Server Port (optional, defaults to 5000)
PORT=5000
```

### 4. ✅ Test Admin User
The tests expect a cafe admin user with:
- **Username**: `procafeadmin`
- **Password**: `password123`

You can create this user by:
- Running your user creation script
- Using your admin panel
- Or manually inserting into the database

## Troubleshooting Common Issues

### ❌ Connection Refused Error
```
Server is not running on http://localhost:5000
```
**Solutions:**
1. Make sure MongoDB is running
2. Check server/.env file exists with correct database URL
3. Install server dependencies: `cd server && npm install`
4. Start server manually to see error messages: `cd server && node server.js`

### ❌ Authentication Failed
```
HTTP 401: Unauthorized
```
**Solutions:**
1. Verify the admin user exists in database
2. Check username/password in testCafeFlow.js (lines 5-8)
3. Ensure JWT_SECRET is set in server/.env

### ❌ Database Connection Error
```
MongoNetworkError: connect ECONNREFUSED
```
**Solutions:**
1. Start MongoDB service
2. Check MONGO_URI in server/.env
3. For MongoDB Atlas, ensure IP whitelist is configured

### ❌ Missing Dependencies
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
cd server
npm install
```

## Test Configuration

### Modifying Test Settings
Edit `testCafeFlow.js` to change:
```javascript
const BASE_URL = 'http://localhost:5000';  // Server URL
const ADMIN_CREDENTIALS = {
    username: 'procafeadmin',              // Admin username
    password: 'password123'                // Admin password
};
```

### API Endpoints Expected
The tests assume these endpoints exist:
- `POST /api/auth/login` - Admin authentication
- `GET /api/cafe/info` - Cafe information
- `GET /api/cafe/plan-limits` - Subscription plan limits
- `GET /api/menu/items` - Menu items CRUD
- `GET /api/orders` - Order management
- `GET /api/analytics/summary` - Analytics data
- `GET /api/public/cafe/:id/menu` - Public menu access

## Advanced Usage

### Running Individual Test Functions
```javascript
const { loginAdmin, createMenuItem } = require('./testCafeFlow');

// Use specific test functions
async function myTest() {
    const token = await loginAdmin();
    // Your custom logic
}
```

### Environment-Specific Testing
Create multiple config files for different environments:
```javascript
// testCafeFlow.staging.js
const BASE_URL = 'https://staging.dineflow.com';
```

## Test Results Interpretation

### ✅ Successful Test Output
```
Total Tests: 15
✅ Passed: 15
❌ Failed: 0
Success Rate: 100.0%
```

### ❌ Common Test Failures
- **Server Connectivity**: Server not running
- **Admin Login**: Credentials or JWT issues
- **Menu Operations**: Database permissions or schema issues
- **Order Flow**: API endpoint mismatches

## Getting Help

If you encounter issues:
1. Check the detailed error messages in the test output
2. Verify your server starts successfully: `cd server && node server.js`
3. Test individual API endpoints with Postman or curl
4. Check server logs for database/authentication errors

The E2E tests are designed to give you detailed feedback on what's working and what needs attention in your DineFlow system!
