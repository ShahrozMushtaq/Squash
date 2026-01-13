# Activity Log - Append-Only Audit Trail

## Overview
Activity Log is an **append-only, read-only** audit trail that tracks all changes to catalog entities. Entries cannot be edited or deleted.

---

## Key Principles

### ✅ Activity Log Rules:
- **Append-Only:** Entries can only be added, never deleted
- **Read-Only:** Entries cannot be edited after creation
- **Immutable:** Once created, entries are permanent
- **Automatic Logging:** All inventory mutations generate activity entries

### ❌ What Activity Log DOES NOT:
- Allow editing of entries
- Allow deletion of entries
- Modify entity data
- Affect business logic

---

## Activity Types Tracked

### Inventory Activities
- `INVENTORY_SET_INITIAL` - Initial stock set
- `INVENTORY_INCREASED` - Stock increased (restocking)
- `INVENTORY_DECREMENTED` - Stock decreased (checkout)
- `INVENTORY_ADJUSTED` - Manual adjustment
- `INVENTORY_WRITE_OFF` - Write-off (damage/loss)
- `INVENTORY_CORRECTED` - Audit correction

### Transaction Activities
- `TRANSACTION_CREATED` - Transaction created
- `TRANSACTION_COMPLETED` - Transaction completed
- `TRANSACTION_FAILED` - Transaction failed

### Promotion Activities
- `PROMOTION_CREATED` - Promotion created
- `PROMOTION_UPDATED` - Promotion updated
- `PROMOTION_ACTIVATED` - Promotion activated
- `PROMOTION_DEACTIVATED` - Promotion deactivated
- `PROMOTION_EXPIRED` - Promotion expired

### Visibility Promotion Activities
- `VISIBILITY_PROMOTED` - Product promoted
- `VISIBILITY_UNPROMOTED` - Product unpromoted
- `VISIBILITY_PRIORITY_CHANGED` - Priority changed
- `VISIBILITY_LABEL_CHANGED` - Label changed

### Category Activities
- `CATEGORY_CREATED` - Category created
- `CATEGORY_RENAMED` - Category renamed
- `CATEGORY_HIDDEN` - Category hidden
- `CATEGORY_UNHIDDEN` - Category unhidden

---

## Activity Log Entry Structure

### Fields

```javascript
{
  id: "act_1234567890_abc123",        // Unique entry ID
  entityType: "inventory",            // Entity type
  entityId: "prod_123",               // Entity ID
  action: "INVENTORY_DECREMENTED",    // Action type
  performedBy: "user_456",             // User ID who performed action
  changes: {                          // Changes made
    currentStock: {
      old: 10,
      new: 8
    }
  },
  previousState: {                    // Previous state snapshot
    currentStock: 10,
    stockState: "in_stock"
  },
  newState: {                         // New state snapshot
    currentStock: 8,
    stockState: "in_stock"
  },
  metadata: {                         // Additional metadata
    operation: "DECREMENT_STOCK",
    transactionId: "txn_abc",
    quantity: 2
  },
  timestamp: "2024-01-15T10:30:00Z"  // When action occurred
}
```

---

## Automatic Activity Logging

### Inventory Operations

All inventory operations automatically generate activity entries:

```javascript
// Inventory operations automatically log activities
const integration = new InventoryActivityIntegration(
  inventoryService,
  activityService
);

// Decrement stock - automatically logs activity
const result = await integration.decrementStock({
  productId: "prod_123",
  variantId: null,
  quantity: 2,
  transactionId: "txn_abc",
  performedBy: "system",
});

// Activity entry is automatically created
```

### Required Logging

**Rule:** All inventory mutations must generate an activity entry.

This is enforced by:
- Using `InventoryActivityIntegration` wrapper
- Automatic logging in integration layer
- Cannot bypass activity logging

---

## Usage Examples

### Example 1: Log Activity Manually

```javascript
const activityService = new ActivityLogService(activityStore);

await activityService.logActivity({
  entityType: ACTIVITY_ENTITY_TYPES.INVENTORY,
  entityId: "prod_123",
  action: ACTIVITY_ACTIONS.INVENTORY_INCREASED,
  performedBy: "user_456",
  changes: {
    currentStock: { old: 10, new: 15 },
  },
  previousState: { currentStock: 10 },
  newState: { currentStock: 15 },
  metadata: {
    operation: "INCREASE_STOCK",
    reason: "Received new shipment",
  },
});
```

### Example 2: Get Activity for Entity

```javascript
// Get all activity for a product's inventory
const activity = await activityService.getInventoryActivity("prod_123", null, {
  limit: 50,
  sortDescending: true,
});

activity.forEach(entry => {
  console.log(`${entry.timestamp}: ${entry.action} by ${entry.performedBy}`);
  console.log(`Stock: ${entry.changes.currentStock.old} → ${entry.changes.currentStock.new}`);
});
```

