import React from 'react';
import TicketPrinter from './TicketPrinter';

const OrderCard = ({ order, onStatusUpdate }) => {
  const formatOrderForPrint = (order) => ({
    orderNumber: order._id.slice(-4),
    tableNumber: order.tableNumber,
    createdAt: order.createdAt,
    total: order.finalAmount,
    items: order.items.map(item => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.itemPrice
    }))
  });

  return (
    <div className="order-card">
      <div className="order-header">
        <h3>Order #{order._id.slice(-4)}</h3>
        <span>Table {order.tableNumber}</span>
      </div>
      
      <div className="order-items">
        {order.items.map((item, index) => (
          <div key={index}>
            {item.quantity}x {item.menuItem.name} - ₹{item.itemPrice * item.quantity}
          </div>
        ))}
      </div>
      
      <div className="order-total">
        Total: ₹{order.finalAmount}
      </div>
      
      <div className="order-actions">
        <TicketPrinter 
          order={formatOrderForPrint(order)}
          onPrint={() => console.log('Ticket printed for order', order._id)}
        />
        
        <select onChange={(e) => onStatusUpdate(order._id, e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Ready">Ready</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default OrderCard;