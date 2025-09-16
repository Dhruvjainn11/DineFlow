import { useEffect } from 'react';
import { socket } from '../utils/socket';

const useOrderAutoPrint = (enabled = false) => {
  useEffect(() => {
    if (!enabled) return;

    const handleAutoPrint = (orderData) => {
      console.log('🖨️ Auto-printing order:', orderData.orderNumber);
      
      // Generate and print ticket
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      const ticketHTML = generateTicketHTML(orderData);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Order #${orderData.orderNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 10px; 
                width: 300px;
              }
              .ticket { white-space: pre-line; }
              @media print { 
                body { margin: 0; padding: 5px; }
                @page { margin: 0; }
              }
            </style>
          </head>
          <body onload="setTimeout(() => { window.print(); window.close(); }, 1000);">
            <div class="ticket">${ticketHTML}</div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    };

    socket.on('autoPrintOrder', handleAutoPrint);

    return () => {
      socket.off('autoPrintOrder', handleAutoPrint);
    };
  }, [enabled]);
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

export default useOrderAutoPrint;