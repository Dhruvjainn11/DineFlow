const generateTicket = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (price) => `₹${price}`;
  const cafeName = order.planType === 'pro' ? order.cafeName : 'ANNSH';

  let ticket = '';
  ticket += '----------------------------\n';
  ticket += `      ${cafeName}\n`;
  ticket += '----------------------------\n';
  ticket += `T:${order.tableNumber} #${order.orderNumber}\n`;
  ticket += `${formatDate(order.createdAt)}\n`;
  ticket += '----------------------------\n';

  order.items.forEach(item => {
    const sizePart = item.size ? ` (${item.size})` : '';
    const itemLine = `${item.quantity}x ${item.name}${sizePart}`;
    const price = formatPrice(item.price * item.quantity);
    // Adjust for 28 character width
    const padding = 28 - itemLine.length - price.length;
    ticket += `${itemLine}${' '.repeat(Math.max(1, padding))}${price}\n`;
  });

  ticket += '----------------------------\n';

  return ticket;
};

export { generateTicket };