# Auto-Print Testing Commands

## 1. Server-Side Testing
```bash
# Terminal 1 - Start server
cd server
npm start
# Watch console for "Ticket to print:" messages

# Terminal 2 - Run test script
cd DineFlow
node test-auto-print.js
```

## 2. Frontend Auto-Print Testing
```bash
# Terminal 3 - Start admin panel
cd AdminPanel
npm start
# Go to: http://localhost:3000/admin/auto-print-test
```

## 3. Customer Order Testing
```bash
# Terminal 4 - Start customer side
cd CustomerSide  
npm start
# Go to: http://localhost:3000/cafe/[cafeId]/table/[tableId]
# Place order and watch admin panel auto-print
```

## 4. API Testing with curl
```bash
# Direct API test
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "your-table-id",
    "items": [
      {
        "menuItem": "your-menu-item-id",
        "quantity": 2
      }
    ]
  }'
```

## 5. WebSocket Testing
```javascript
// Browser console test
const socket = io('http://localhost:5000');
socket.emit('authenticate', 'your-token');
socket.on('newOrder', (order) => {
  console.log('New order:', order);
  // Auto-print will trigger
});
```

## Expected Results:
- ✅ Server console shows formatted ticket
- ✅ Admin panel shows print dialog automatically  
- ✅ Browser console shows auto-print logs
- ✅ Print preview shows correct cafe name based on plan