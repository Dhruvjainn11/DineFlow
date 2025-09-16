import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { generateTicket } from './ticketGenerator.js';

const printToWindowsPrinter = async (order, cafeSettings = null) => {
  try {
    const ticketText = generateTicket(order);
    
    // Console log (always show)
    console.log('Ticket to print:');
    console.log(ticketText);
    
    // Get printer settings from cafe
    const printerSettings = cafeSettings?.printerSettings || {};
    const printerName = printerSettings.printerName;
    
    // Skip printing if not enabled for this cafe
    if (!printerSettings.enabled || !printerName) {
      console.log('🚫 Printing disabled or no printer configured');
      return { success: true, ticket: ticketText, printed: false };
    }
    
    try {
      // Create temp file with ticket content
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      const tempFile = path.join(tempDir, `ticket_${Date.now()}.txt`);
      fs.writeFileSync(tempFile, ticketText);
      
      // Print using Windows command
      const printCommand = `print /D:"${printerName}" "${tempFile}"`;
      execSync(printCommand, { stdio: 'ignore' });
      
      // Clean up temp file
      setTimeout(() => {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
      
      console.log(`✅ Printed to ${printerName} successfully`);
      
      // Print multiple copies if configured
      const copies = printerSettings.copies || 1;
      for (let i = 1; i < copies; i++) {
        execSync(printCommand, { stdio: 'ignore' });
        console.log(`✅ Copy ${i + 1} printed`);
      }
      
      return { success: true, ticket: ticketText, printed: true };
      
    } catch (printError) {
      console.log('⚠️ Windows printer error:', printError.message);
      console.log('📝 Ticket shown in console only');
      return { success: true, ticket: ticketText, printed: false };
    }
    
  } catch (error) {
    console.error('Printing error:', error);
    return { success: false, error: error.message };
  }
};

export { printToWindowsPrinter };