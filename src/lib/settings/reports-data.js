/**
 * Reports Data Structure
 * Hardcoded data for Reports
 */

// Sales by Date
export const SALES_BY_DATE = [
  { date: "2024-01-20", transactions: 4, total: 84.2, memberSpend: 59.4, guestSpend: 24.8 },
  { date: "2024-01-19", transactions: 2, total: 59.4, memberSpend: 59.4, guestSpend: 0 },
  { date: "2024-01-18", transactions: 1, total: 19.8, memberSpend: 0, guestSpend: 19.8 },
  { date: "2024-01-17", transactions: 0, total: 0, memberSpend: 0, guestSpend: 0 },
  { date: "2024-01-16", transactions: 1, total: 11.0, memberSpend: 11.0, guestSpend: 0 },
];

// Sales by Category
export const SALES_BY_CATEGORY = [
  { category: "Court Rental", transactions: 3, total: 86.9, percentage: 51.2 },
  { category: "Equipment", transactions: 5, total: 58.8, percentage: 34.7 },
  { category: "Beverages", transactions: 0, total: 0, percentage: 0 },
  { category: "Lessons", transactions: 0, total: 0, percentage: 0 },
];

// Top Selling Products
export const TOP_SELLING_PRODUCTS = [
  { productId: 1, productName: "Court Rental - 1 Hour", category: "Court Rental", quantity: 3, revenue: 75.0 },
  { productId: 4, productName: "Racket Rental - Premium", category: "Equipment", quantity: 4, revenue: 32.0 },
  { productId: 9, productName: "Grip Tape", category: "Equipment", quantity: 3, revenue: 18.0 },
  { productId: 5, productName: "Balls (3 pack)", category: "Equipment", quantity: 1, revenue: 8.0 },
  { productId: 2, productName: "Court Rental - 2 Hours", category: "Court Rental", quantity: 1, revenue: 59.4 },
];

// Inventory Movement
export const INVENTORY_MOVEMENT = [
  { date: "2024-01-20", productId: 1, productName: "Court Rental - 1 Hour", action: "sale", quantity: -1, stockBefore: 11, stockAfter: 10 },
  { date: "2024-01-20", productId: 4, productName: "Racket Rental - Premium", action: "sale", quantity: -2, stockBefore: 12, stockAfter: 10 },
  { date: "2024-01-19", productId: 2, productName: "Court Rental - 2 Hours", action: "sale", quantity: -1, stockBefore: 6, stockAfter: 5 },
  { date: "2024-01-18", productId: 9, productName: "Grip Tape", action: "sale", quantity: -3, stockBefore: 23, stockAfter: 20 },
  { date: "2024-01-16", productId: 1, productName: "Court Rental - 1 Hour", action: "restock", quantity: 5, stockBefore: 6, stockAfter: 11 },
];

// Member vs Guest Spend
export const MEMBER_VS_GUEST_SPEND = {
  member: {
    transactions: 3,
    total: 130.4,
    average: 43.47,
    percentage: 79.8,
  },
  guest: {
    transactions: 2,
    total: 33.0,
    average: 16.5,
    percentage: 20.2,
  },
  total: {
    transactions: 5,
    total: 163.4,
  },
};
