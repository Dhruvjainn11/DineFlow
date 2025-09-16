import { useEffect } from 'react';
import { socket } from '../utils/socket';

const useOrderAutoPrint = (enabled = false) => {
  useEffect(() => {
    if (!enabled) return;

    const handleAutoPrint = (orderData) => {
      console.log('🖨️ Auto-printing order:', orderData.orderNumber);
      
      try {
        // Generate and print ticket
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        
        if (!printWindow) {
          console.error('❌ Popup blocked! Please allow popups for auto-printing.');
          alert('Auto-print failed: Popup blocked. Please allow popups and try again.');
          return;
        }
        
        const ticketHTML = generateTicketHTML(orderData);
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Order #${orderData.orderNumber}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 10px; 
                  margin: 0; 
                  padding: 5px;
                  width: 250px;
                  line-height: 1.2;
                }
                .ticket { 
                  white-space: pre-line;
                  font-size: 10px;
                }
                @media print { 
                  body { 
                    margin: 0; 
                    padding: 2px;
                    width: 58mm;
                    font-size: 9px;
                  }
                  @page { 
                    margin: 0;
                    size: 58mm auto;
                  }
                }
              </style>
            </head>
            <body onload="setTimeout(() => { 
              // Try silent print first, fallback to regular print
              if (window.chrome && window.chrome.webstore) {
                // Chrome - try to print silently
                window.print();
              } else {
                window.print();
              }
              setTimeout(() => window.close(), 1500); 
            }, 300);">
              <div class="ticket">${ticketHTML}</div>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        console.log('✅ Print window opened successfully');
        
      } catch (error) {
        console.error('❌ Auto-print error:', error);
        alert('Auto-print failed: ' + error.message);
      }
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