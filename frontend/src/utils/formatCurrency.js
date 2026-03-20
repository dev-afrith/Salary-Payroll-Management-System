/**
 * Format a number as Indian Rupees (₹1,25,000.00)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const [intPart, decPart] = absNum.toFixed(2).split('.');

  // Indian grouping: last 3 digits, then groups of 2
  let result = '';
  const len = intPart.length;
  if (len <= 3) {
    result = intPart;
  } else {
    result = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + ',' + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      result = remaining + ',' + result;
    }
  }

  return `${isNegative ? '-' : ''}₹${result}.${decPart}`;
};

/**
 * Format as short currency (₹1.25L, ₹10.5Cr)
 */
export const formatShortCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

/**
 * Simple Indian format without decimals: ₹1,25,000
 */
export const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

