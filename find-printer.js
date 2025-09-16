const { execSync } = require('child_process');

console.log('🔍 Finding Available Printers...\n');

try {
  // Get all printers
  const output = execSync('wmic printer get name,drivername,portname', { encoding: 'utf8' });
  
  console.log('Available Printers:');
  console.log('==================');
  console.log(output);
  
  // Get default printer
  try {
    const defaultPrinter = execSync('wmic printer where default=true get name', { encoding: 'utf8' });
    console.log('\nDefault Printer:');
    console.log('===============');
    console.log(defaultPrinter);
  } catch (e) {
    console.log('No default printer set');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}