# Reorder Alerts - Signal System

## Overview
Reorder alerts are a **read-only signal system** that monitors inventory levels and generates alerts when thresholds are crossed. This system does NOT modify stock levels or trigger automatic orders.

---

## Key Principles

### ✅ What Reorder Alerts DO:
- Monitor inventory levels against thresholds
- Signal when thresholds are crossed
- Provide alert status for UI display
- Enable/disable alerts per product/variant
- Surface alerts in Catalog UI

### ❌ What Reorder Alerts DO NOT:
- Modify stock levels
- Trigger automatic orders
- Create supplier logic
- Automatically restock inventory
- Send emails/notifications (that's a separate system)

---

## Alert Configuration

### Per Product/Variant Settings

Each product or variant can have its own alert configuration:

```javascript
{
  productId: "prod_123",
  variantId: null, // or "var_456" for variants
  reorderPoint: 10, // Stock level at which alert triggers
  lowStockThreshold: 5, // Stock level for "low stock" status (optional, defaults to reorderPoint)
  isEnabled: true, // Enable/disable alerts
  alertEmail: "manager@example.com", // Optional email
  alertRecipients: ["user_123", "user_456"], // Optional recipients
  metadata: {} // Additional metadata
}
```

### Configuration Fields

- **`reorderPoint`** (number, nullable)
  - Stock level at which alert triggers
  - When `currentStock <= reorderPoint`, alert is triggered
  - Can be `null` to disable threshold-based alerts

- **`lowStockThreshold`** (number, nullable)
  - Stock level for "low stock" status display
  - If not set, defaults to `reorderPoint`
  - Used to determine when product status becomes "Low Stock"

- **`isEnabled`** (boolean)
  - Enable/disable alerts for this product/variant
  - When disabled, no alerts are generated

---

## Alert States

### State Definitions

1. **NORMAL**
   - Stock is above threshold
   - No alert triggered
   - Product status: "in_stock"

2. **LOW_STOCK**
   - Stock is at or below threshold
   - Alert is triggered
   - Product status: "low_stock"
   - Product should be highlighted in Catalog

3. **OUT_OF_STOCK**
   - Stock is zero
   - Alert is triggered
   - Product status: "out_of_stock"
   - Product should be highlighted in Catalog

4. **ALERT_DISABLED**
   - Alert is disabled for this product/variant
   - No alerts are generated
   - Product status determined by stock level only

---

## Alert Detection Logic

### Threshold Check

```javascript
if (currentStock === 0) {
  alertState = "OUT_OF_STOCK";
  isAlertTriggered = true;
} else if (lowStockThreshold !== null && currentStock <= lowStockThreshold) {
  alertState = "LOW_STOCK";
  isAlertTriggered = true;
} else {
  alertState = "NORMAL";
  isAlertTriggered = false;
}
```

### Product Status Mapping

Alert state maps to product status:

- `OUT_OF_STOCK` → `productStatus = "out_of_stock"`
- `LOW_STOCK` → `productStatus = "low_stock"`
- `NORMAL` → `productStatus = "in_stock"`

---

## Usage Examples

### Example 1: Check Alert Status

```javascript
const alertService = new ReorderAlertService(alertConfigStore, inventoryStore);

const alertResult = await alertService.checkAlertStatus("prod_123", null);

console.log(alertResult.alertState); // "LOW_STOCK"
console.log(alertResult.isAlertTriggered); // true
console.log(alertResult.shouldHighlight()); // true
console.log(alertResult.getDisplayMessage()); // "Low stock: 3 remaining (threshold: 5)"
```

### Example 2: Configure Alert

```javascript
const config = new ReorderAlertConfig({
  productId: "prod_123",
  variantId: null,
  reorderPoint: 10,
  lowStockThreshold: 5,
  isEnabled: true,
});

await alertService.configureAlert(config);
```

### Example 3: Get All Triggered Alerts

```javascript
const triggeredAlerts = await alertService.getTriggeredAlerts();

// Returns array of ReorderAlertResult for all products/variants with triggered alerts
triggeredAlerts.forEach(alert => {
  console.log(`${alert.productId}: ${alert.getDisplayMessage()}`);
});
```

### Example 4: Enable/Disable Alert

```javascript
// Enable alert
await alertService.enableAlert("prod_123", null);

// Disable alert
await alertService.disableAlert("prod_123", null);
```

### Example 5: Update Reorder Point

```javascript
await alertService.updateReorderPoint("prod_123", null, 15);
```

---

## Integration with Inventory Operations

### Automatic Alert Checking

When inventory changes, alerts are automatically checked:

```javascript
const integration = new InventoryAlertIntegration(inventoryService, alertService);

// Decrement stock and check alerts
const result = await integration.decrementStockAndCheckAlerts({
  productId: "prod_123",
  variantId: null,
  quantity: 2,
  transactionId: "txn_abc",
  performedBy: "system",
});

// Result includes both inventory and alert status
console.log(result.inventory.newStock); // Updated stock
console.log(result.alert.alertState); // Alert state after change
console.log(result.alert.shouldHighlight()); // Should highlight in UI
```

---

## UI Integration

### Catalog List Display

Products with triggered alerts should be highlighted:

```javascript
const productStatus = await integration.getProductStatus("prod_123", null);

// Use productStatus.shouldHighlight() to determine if product should be highlighted
if (productStatus.shouldHighlight()) {
  // Apply highlight styling
  // Show alert badge/indicator
  // Display alert message
}
```

### Alert Display

```javascript
const alertResult = await alertService.checkAlertStatus(productId, variantId);

if (alertResult.isAlertTriggered && alertResult.isEnabled) {
  // Show alert badge
  // Display message: alertResult.getDisplayMessage()
  // Apply "low stock" or "out of stock" styling
}
```

---

## Alert Configuration Management

### Setting Up Alerts

1. **Create Configuration**
   ```javascript
   const config = new ReorderAlertConfig({
     productId: "prod_123",
     reorderPoint: 10,
     lowStockThreshold: 5,
     isEnabled: true,
   });
   await alertService.configureAlert(config);
   ```

2. **Update Thresholds**
   ```javascript
   await alertService.updateReorderPoint("prod_123", null, 15);
   await alertService.updateLowStockThreshold("prod_123", null, 8);
   ```

3. **Enable/Disable**
   ```javascript
   await alertService.enableAlert("prod_123", null);
   await alertService.disableAlert("prod_123", null);
   ```

---

## Product Status Flow

### Status Determination

```
Current Stock: 0
  → Product Status: "out_of_stock"
  → Alert State: OUT_OF_STOCK
  → Should Highlight: true (if alert enabled)

Current Stock: 1-5 (if threshold is 5)
  → Product Status: "low_stock"
  → Alert State: LOW_STOCK
  → Should Highlight: true (if alert enabled)

Current Stock: > 5
  → Product Status: "in_stock"
  → Alert State: NORMAL
  → Should Highlight: false
```

---

## Best Practices

### 1. **Set Appropriate Thresholds**
- `reorderPoint` should be based on lead time and usage rate
- `lowStockThreshold` can be lower than `reorderPoint` for visual indication

### 2. **Enable Alerts Selectively**
- Not all products need alerts
- Enable alerts for critical or fast-moving items
- Disable alerts for items with irregular demand

### 3. **Monitor Alert Frequency**
- Too many alerts = alert fatigue
- Adjust thresholds based on actual usage patterns
- Review and update thresholds regularly

### 4. **UI Display**
- Highlight products with triggered alerts
- Show clear alert messages
- Group alerts by severity (out of stock vs low stock)

---

## Summary

- **Signal System:** Alerts are signals, not automation
- **Read-Only:** Does not modify stock or trigger orders
- **Per Product/Variant:** Each can have its own configuration
- **Enable/Disable:** Alerts can be toggled per product/variant
- **Status Mapping:** Alert state maps to product status
- **UI Integration:** Provides methods for UI to display alerts
- **Automatic Checking:** Alerts checked when inventory changes
