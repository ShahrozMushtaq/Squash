# Visibility Promotions - Product Promotion System

## Overview
Visibility promotions are a **promotion system for visibility purposes only**. They do NOT affect price or inventory. Promoted products can be selected by downstream systems (e.g., Banners) for display.

---

## Key Principles

### ✅ What Visibility Promotions DO:
- Promote/unpromote products
- Set promotion priority
- Set optional promo labels (e.g., "New", "Staff Pick")
- Affect visibility only
- Enable product selection by downstream systems

### ❌ What Visibility Promotions DO NOT:
- Affect product price
- Affect inventory levels
- Create discounts or special pricing
- Modify product data
- Trigger automatic actions

---

## Promotion Configuration

### Configuration Fields

```javascript
{
  productId: "prod_123",
  isPromoted: true,              // Promotion enabled/disabled
  priority: 10,                  // Higher = more prominent (default: 0)
  promoLabel: "New",             // Optional label (e.g., "New", "Staff Pick", "Featured")
  startDate: "2024-01-01T00:00:00Z", // Optional start date
  endDate: "2024-12-31T23:59:59Z",   // Optional end date
  metadata: {}                   // Additional metadata
}
```

### Field Descriptions

- **`isPromoted`** (boolean)
  - Whether product is promoted
  - `true` = promoted, `false` = not promoted

- **`priority`** (number)
  - Promotion priority (higher = more prominent)
  - Used for sorting/ordering promoted products
  - Default: 0
  - Can be negative for lower priority

- **`promoLabel`** (string | null)
  - Optional promotional label
  - Examples: "New", "Staff Pick", "Featured", "Best Seller"
  - Displayed in UI to indicate promotion type
  - Can be `null` if no label needed

- **`startDate`** (string | null)
  - Optional promotion start date (ISO 8601)
  - If set, promotion only active after this date
  - If `null`, promotion active immediately when `isPromoted === true`

- **`endDate`** (string | null)
  - Optional promotion end date (ISO 8601)
  - If set, promotion expires after this date
  - If `null`, promotion continues indefinitely

---

## Promotion States

### Active Promotion
A promotion is **active** when:
- `isPromoted === true` AND
- Current date >= `startDate` (if `startDate` is set) AND
- Current date <= `endDate` (if `endDate` is set)

### Inactive Promotion
A promotion is **inactive** when:
- `isPromoted === false` OR
- Current date < `startDate` (if `startDate` is set) OR
- Current date > `endDate` (if `endDate` is set)

---

## Usage Examples

### Example 1: Promote a Product

```javascript
const promotionService = new VisibilityPromotionService(promotionStore);

await promotionService.promoteProduct({
  productId: "prod_123",
  priority: 10,
  promoLabel: "New",
});
```

### Example 2: Promote with Date Range

```javascript
await promotionService.promoteProduct({
  productId: "prod_123",
  priority: 15,
  promoLabel: "Staff Pick",
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-12-31T23:59:59Z",
});
```

### Example 3: Unpromote a Product

```javascript
await promotionService.unpromoteProduct("prod_123");
```

### Example 4: Set Promotion Priority

```javascript
await promotionService.setPromotionPriority("prod_123", 20);
```

### Example 5: Set Promotion Label

```javascript
await promotionService.setPromotionLabel("prod_123", "Featured");
```

### Example 6: Get Promotion Status

```javascript
const status = await promotionService.getPromotionStatus("prod_123");

console.log(status.isPromoted);    // true
console.log(status.isActive);       // true
console.log(status.priority);       // 10
console.log(status.promoLabel);    // "New"
console.log(status.shouldShowAsPromoted()); // true
console.log(status.getDisplayLabel());      // "New"
```

### Example 7: Get All Promoted Products

```javascript
const promoted = await promotionService.getPromotedProducts({
  onlyActive: true,
  sortByPriority: true,
  limit: 10,
});

promoted.forEach(product => {
  console.log(`${product.productId}: ${product.getDisplayLabel()}`);
});
```

---

## Integration with Downstream Systems

### For Banners System

```javascript
// Get promoted product IDs for banner display
const promotedProductIds = await promotionService.getPromotedProductIds({
  limit: 5,
  minPriority: 5, // Only products with priority >= 5
});

// Use product IDs to fetch product data and display in banner
const products = await productService.getProductsByIds(promotedProductIds);
```

