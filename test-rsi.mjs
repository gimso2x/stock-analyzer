// Quick test for RSI calculation
import { calculateRSI } from './lib/indicators.js';

// Test data - AAPL closing prices (sample)
const testPrices = [
  278.02, 273.85, 274.35, 271.59, 271.94, 273.41, 270.72, 272.11, 273.55, 273.14,
  273.50, 272.82, 271.61, 270.76, 267.01, 262.11, 260.09, 258.80, 259.13, 260.01,
  260.81, 259.72, 257.97, 255.29, 246.47, 247.42, 248.12, 247.81, 255.17, 258.03,
  256.20, 258.04, 259.24, 269.76, 269.23, 276.23, 275.65, 277.86, 274.62, 273.68,
  275.50, 261.73, 255.78, 263.88, 264.35, 260.58, 264.58, 266.18, 272.14,
];

const rsi = calculateRSI(testPrices, 14);

console.log('RSI Values (last 10):');
const validRsi = rsi.filter(v => !isNaN(v));
console.log(JSON.stringify(validRsi.slice(-10), null, 2));

console.log('\n=== RSI Verification ===');
console.log('Total RSI values:', validRsi.length);
console.log('Min RSI:', Math.min(...validRsi));
console.log('Max RSI:', Math.max(...validRsi));
console.log('All in range 0-100?', validRsi.every(v => v >= 0 && v <= 100));
console.log('All values same?', validRsi.every(v => v === validRsi[0]));
console.log('\nLast RSI value:', validRsi[validRsi.length - 1]);

// Check if values are reasonable (not all 0, all 100, or all same)
const hasVariation = new Set(validRsi).size > 5;
console.log('Has sufficient variation?', hasVariation);

if (hasVariation && validRsi.every(v => v >= 0 && v <= 100)) {
  console.log('\n✅ RSI calculation looks correct!');
  process.exit(0);
} else {
  console.log('\n❌ RSI calculation issue detected!');
  process.exit(1);
}
