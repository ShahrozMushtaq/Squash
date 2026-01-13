# Inventory Rules - Hard Constraints

## Overview
Inventory operations are governed by **non-negotiable invariants** that must be enforced at all times. Violations result in explicit operation failures.

---

## Hard Constraints (Invariants)

### 1. **Stock Can Never Go Below Zero**
- **Rule:** `currentStock >= 0` at all times
- **Enforcement:** Validated before every operation
- **Violation:** Operation fails with `INSUFFICIENT_STOCK` error
- **Example:**
  ```javascript
  // Current stock: 5
  // Attempt to decrement: 10
  // Result: FAILURE - "Stock cannot go below zero. Current: 5, Requested change: -10"
  ```

### 2. **Stock Decrements Only on Successful Checkout**
- **Rule:** Stock can only be decremented through successful checkout transactions
- **Enforcement:** `DECREMENT_STOCK` operation requires `CHECKOUT_SUCCESS` context
- **Violation:** Operation fails with `INVALID_DECREMENT_CONTEXT` error
- **Example:**
  ```javascript
  // Attempt to decrement outside checkout
  // Result: FAILURE - "Stock decrements are only allowed through successful checkout transactions"
  ```

### 3. **Manual Adjustments Require a Reason**
- **Rule:** All manual operations (`ADJUSTMENT`, `WRITE_OFF`, `CORRECTION`) must include a reason
- **Enforcement:** Validated before operation execution
- **Violation:** Operation fails with `MISSING_REASON` error
- **Example:**
  ```javascript
  // Attempt adjustment without reason
  // Result: FAILURE - "Manual operation 'ADJUSTMENT' requires a non-empty reason"
  ```

### 4. **Initial Stock Must Be Non-Negative**
- **Rule:** Initial stock must be `>= 0`
- **Enforcement:** Validated when setting initial stock
- **Violation:** Operation fails with `INVALID_INITIAL_STOCK` error

---

## Supported Operations

### 1. **SET_INITIAL_STOCK**
- **Purpose:** Set initial stock for new product/variant
- **Context:** Product creation, variant creation
- **Quantity:** Must be `>= 0`
- **Reason:** Not required
- **Example:**
  ```javascript
  await inventoryService.setInitialStock({
    productId: "prod_123",
    variantId: null,
    quantity: 100,
    performedBy: "user_456",
  });
  ```

### 2. **INCREASE_STOCK**
- **Purpose:** Increase stock (restocking)
- **Context:** Manual restock, receiving shipment
- **Quantity:** Must be `> 0`
- **Reason:** Required
- **Example:**
  ```javascript
  await inventoryService.increaseStock({
    productId: "prod_123",
    variantId: null,
    quantity: 50,
    reason: "Received new shipment",
    performedBy: "user_456",
  });
  ```

### 3. **DECREMENT_STOCK**
- **Purpose:** Decrease stock (only through checkout)
- **Context:** Successful checkout transaction
- **Quantity:** Must be `> 0`
- **Reason:** Not required (context provides reason)
- **Example:**
  ```javascript
  await inventoryService.decrementStock({
    productId: "prod_123",
    variantId: "var_789",
    quantity: 2,
    transactionId: "txn_abc",
    performedBy: "system",
  });
  ```

### 4. **WRITE_OFF**
- **Purpose:** Write off damaged or lost items
- **Context:** Damage, loss, theft, expiration
- **Quantity:** Must be `> 0` (always decreases stock)
- **Reason:** Required
- **Example:**
  ```javascript
  await inventoryService.writeOff({
    productId: "prod_123",
    variantId: null,
    quantity: 5,
    reason: "Items damaged during transport",
    writeOffType: "damage",
    performedBy: "user_456",
  });
  ```

### 5. **CORRECTION**
- **Purpose:** Correct audit discrepancies
- **Context:** Physical inventory count correction
- **Quantity:** Can be positive or negative (adjustment amount)
- **Reason:** Required
- **Example:**
  ```javascript
  await inventoryService.correctAuditDiscrepancy({
    productId: "prod_123",
    variantId: null,
    actualQuantity: 95, // Physical count
    reason: "Physical inventory count correction",
    performedBy: "user_456",
  });
  ```

### 6. **ADJUSTMENT**
- **Purpose:** Manual adjustment (increase or decrease)
- **Context:** Manual correction, general adjustment
- **Quantity:** Can be positive (increase) or negative (decrease)
- **Reason:** Required
- **Example:**
  ```javascript
  // Increase
  await inventoryService.adjustStock({
    productId: "prod_123",
    variantId: null,
    quantity: 10,
    reason: "Found additional stock in warehouse",
    performedBy: "user_456",
  });

  // Decrease
  await inventoryService.adjustStock({
    productId: "prod_123",
    variantId: null,
    quantity: -5,
    reason: "Correction for previous error",
    performedBy: "user_456",
  });
  ```

---

## Operation Flow

### 1. **Request Validation**
- Validate request structure (required fields, types)
- Validate operation type
- Validate context

