/**
 * Sales Data Structure
 * Hardcoded data for Sales (Transactions & Pickups)
 */

// Transactions
export const TRANSACTIONS_DATA = [
  {
    id: "TXN-001",
    dateTime: "2024-01-20T14:30:00Z",
    buyerType: "member",
    buyerReference: "M-12345",
    buyerName: "John Doe",
    lineItems: [
      {
        productId: 1,
        productName: "Court Rental - 1 Hour",
        variantId: null,
        variantName: null,
        quantity: 1,
        unitPrice: 25.0,
        subtotal: 25.0,
      },
    ],
    discounts: [],
    subtotal: 25.0,
    tax: 2.5,
    total: 27.5,
    paymentMethod: "card",
    pickupStatus: null, // No pickup for checkout sales
    status: "completed",
    createdAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "TXN-002",
    dateTime: "2024-01-20T13:15:00Z",
    buyerType: "guest",
    buyerReference: null,
    buyerName: "Guest Customer",
    lineItems: [
      {
        productId: 4,
        productName: "Racket Rental - Premium",
        variantId: "beginner",
        variantName: "Beginner",
        quantity: 2,
        unitPrice: 8.0,
        subtotal: 16.0,
      },
      {
        productId: 5,
        productName: "Balls (3 pack)",
        variantId: null,
        variantName: null,
        quantity: 1,
        unitPrice: 8.0,
        subtotal: 8.0,
      },
    ],
    discounts: [],
    subtotal: 24.0,
    tax: 2.4,
    total: 26.4,
    paymentMethod: "cash",
    pickupStatus: null,
    status: "completed",
    createdAt: "2024-01-20T13:15:00Z",
  },
  {
    id: "TXN-003",
    dateTime: "2024-01-19T16:45:00Z",
    buyerType: "member",
    buyerReference: "M-67890",
    buyerName: "Sarah Miller",
    lineItems: [
      {
        productId: 2,
        productName: "Court Rental - 2 Hours",
        variantId: "premium",
        variantName: "Premium Court",
        quantity: 1,
        unitPrice: 60.0,
        subtotal: 60.0,
      },
    ],
    discounts: [
      {
        type: "member",
        amount: 6.0,
        description: "Member discount (10%)",
      },
    ],
    subtotal: 60.0,
    discountsTotal: 6.0,
    tax: 5.4,
    total: 59.4,
    paymentMethod: "card",
    pickupStatus: null,
    status: "completed",
    createdAt: "2024-01-19T16:45:00Z",
  },
  {
    id: "TXN-004",
    dateTime: "2024-01-18T11:20:00Z",
    buyerType: "guest",
    buyerReference: null,
    buyerName: "Guest Customer",
    lineItems: [
      {
        productId: 9,
        productName: "Grip Tape",
        variantId: null,
        variantName: null,
        quantity: 3,
        unitPrice: 6.0,
        subtotal: 18.0,
      },
    ],
    discounts: [],
    subtotal: 18.0,
    tax: 1.8,
    total: 19.8,
    paymentMethod: "cash",
    pickupStatus: null,
    status: "completed",
    createdAt: "2024-01-18T11:20:00Z",
  },
  {
    id: "EXT-001",
    dateTime: "2024-01-20T15:00:00Z",
    buyerType: "member",
    buyerReference: "M-11111",
    buyerName: "Mike Johnson",
    lineItems: [
      {
        productId: 10,
        productName: "Squash Shoes Rental",
        variantId: "size-8",
        variantName: "Size 8",
        quantity: 1,
        unitPrice: 10.0,
        subtotal: 10.0,
      },
    ],
    discounts: [],
    subtotal: 10.0,
    tax: 1.0,
    total: 11.0,
    paymentMethod: "card",
    pickupStatus: "pending", // Has pickup status for external purchase
    pickupId: "PICK-001",
    status: "completed",
    createdAt: "2024-01-20T15:00:00Z",
  },
];

// Pickups (for externally-originated purchases only)
export const PICKUPS_DATA = [
  {
    id: "PICK-001",
    transactionId: "EXT-001",
    dateTime: "2024-01-21T10:00:00Z",
    buyerType: "member",
    buyerReference: "M-11111",
    buyerName: "Mike Johnson",
    buyerEmail: "mike@example.com",
    buyerPhone: "+1-555-0101",
    lineItems: [
      {
        productId: 10,
        productName: "Squash Shoes Rental",
        variantId: "size-8",
        variantName: "Size 8",
        quantity: 1,
      },
    ],
    status: "pending",
    notes: "Customer will pick up after 5 PM",
    createdAt: "2024-01-20T15:00:00Z",
    updatedAt: "2024-01-20T15:00:00Z",
  },
  {
    id: "PICK-002",
    transactionId: "EXT-002",
    dateTime: "2024-01-22T14:00:00Z",
    buyerType: "guest",
    buyerReference: null,
    buyerName: "Jane Smith",
    buyerEmail: "jane@example.com",
    buyerPhone: "+1-555-0102",
    lineItems: [
      {
        productId: 4,
        productName: "Racket Rental - Premium",
        variantId: "intermediate",
        variantName: "Intermediate",
        quantity: 1,
      },
      {
        productId: 5,
        productName: "Balls (3 pack)",
        variantId: null,
        variantName: null,
        quantity: 2,
      },
    ],
    status: "pending",
    notes: null,
    createdAt: "2024-01-21T09:30:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
  },
  {
    id: "PICK-003",
    transactionId: "EXT-003",
    dateTime: "2024-01-19T16:00:00Z",
    buyerType: "member",
    buyerReference: "M-22222",
    buyerName: "David Lee",
    buyerEmail: "david@example.com",
    buyerPhone: "+1-555-0103",
    lineItems: [
      {
        productId: 9,
        productName: "Grip Tape",
        variantId: null,
        variantName: null,
        quantity: 5,
      },
    ],
    status: "picked_up",
    notes: "Picked up on time",
    createdAt: "2024-01-18T12:00:00Z",
    updatedAt: "2024-01-19T16:15:00Z",
    pickedUpAt: "2024-01-19T16:15:00Z",
  },
  {
    id: "PICK-004",
    transactionId: "EXT-004",
    dateTime: "2024-01-17T11:00:00Z",
    buyerType: "guest",
    buyerReference: null,
    buyerName: "Lisa Chen",
    buyerEmail: "lisa@example.com",
    buyerPhone: "+1-555-0104",
    lineItems: [
      {
        productId: 8,
        productName: "Towel Rental",
        variantId: null,
        variantName: null,
        quantity: 2,
      },
    ],
    status: "cancelled",
    notes: "Customer cancelled order",
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-17T10:30:00Z",
    cancelledAt: "2024-01-17T10:30:00Z",
  },
];

// Helper functions
export function getTransactionById(transactionId) {
  return TRANSACTIONS_DATA.find((t) => t.id === transactionId);
}

export function getPickupById(pickupId) {
  return PICKUPS_DATA.find((p) => p.id === pickupId);
}

export function getTransactionsByDateRange(startDate, endDate) {
  return TRANSACTIONS_DATA.filter((t) => {
    const txDate = new Date(t.dateTime);
    return txDate >= startDate && txDate <= endDate;
  });
}

export function getPickupsByStatus(status) {
  return PICKUPS_DATA.filter((p) => p.status === status);
}