### For Catalog Display

```javascript
// Check if product should be highlighted as promoted
const status = await promotionService.getPromotionStatus(productId);

if (status.shouldShowAsPromoted()) {
  // Show promotion badge
  // Display promo label: status.getDisplayLabel()
  // Apply promotion styling
}
```

### For Featured Products Section

```javascript
// Get top promoted products
const featured = await promotionService.getPromotedProducts({
  onlyActive: true,
  sortByPriority: true,
  limit: 8,
});

// Display in featured products section
featured.forEach(product => {
  // Show product with promotion badge
  // Display label: product.getDisplayLabel()
});
```

---

## Promotion Priority

### Priority Levels

Priority is a numeric value where **higher = more prominent**:

- **High Priority (10-20):** Featured products, main promotions
- **Medium Priority (5-9):** Regular promotions
- **Low Priority (1-4):** Secondary promotions
- **Default (0):** No special priority
- **Negative:** Lower than default (rarely used)

### Sorting

Promoted products are sorted by priority (descending):
1. Priority 20
2. Priority 15
3. Priority 10
4. Priority 5
5. Priority 0

---

## Promo Labels

### Common Labels

- **"New"** - Newly added products
- **"Staff Pick"** - Staff recommendations
- **"Featured"** - Featured products
- **"Best Seller"** - Top-selling products
- **"Sale"** - On sale (note: this is visibility only, not price)
- **"Limited"** - Limited availability
- **"Popular"** - Popular products

### Label Usage

Labels are optional and can be customized per product. They provide visual indication of why a product is promoted.

---

## Date-Based Promotions

### Scheduled Promotions

Promotions can be scheduled with start and end dates:

```javascript
// Schedule promotion for specific period
await promotionService.promoteProduct({
  productId: "prod_123",
  priority: 10,
  promoLabel: "Holiday Special",
  startDate: "2024-12-01T00:00:00Z",
  endDate: "2024-12-31T23:59:59Z",
});
```

### Automatic Expiration

Promotions automatically become inactive after `endDate`:
- No manual unpromotion needed
- System checks dates when querying promotions
- Expired promotions are filtered out automatically

---

## Query Methods

### Get Promoted Products

```javascript
// Get all active promoted products, sorted by priority
const promoted = await promotionService.getPromotedProducts({
  onlyActive: true,
  sortByPriority: true,
  limit: 10,
});
```

### Get Promoted Product IDs

```javascript
// Get product IDs only (for downstream systems)
const productIds = await promotionService.getPromotedProductIds({
  limit: 5,
  minPriority: 10,
});
```

### Get Promotion Status

```javascript
// Check individual product promotion status
const status = await promotionService.getPromotionStatus("prod_123");
```

---

## UI Integration

### Display Promoted Products

```javascript
const status = await promotionService.getPromotionStatus(productId);

if (status.shouldShowAsPromoted()) {
  // Show promotion badge/indicator
  // Display label: status.getDisplayLabel()
  // Apply promotion styling
  // Highlight in product list
}
```

### Promotion Badge

```javascript
const label = status.getDisplayLabel();
if (label) {
  // Display badge with label
  // e.g., <Badge>New</Badge>
}
```

---

## Best Practices

### 1. **Use Appropriate Priorities**
- Reserve high priorities (15+) for main features
- Use medium priorities (5-10) for regular promotions
- Use low priorities (1-4) for secondary promotions

### 2. **Set Meaningful Labels**
- Use consistent labels across products
- Keep labels short and clear
- Use labels that convey value to customers

### 3. **Schedule Promotions**
- Use date ranges for time-limited promotions
- Set end dates to avoid manual cleanup
- Plan promotion schedules in advance

### 4. **Monitor Active Promotions**
- Regularly review active promotions
- Unpromote products that are no longer relevant
- Update priorities based on performance

---

## Summary

- **Visibility Only:** Promotions affect visibility, not price or inventory
- **Promote/Unpromote:** Simple toggle for promotion status
- **Priority System:** Numeric priority for sorting/ordering
- **Optional Labels:** Promo labels for UI display
- **Date Support:** Optional start/end dates for scheduled promotions
- **Downstream Integration:** Provides product IDs for systems like Banners
- **UI Helpers:** Methods for checking promotion status and display
