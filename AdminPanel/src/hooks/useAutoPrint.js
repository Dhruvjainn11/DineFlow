import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useAutoPrint = (cafeId, autoPrintEnabled = false) => {
  useEffect(() => {
    if (!cafeId || !autoPrintEnabled) return;

    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    
    socket.emit('joinCafe', cafeId);
    
    socket.on('newOrder', (order) => {
      if (autoPrintEnabled) {
        // Auto-print new orders
        const printOrder = {
          orderNumber: order._id.slice(-4),
          tableNumber: order.tableNumber,
          createdAt: order.createdAt,
          total: order.finalAmount,
          items: order.items.map(item => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.itemPrice
          }))
        };
        
        autoPrintTicket(printOrder);
      }
    });

    return () => socket.disconnect();
  }, [cafeId, autoPrintEnabled]);
};

const autoPrintTicket = (order) => {
  const printWindow = window.open('', '_blank');
  const ticketContent = generateTicketHTML(order);
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Auto Print Ticket</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 300px; }
          .ticket { white-space: pre-line; }
          @media print { body { margin: 0; padding: 5px; } }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="ticket">${ticketContent}</div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

const generateTicketHTML = (order) => {
  let ticket = '------------------------------\n';
  ticket += '        THE YARD - ANNSh\n';
  ticket += '------------------------------\n';
  ticket += `Table: ${order.tableNumber}\n`;
  ticket += `Order #: #${order.orderNumber}\n`;
  ticket += `Time: ${new Date(order.createdAt).toLocaleString('en-IN')}\n`;
  ticket += '------------------------------\n';

  order.items.forEach(item => {
    const itemLine = `${item.quantity}x ${item.name}`;
    const price = `₹${item.price * item.quantity}`;
    const padding = 30 - itemLine.length - price.length;
    ticket += `${itemLine}${' '.repeat(Math.max(1, padding))}${price}\n`;
  });

  ticket += '------------------------------\n';
  ticket += `Total:${' '.repeat(19)}₹${order.total}\n`;
  ticket += '------------------------------\n';
  ticket += '          THANK YOU!\n';
  ticket += '------------------------------\n';

  return ticket;
};

export default useAutoPrint;