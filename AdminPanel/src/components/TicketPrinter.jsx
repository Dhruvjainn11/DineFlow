import React from 'react';

const TicketPrinter = ({ order, onPrint }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePrint = () => {
    console.log('🖨️ Manual print clicked for order:', order.orderNumber);
    console.log('Order data:', order);
    
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      
      if (!printWindow) {
        console.error('❌ Popup blocked for manual print');
        alert('Popup blocked! Please allow popups and try again.');
        return;
      }
      
      console.log('✅ Print window opened successfully');
      
      const ticketContent = `
        <html>
          <head>
            <title>Order #${order.orderNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 6px; 
                margin: 0; 
                padding: 2px;
                width: 220px;
                line-height: 1.1;
              }
              .ticket { 
                white-space: pre-line;
                font-size: 6px;
                word-wrap: break-word;
              }
              @media print { 
                body { 
                  margin: 1mm; 
                  padding: 1mm;
                  width: 58mm;
                  font-size: 5px;
                }
                @page { 
                  margin: 1mm;
                  size: 60mm auto;
                }
              }
            </style>
          </head>
          <body onload="setTimeout(() => { window.print(); setTimeout(() => window.close(), 1000); }, 300);">
            <div class="ticket">${generateTicketHTML(order)}</div>
          </body>
        </html>
      `;
      
      printWindow.document.write(ticketContent);
      printWindow.document.close();
      
      // Wait for content to load, then print automatically
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      }, 500);
      
      if (onPrint) onPrint();
      
    } catch (error) {
      console.error('Print error:', error);
      alert('Print failed: ' + error.message);
    }
  };

  const generateTicketHTML = (order) => {
    const cafeName = order.planType === 'pro' ? order.cafeName || 'THE YARD' : 'ANNSh';
    
    let ticket = '';
    ticket += '----------------------------\n';
    ticket += `      ${cafeName}\n`;
    ticket += '----------------------------\n';
    ticket += `T:${order.tableNumber} #${order.orderNumber}\n`;
    ticket += `${new Date(order.createdAt).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', 
      hour: '2-digit', minute: '2-digit' 
    })}\n`;
    ticket += '----------------------------\n';

    order.items.forEach(item => {
      // Check for size in different possible locations
      const sizeInfo = item.size || item.sizeLabel || (item.menuItem && item.menuItem.selectedSize);
      const sizePart = sizeInfo ? ` (${sizeInfo})` : '';
      const itemLine = `${item.quantity}x ${item.name}${sizePart}`;
      const price = `₹${item.price * item.quantity}`;
      const padding = 28 - itemLine.length - price.length;
      ticket += `${itemLine}${' '.repeat(Math.max(1, padding))}${price}\n`;
    });

    ticket += '----------------------------\n';

    return ticket;
  };

  return (
    <div className="ticket-printer">
      <button 
        onClick={handlePrint}
        className="print-btn"
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Print Ticket
      </button>
    </div>
  );
};

export default TicketPrinter;