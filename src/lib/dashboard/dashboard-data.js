/**
 * Dashboard Data
 * Hardcoded metrics and statistics for the dashboard
 */

// Dashboard Metrics
export const DASHBOARD_METRICS = [
  {
    id: "sales",
    label: "Sales",
    value: 2350,
    format: "number",
    prefix: "+",
    change: {
      value: 10.5,
      type: "increase", // increase or decrease
      label: "from last month",
    },
  },
  {
    id: "active-customers",
    label: "Active Customers",
    value: 573,
    format: "number",
    prefix: "+",
    change: {
      value: 12.7,
      type: "increase",
      label: "from last month",
    },
  },
  {
    id: "inventory-value",
    label: "Inventory Value",
    value: 45231.89,
    format: "currency",
    prefix: "",
    change: {
      value: 3.2,
      type: "decrease",
      label: "from last month",
    },
  },
  {
    id: "shrinkage",
    label: "Shrinkage",
    value: 2.3,
    format: "percentage",
    prefix: "",
    change: {
      value: 0.4,
      type: "decrease",
      label: "from last month",
    },
  },
];

// Recent Activity
export const RECENT_ACTIVITY = [
  {
    id: "act-1",
    type: "sale",
    description: "Court rental completed",
    user: "John Doe (Member)",
    amount: 27.5,
    timestamp: "2026-01-13T10:30:00Z",
  },
  {
    id: "act-2",
    type: "inventory",
    description: "Racket rental stock updated",
    user: "Admin",
    quantity: 5,
    timestamp: "2026-01-13T09:15:00Z",
  },
  {
    id: "act-3",
    type: "sale",
    description: "Equipment purchase",
    user: "Jane Smith (Guest)",
    amount: 19.8,
    timestamp: "2026-01-13T08:45:00Z",
  },
  {
    id: "act-4",
    type: "customer",
    description: "New member registration",
    user: "Mike Johnson",
    timestamp: "2026-01-12T16:20:00Z",
  },
  {
    id: "act-5",
    type: "inventory",
    description: "Low stock alert: Grip Tape",
    user: "System",
    quantity: 3,
    timestamp: "2026-01-12T14:00:00Z",
  },
];

// Top Products
export const TOP_PRODUCTS = [
  { id: 1, name: "Court Rental - 1 Hour", sales: 45, revenue: 1125.0 },
  { id: 2, name: "Racket Rental - Premium", sales: 32, revenue: 256.0 },
  { id: 3, name: "Court Rental - 2 Hours", sales: 28, revenue: 1663.2 },
  { id: 4, name: "Balls (3 pack)", sales: 18, revenue: 144.0 },
  { id: 5, name: "Grip Tape", sales: 15, revenue: 90.0 },
];

// Quick Stats
export const QUICK_STATS = {
  todaySales: 127.5,
  pendingPickups: 3,
  lowStockItems: 2,
  activeSessions: 8,
};

// Monthly Sales Chart Data
export const MONTHLY_SALES_DATA = [
  { month: "Jan", sales: 65, target: 100 },
  { month: "Feb", sales: 59, target: 100 },
  { month: "Mar", sales: 80, target: 100 },
  { month: "Apr", sales: 81, target: 100 },
  { month: "May", sales: 56, target: 100 },
  { month: "Jun", sales: 55, target: 100 },
  { month: "Jul", sales: 40, target: 100 },
];

// Sales by Category Chart Data
export const SALES_BY_CATEGORY_DATA = [
  { name: "Racquets", value: 35, color: "#000000" },
  { name: "Apparel", value: 25, color: "#5EBBAC" },
  { name: "Shoes", value: 20, color: "#2C5368" },
  { name: "Accessories", value: 15, color: "#F4C542" },
  { name: "Other", value: 5, color: "#E87559" },
];
