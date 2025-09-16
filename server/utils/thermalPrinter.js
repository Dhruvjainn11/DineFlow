import { generateTicket } from './ticketGenerator.js';

// For future thermal printer integration
const printToThermalPrinter = async (order, printerName = null) => {
  try {
    const ticketText = generateTicket(order);
    
    // For now, just log the ticket (thermal printer setup needed)
    console.log('Ticket to print:');
    console.log(ticketText);
    
    return { success: true, ticket: ticketText };
  } catch (error) {
    console.error('Printing error:', error);
    return { success: false, error: error.message };
  }
};

// Manual thermal printer setup instructions:
// 1. Install: npm install @node-escpos/core @node-escpos/usb-adapter
// 2. For USB: const escpos = require('@node-escpos/core'); const USB = require('@node-escpos/usb-adapter');
// 3. For network: const Network = require('@node-escpos/network-adapter');

export { printToThermalPrinter };