### 2. **Invariant Validation**
- Check stock non-negative constraint
- Check decrement context (if applicable)
- Check reason requirement (if applicable)

### 3. **Operation Execution**
- If validation passes: Execute operation
- If validation fails: Return explicit error

### 4. **Result**
- **Success:** Return updated inventory record and changes
- **Failure:** Return error with code, message, and context

---

## Error Handling

### Error Structure
```javascript
{
  success: false,
  error: {
    code: "INSUFFICIENT_STOCK",
    message: "Stock cannot go below zero. Current: 5, Requested change: -10",
    currentStock: 5,
    requestedChange: -10,
    wouldResultIn: -5,
  },
  timestamp: "2024-01-15T10:30:00Z"
}
```

### Error Codes
- `INSUFFICIENT_STOCK` - Stock would go below zero
- `INVALID_DECREMENT_CONTEXT` - Decrement outside checkout
- `MISSING_REASON` - Manual operation missing reason
- `INVALID_INITIAL_STOCK` - Initial stock is negative
- `INVALID_REQUEST` - Request structure invalid
- `UNKNOWN_OPERATION` - Unknown operation type
- `INVENTORY_RECORD_NOT_FOUND` - Inventory record doesn't exist

---

## Usage Examples

### Example 1: Successful Checkout Decrement
```javascript
const result = await inventoryService.decrementStock({
  productId: "prod_123",
  variantId: "var_789",
  quantity: 2,
  transactionId: "txn_abc",
  performedBy: "system",
});

if (result.success) {
  console.log(`Stock updated: ${result.data.previousStock} → ${result.data.newStock}`);
} else {
  console.error(`Failed: ${result.error.message}`);
}
```

### Example 2: Failed Decrement (Insufficient Stock)
```javascript
// Current stock: 5
const result = await inventoryService.decrementStock({
  productId: "prod_123",
  variantId: null,
  quantity: 10, // Attempting to remove 10 when only 5 available
  transactionId: "txn_abc",
  performedBy: "system",
});

// Result: FAILURE
// Error: "Stock cannot go below zero. Current: 5, Requested change: -10"
```

### Example 3: Write-Off with Reason
```javascript
const result = await inventoryService.writeOff({
  productId: "prod_123",
  variantId: null,
  quantity: 3,
  reason: "Items expired and must be discarded",
  writeOffType: "expiration",
  performedBy: "user_456",
});

if (result.success) {
  console.log(`Wrote off ${result.data.delta} items`);
}
```

### Example 4: Failed Write-Off (Missing Reason)
```javascript
const result = await inventoryService.writeOff({
  productId: "prod_123",
  variantId: null,
  quantity: 3,
  // reason: missing!
  writeOffType: "damage",
  performedBy: "user_456",
});

// Result: FAILURE
// Error: "Manual operation 'WRITE_OFF' requires a non-empty reason"
```

---

## Integration with Checkout

### Checkout Flow Integration
```javascript
// In checkout transaction service
async function processCheckout(transactionData) {
  // 1. Validate inventory availability (read-only check)
  const availabilityCheck = await checkInventoryAvailability(transactionData.items);
  if (!availabilityCheck.available) {
    return { success: false, error: "Insufficient stock" };
  }

  // 2. Process payment
  const paymentResult = await processPayment(transactionData);
  if (!paymentResult.success) {
    return paymentResult; // Don't decrement inventory
  }

  // 3. Decrement inventory (only if payment succeeds)
  for (const item of transactionData.items) {
    const decrementResult = await inventoryService.decrementStock({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      transactionId: transactionData.transactionId,
      performedBy: "system",
    });

    if (!decrementResult.success) {
      // This should not happen if availability check passed
      // But if it does, we need to handle it (rollback payment, etc.)
      return { success: false, error: decrementResult.error };
    }
  }

  return { success: true };
}
```

---

## Key Principles

1. **Explicit Failures:** All rule violations result in explicit error responses
2. **No Silent Failures:** Operations never silently ignore violations
3. **Atomic Operations:** Each operation is validated and executed atomically
4. **Audit Trail:** All operations are logged with full context
5. **UI Independence:** Rules are enforced at the service layer, not UI layer
6. **Immutable Rules:** Invariants cannot be bypassed or overridden

---

## Testing Scenarios

### Test Case 1: Stock Cannot Go Negative
```javascript
// Setup: Stock = 5
// Action: Decrement 10
// Expected: FAILURE with INSUFFICIENT_STOCK
```

### Test Case 2: Decrement Only in Checkout
```javascript
// Setup: Stock = 10
// Action: Decrement outside checkout context
// Expected: FAILURE with INVALID_DECREMENT_CONTEXT
```

### Test Case 3: Manual Adjustment Requires Reason
```javascript
// Setup: Stock = 10
// Action: Adjust without reason
// Expected: FAILURE with MISSING_REASON
```

### Test Case 4: Successful Operations
```javascript
// Setup: Stock = 10
// Action: Valid operations with proper context
// Expected: SUCCESS with updated stock
```
