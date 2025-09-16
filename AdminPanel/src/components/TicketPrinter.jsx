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
    const printWindow = window.open('', '_blank');
    const ticketContent = `
      <html>
        <head>
          <title>Order Ticket</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              margin: 0; 
              padding: 20px;
              width: 300px;
            }
            .ticket { 
              white-space: pre-line; 
              text-align: left;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">${generateTicketHTML(order)}</div>
        </body>
      </html>
    `;
    
    printWindow.document.write(ticketContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    if (onPrint) onPrint();
  };

  const generateTicketHTML = (order) => {
    const cafeName = order.planType === 'pro' ? order.cafeName || 'THE YARD' : 'ANNSh';
    
    let ticket = '';
    ticket += '------------------------------\n';
    ticket += `        ${cafeName}\n`;
    ticket += '------------------------------\n';
    ticket += `Table: ${order.tableNumber}\n`;
    ticket += `Order #: #${order.orderNumber}\n`;
    ticket += `Time: ${formatDate(order.createdAt)}\n`;
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