### Example 3: Get Transaction Activity

```javascript
// Get all activity related to a transaction
const transactionActivity = await activityService.getTransactionActivity("txn_abc");

transactionActivity.forEach(entry => {
  console.log(`${entry.action}: ${entry.entityId}`);
});
```

### Example 4: Get Activity by Action Type

```javascript
// Get all inventory decrements
const decrements = await activityService.getActivityByAction(
  ACTIVITY_ACTIONS.INVENTORY_DECREMENTED,
  { limit: 100 }
);
```

### Example 5: Get Activity by Performer

```javascript
// Get all activity by a specific user
const userActivity = await activityService.getActivityByPerformer("user_456", {
  limit: 50,
});
```

---

## Read-Only Enforcement

### Cannot Update Entries

```javascript
try {
  await activityService.updateActivityEntry("act_123", { ... });
} catch (error) {
  // Error: "Activity log entries are immutable and cannot be updated"
}
```

### Cannot Delete Entries

```javascript
try {
  await activityService.deleteActivityEntry("act_123");
} catch (error) {
  // Error: "Activity log entries are append-only and cannot be deleted"
}
```

---

## Query Methods

### Get Activity for Entity

```javascript
const activity = await activityService.getActivityForEntity(
  "inventory",
  "prod_123",
  {
    limit: 50,
    offset: 0,
    sortDescending: true, // Newest first
  }
);
```

### Get Activity by Action

```javascript
const activity = await activityService.getActivityByAction(
  ACTIVITY_ACTIONS.INVENTORY_DECREMENTED,
  { limit: 100 }
);
```

### Get Activity by Performer

```javascript
const activity = await activityService.getActivityByPerformer("user_456", {
  limit: 50,
});
```

### Get Activity by Date Range

```javascript
const activity = await activityService.getActivityByDateRange(
  "2024-01-01T00:00:00Z",
  "2024-01-31T23:59:59Z"
);
```

### Get All Activity

```javascript
const activity = await activityService.getAllActivity({
  limit: 100,
  offset: 0,
  sortDescending: true,
});
```

---

## Integration Patterns

### Inventory Operations

```javascript
// Use integration wrapper to automatically log activities
const integration = new InventoryActivityIntegration(
  inventoryService,
  activityService
);

// All operations automatically log activities
await integration.decrementStock({ ... });
await integration.increaseStock({ ... });
await integration.writeOff({ ... });
```

### Transaction Logging

```javascript
// Log transaction creation
await activityService.logActivity({
  entityType: ACTIVITY_ENTITY_TYPES.PRODUCT,
  entityId: "prod_123",
  action: ACTIVITY_ACTIONS.TRANSACTION_CREATED,
  performedBy: "system",
  metadata: {
    transactionId: "txn_abc",
    items: [...],
    total: 100.00,
  },
});
```

### Promotion Logging

```javascript
// Log promotion changes
await activityService.logActivity({
  entityType: ACTIVITY_ENTITY_TYPES.PROMOTION,
  entityId: "promo_123",
  action: ACTIVITY_ACTIONS.PROMOTION_ACTIVATED,
  performedBy: "user_456",
  changes: {
    isActive: { old: false, new: true },
  },
});
```

---

## Activity Entry Structure

### Changes Field

```javascript
changes: {
  currentStock: {
    old: 10,
    new: 8
  },
  stockState: {
    old: "in_stock",
    new: "low_stock"
  }
}
```

### State Snapshots

```javascript
previousState: {
  currentStock: 10,
  stockState: "in_stock",
  reorderPoint: 5
}

newState: {
  currentStock: 8,
  stockState: "low_stock",
  reorderPoint: 5
}
```

### Metadata

```javascript
metadata: {
  operation: "DECREMENT_STOCK",
  transactionId: "txn_abc",
  quantity: 2,
  reason: "Checkout transaction",
  // ... additional context
}
```

---

## Best Practices

### 1. **Log All Mutations**
- Ensure all inventory operations go through integration layer
- Log all state changes, not just successful ones
- Include relevant context in metadata

### 2. **Include State Snapshots**
- Include `previousState` and `newState` for important changes
- Helps with debugging and audit trails
- Enables potential rollback scenarios

### 3. **Rich Metadata**
- Include operation context in metadata
- Add transaction IDs, reasons, user info
- Include any relevant business context

### 4. **Query Efficiently**
- Use appropriate query methods
- Apply limits for large result sets
- Use date ranges for time-based queries

---

## Summary

- **Append-Only:** Entries can only be added, never deleted
- **Read-Only:** Entries cannot be edited after creation
- **Automatic Logging:** All inventory mutations generate entries
- **Immutable:** Once created, entries are permanent
- **Comprehensive:** Tracks inventory, transactions, promotions, categories
- **Queryable:** Multiple query methods for different use cases
