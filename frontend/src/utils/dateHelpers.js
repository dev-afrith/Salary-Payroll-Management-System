const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format date to DD MMM YYYY (e.g. 15 Apr 2025)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const day = d.getDate().toString().padStart(2, '0');
  const month = SHORT_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Format date to YYYY-MM-DD for input fields
 */
export const formatDateInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/**
 * Get month name from 1-indexed month number
 */
export const getMonthName = (month) => {
  return MONTHS[(month - 1) % 12] || '';
};

/**
 * Get short month name
 */
export const getShortMonthName = (month) => {
  return SHORT_MONTHS[(month - 1) % 12] || '';
};

/**
 * Get current month (1-indexed) and year
 */
export const getCurrentMonthYear = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Format today's date as a readable string
 */
export const getTodayFormatted = () => {
  return formatDate(new Date());
};

export { MONTHS, SHORT_MONTHS };
