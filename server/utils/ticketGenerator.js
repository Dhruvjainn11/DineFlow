const generateTicket = (order) => {
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

  const formatPrice = (price) => `₹${price}`;

  let ticket = '';
  ticket += '------------------------------\n';
  ticket += '        THE YARD - ANNSh\n';
  ticket += '------------------------------\n';
  ticket += `Table: ${order.tableNumber}\n`;
  ticket += `Order #: #${order.orderNumber}\n`;
  ticket += `Time: ${formatDate(order.createdAt)}\n`;
  ticket += '------------------------------\n';

  order.items.forEach(item => {
    const itemLine = `${item.quantity}x ${item.name}`;
    const price = formatPrice(item.price * item.quantity);
    const padding = 30 - itemLine.length - price.length;
    ticket += `${itemLine}${' '.repeat(Math.max(1, padding))}${price}\n`;
  });

  ticket += '------------------------------\n';
  ticket += `Total:${' '.repeat(19)}${formatPrice(order.total)}\n`;
  ticket += '------------------------------\n';
  ticket += '          THANK YOU!\n';
  ticket += '------------------------------\n';

  return ticket;
};

export { generateTicket };