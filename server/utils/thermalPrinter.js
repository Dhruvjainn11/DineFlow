import { generateTicket } from './ticketGenerator.js';
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';

const printToThermalPrinter = async (order, cafeSettings = null) => {
  try {
    const ticketText = generateTicket(order);
    
    // Console log (always show)
    console.log('Ticket to print:');
    console.log(ticketText);
    
    // Try to print to thermal printer
    try {
      // Get printer settings from cafe or use default
      const printerSettings = cafeSettings?.printerSettings || {};
      const printerName = printerSettings.printerName || getDefaultPrinter();
      
      // Skip printing if not enabled for this cafe
      if (!printerSettings.enabled) {
        console.log('🚫 Printing disabled for this cafe');
        return { success: true, ticket: ticketText, printed: false };
      }
      
      // Handle different printer types
      const printerType = printerSettings.printerType === 'regular' ? PrinterTypes.STAR : PrinterTypes.EPSON;
      
      let printer = new ThermalPrinter({
        type: printerType,
        interface: 'printer:' + printerName,
        characterSet: CharacterSet.PC852_LATIN2,
        removeSpecialCharacters: false,
        lineCharacter: "-",
      });

      const isConnected = await printer.isPrinterConnected();
      if (isConnected) {
        printer.alignCenter();
        printer.println(order.planType === 'pro' ? order.cafeName || 'THE YARD' : 'ANNSh');
        printer.drawLine();
        printer.alignLeft();
        printer.println(`Table: ${order.tableNumber}`);
        printer.println(`Order: #${order.orderNumber}`);
        printer.println(`Time: ${new Date(order.createdAt).toLocaleString('en-IN')}`);
        printer.drawLine();
        
        order.items.forEach(item => {
          const itemLine = `${item.quantity}x ${item.name}`;
          const price = `₹${item.price * item.quantity}`;
          printer.tableCustom([
            { text: itemLine, align: "LEFT", width: 0.7 },
            { text: price, align: "RIGHT", width: 0.3 }
          ]);
        });
        
        printer.drawLine();
        printer.cut();
        
        await printer.execute();
        console.log(`✅ Printed to ${printerName} successfully`);
        
        // Print multiple copies if configured
        const copies = printerSettings.copies || 1;
        for (let i = 1; i < copies; i++) {
          await printer.execute();
          console.log(`✅ Copy ${i + 1} printed`);
        }
      } else {
        console.log('⚠️ Thermal printer not connected, showing console only');
      }
    } catch (printError) {
      console.log('⚠️ Thermal printer error:', printError.message);
      console.log('📝 Ticket shown in console only');
    }
    
    return { success: true, ticket: ticketText };
  } catch (error) {
    console.error('Printing error:', error);
    return { success: false, error: error.message };
  }
};

const getDefaultPrinter = () => {
  // Replace with your actual printer name from setup-printer.js
  return process.env.PRINTER_NAME || 'POS-80'; // Change this to your printer name
};

export { printToThermalPrinter, getDefaultPrinter };