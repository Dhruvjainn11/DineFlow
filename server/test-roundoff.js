// Test round-off calculation
import { calculateOrderTotal } from './utils/gstCalculator.js';

// Test cases
const testItems = [
  { itemPrice: 25.46, quantity: 1 }, // Should round down to 25
  { itemPrice: 25.67, quantity: 1 }, // Should round up to 26
  { itemPrice: 50.50, quantity: 1 }, // Should round up to 51
];

const cafeSettings = {
  hasGST: false,
  serviceCharge: 0
};

console.log('Testing round-off calculations:');
console.log('================================');

testItems.forEach((item, index) => {
  const result = calculateOrderTotal([item], cafeSettings);
  console.log(`Test ${index + 1}:`);
  console.log(`  Item Price: ₹${item.itemPrice}`);
  console.log(`  Total Amount: ₹${result.totalAmount}`);
  console.log(`  Round Off: ₹${result.roundOffAmount}`);
  console.log(`  Final Amount: ₹${result.finalAmount}`);
  console.log('---');
});