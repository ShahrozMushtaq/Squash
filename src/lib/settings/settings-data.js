/**
 * Settings Data Structure
 * Hardcoded data for Settings configuration
 */

// Tax Rules
export const TAX_RULES = {
  enabled: true,
  rate: 10.0, // Percentage
  type: "percentage", // percentage or fixed
  appliesTo: ["all"], // all, members_only, guests_only
  lastUpdated: "2024-01-15T10:00:00Z",
  updatedBy: "admin",
};

// Inventory Defaults
export const INVENTORY_DEFAULTS = {
  defaultReorderPoint: 5,
  defaultLowStockThreshold: 3,
  enableInventoryTracking: true,
  allowNegativeStock: false,
  requireReasonForAdjustment: true,
  lastUpdated: "2024-01-10T09:00:00Z",
  updatedBy: "admin",
};

// Reorder Alert Defaults
export const REORDER_ALERT_DEFAULTS = {
  enabled: true,
  defaultReorderPoint: 5,
  defaultLowStockThreshold: 3,
  alertChannels: ["ui", "email"], // ui, email, sms
  autoDisableOnRestock: false,
  lastUpdated: "2024-01-12T14:30:00Z",
  updatedBy: "manager",
};

// Discount Rules
export const DISCOUNT_RULES = {
  memberDiscountEnabled: true,
  memberDiscountPercentage: 10.0,
  allowManualDiscounts: true,
  maxManualDiscountPercentage: 25.0,
  requireApprovalForDiscountsOver: 15.0,
  lastUpdated: "2024-01-08T11:20:00Z",
  updatedBy: "admin",
};

// Refund Permissions
export const REFUND_PERMISSIONS = {
  allowedRoles: ["manager", "owner"], // staff, manager, owner
  requireApproval: true,
  maxRefundAmountWithoutApproval: 50.0,
  allowPartialRefunds: true,
  requireReason: true,
  lastUpdated: "2024-01-05T16:45:00Z",
  updatedBy: "owner",
};

// Role-Based Permissions
export const ROLE_PERMISSIONS = {
  staff: {
    canViewSales: true,
    canProcessCheckout: true,
    canManageInventory: false,
    canManageProducts: false,
    canIssueRefunds: false,
    canManageSettings: false,
  },
  manager: {
    canViewSales: true,
    canProcessCheckout: true,
    canManageInventory: true,
    canManageProducts: true,
    canIssueRefunds: true,
    canManageSettings: false,
  },
  owner: {
    canViewSales: true,
    canProcessCheckout: true,
    canManageInventory: true,
    canManageProducts: true,
    canIssueRefunds: true,
    canManageSettings: true,
  },
  lastUpdated: "2024-01-01T00:00:00Z",
  updatedBy: "owner",
};

// Settings Change Log
export const SETTINGS_CHANGE_LOG = [
  {
    id: "log-1",
    setting: "Tax Rules",
    field: "rate",
    oldValue: "8.0",
    newValue: "10.0",
    changedBy: "admin",
    timestamp: "2024-01-15T10:00:00Z",
  },
  {
    id: "log-2",
    setting: "Inventory Defaults",
    field: "defaultReorderPoint",
    oldValue: "3",
    newValue: "5",
    changedBy: "admin",
    timestamp: "2024-01-10T09:00:00Z",
  },
  {
    id: "log-3",
    setting: "Discount Rules",
    field: "memberDiscountPercentage",
    oldValue: "5.0",
    newValue: "10.0",
    changedBy: "manager",
    timestamp: "2024-01-08T11:20:00Z",
  },
  {
    id: "log-4",
    setting: "Refund Permissions",
    field: "maxRefundAmountWithoutApproval",
    oldValue: "100.0",
    newValue: "50.0",
    changedBy: "owner",
    timestamp: "2024-01-05T16:45:00Z",
  },
];
