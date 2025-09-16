import { generateTicket } from './ticketGenerator.js';

const printToSimplePrinter = async (order, cafeSettings = null) => {
  try {
    const ticketText = generateTicket(order);
    
    // Console log (always show)
    console.log('Ticket to print:');
    console.log(ticketText);
    
    // Get printer settings from cafe
    const printerSettings = cafeSettings?.printerSettings || {};
    
    // Skip printing if not enabled for this cafe
    if (!printerSettings.enabled) {
      console.log('🚫 Printing disabled for this cafe');
      return { success: true, ticket: ticketText, printed: false };
    }
    
    // For now, just log success (actual printing needs physical setup)
    console.log('✅ Ticket ready for printing');
    console.log('📋 Configure your printer manually or use browser printing from admin panel');
    
    return { success: true, ticket: ticketText, printed: false };
    
  } catch (error) {
    console.error('Printing error:', error);
    return { success: false, error: error.message };
  }
};

export { printToSimplePrinter };