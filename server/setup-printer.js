import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { execSync } from 'child_process';

// List available printers
const listPrinters = () => {
  try {
    console.log('🖨️ Available Printers:');
    console.log('=====================');
    
    // Windows command to list printers
    const output = execSync('wmic printer get name', { encoding: 'utf8' });
    const printers = output.split('\n')
      .filter(line => line.trim() && !line.includes('Name'))
      .map(line => line.trim());
    
    printers.forEach((printer, index) => {
      console.log(`${index + 1}. ${printer}`);
    });
    
    return printers;
  } catch (error) {
    console.error('Error listing printers:', error.message);
    return [];
  }
};

// Test printer connection
const testPrinter = async (printerName) => {
  try {
    console.log(`\n🔍 Testing printer: ${printerName}`);
    
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `printer:${printerName}`,
      removeSpecialCharacters: false,
    });

    const isConnected = await printer.isPrinterConnected();
    
    if (isConnected) {
      console.log('✅ Printer connected successfully!');
      
      // Print test ticket
      printer.alignCenter();
      printer.println('TEST PRINT');
      printer.println('DineFlow System');
      printer.drawLine();
      printer.alignLeft();
      printer.println('Printer: ' + printerName);
      printer.println('Time: ' + new Date().toLocaleString());
      printer.drawLine();
      printer.println('✅ Connection successful!');
      printer.cut();
      
      await printer.execute();
      console.log('🎉 Test ticket printed!');
      
      return true;
    } else {
      console.log('❌ Printer not connected');
      return false;
    }
  } catch (error) {
    console.log('❌ Printer test failed:', error.message);
    return false;
  }
};

// Main setup function
const setupPrinter = async () => {
  console.log('🚀 DineFlow Printer Setup');
  console.log('=========================\n');
  
  const printers = listPrinters();
  
  if (printers.length === 0) {
    console.log('❌ No printers found. Please install printer drivers first.');
    return;
  }
  
  // Test each printer
  for (const printer of printers) {
    const success = await testPrinter(printer);
    if (success) {
      console.log(`\n✅ Use this printer name in your code: "${printer}"`);
      break;
    }
  }
};

// Run setup
setupPrinter();