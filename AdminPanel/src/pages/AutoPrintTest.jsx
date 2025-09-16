import React, { useState, useEffect } from 'react';
import { socket } from '../utils/socket';

const AutoPrintTest = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    if (isListening) {
      // Join cafe room
      socket.emit('authenticate', localStorage.getItem('token'));
      
      // Listen for new orders and auto-print
      socket.on('newOrder', (order) => {
        console.log('🔔 New order received:', order);
        setLastOrder(order);
        
        // Auto-print immediately
        autoPrintOrder(order);
      });
    }

    return () => {
      socket.off('newOrder');
    };
  }, [isListening]);

  const autoPrintOrder = (order) => {
    const printOrder = {
      orderNumber: order._id.slice(-4),
      tableNumber: order.tableNumber,
      createdAt: order.createdAt,
      planType: 'pro', // Change to 'basic' to test ANNSh
      cafeName: 'THE YARD',
      items: order.items.map(item => ({
        name: item.menuItem?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.itemPrice || 0
      }))
    };

    // Create print window
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const ticketHTML = generateTicketHTML(printOrder);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Auto Print - Order #${printOrder.orderNumber}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              margin: 10px; 
              width: 300px;
            }
            .ticket { white-space: pre-line; }
            @media print { body { margin: 0; padding: 5px; } }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 500);">
          <div class="ticket">${ticketHTML}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    console.log('🖨️ Auto-printed order:', printOrder.orderNumber);
  };

  const generateTicketHTML = (order) => {
    const cafeName = order.planType === 'pro' ? order.cafeName || 'THE YARD' : 'ANNSh';
    
    let ticket = '------------------------------\n';
    ticket += `        ${cafeName}\n`;
    ticket += '------------------------------\n';
    ticket += `Table: ${order.tableNumber}\n`;
    ticket += `Order: #${order.orderNumber}\n`;
    ticket += `Time: ${new Date(order.createdAt).toLocaleString('en-IN')}\n`;
    ticket += '------------------------------\n';

    order.items.forEach(item => {
      const itemLine = `${item.quantity}x ${item.name}`;
      const price = `₹${item.price * item.quantity}`;
      const padding = 30 - itemLine.length - price.length;
      ticket += `${itemLine}${' '.repeat(Math.max(1, padding))}${price}\n`;
    });

    ticket += '------------------------------\n';
    return ticket;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Auto-Print Testing</h2>
      
      <div className="mb-6">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`px-4 py-2 rounded font-medium ${
            isListening 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isListening ? '🛑 Stop Auto-Print' : '▶️ Start Auto-Print'}
        </button>
        
        <p className="text-sm mt-2">
          Status: {isListening ? '🟢 Listening for orders...' : '🔴 Not listening'}
        </p>
      </div>

      {lastOrder && (
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-bold mb-2">Last Auto-Printed Order:</h3>
          <p><strong>Order ID:</strong> #{lastOrder._id.slice(-4)}</p>
          <p><strong>Table:</strong> {lastOrder.tableNumber}</p>
          <p><strong>Items:</strong> {lastOrder.items.length}</p>
          <p><strong>Total:</strong> ₹{lastOrder.finalAmount}</p>
          <p><strong>Time:</strong> {new Date(lastOrder.createdAt).toLocaleString()}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Start Auto-Print" above</li>
          <li>Place an order from customer side or use test script</li>
          <li>Watch for automatic print dialog</li>
          <li>Check browser console for logs</li>
        </ol>
      </div>
    </div>
  );
};

export default AutoPrintTest;