import React, { useState } from 'react';
import useAutoPrint from '../hooks/useAutoPrint';
import TicketPrinter from '../components/TicketPrinter';

const TestPrint = () => {
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(false);
  const cafeId = "your-cafe-id"; // Replace with actual cafe ID
  
  // Enable auto-printing for new orders
  useAutoPrint(cafeId, autoPrintEnabled);

  // Test order data
  const testOrder = {
    orderNumber: "1023",
    tableNumber: "5",
    createdAt: new Date(),
    total: 390,
    planType: "pro", // Change to "basic" to test ANNSh
    cafeName: "THE YARD",
    items: [
      { name: "Cold Coffee", quantity: 2, price: 120 },
      { name: "Sandwich", quantity: 1, price: 150 }
    ]
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Test Ticket Printing</h2>
      
      {/* Auto-print toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={autoPrintEnabled}
            onChange={(e) => setAutoPrintEnabled(e.target.checked)}
          />
          <span>Auto-print new orders</span>
        </label>
        <p className="text-sm text-gray-500 mt-1">
          {autoPrintEnabled ? "✅ Auto-print enabled" : "❌ Auto-print disabled"}
        </p>
      </div>

      {/* Manual test print */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-2">Test Order #1023</h3>
        <p>Table: 5</p>
        <p>Items: 2x Cold Coffee, 1x Sandwich</p>
        <p>Total: ₹390</p>
        
        <div className="mt-4">
          <TicketPrinter 
            order={testOrder}
            onPrint={() => console.log('Test print completed')}
          />
        </div>
      </div>

      {/* Test different plans */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h4 className="font-bold">Pro Plan Test</h4>
          <TicketPrinter 
            order={{...testOrder, planType: "pro", cafeName: "My Cafe"}}
            onPrint={() => console.log('Pro plan test')}
          />
        </div>
        
        <div className="border p-4 rounded">
          <h4 className="font-bold">Basic Plan Test</h4>
          <TicketPrinter 
            order={{...testOrder, planType: "basic"}}
            onPrint={() => console.log('Basic plan test')}
          />
        </div>
      </div>
    </div>
  );
};

export default TestPrint;