# Product UI Structure - Tabbed Interface

## Overview
Product UI is organized as a tabbed interface where each tab operates independently on its own domain. No cross-tab side effects are allowed.

---

## Tab Structure

### 1. Details Tab
**Owns:** Product data
- Product name
- Product description
- Base price
- Category assignment
- Variant definitions (if product has variants)
- Product status (active/inactive/hidden)

**Does NOT Mutate:**
- Inventory records
- Promotions
- Activity log

**Operations:**
- Edit product name
- Edit product description
- Update base price
- Change category
- Manage variants (add/edit/remove)
- Change product status

---

### 2. Inventory Tab
**Owns:** Inventory records
- Current stock level
- Stock state (in_stock/low_stock/out_of_stock)
- Reorder point
- Low stock threshold
- Reorder alert configuration

**Does NOT Mutate:**
- Product details (name, price, description)
- Promotions
- Activity log (read-only, but entries are created automatically)

**Operations:**
- View current stock
- Set initial stock
- Increase stock (restocking)
- Write off stock (damage/loss)
- Correct audit discrepancies
- Adjust stock manually
- Configure reorder point
- Configure low stock threshold
- Enable/disable reorder alerts

**Note:** Inventory operations automatically create activity log entries, but this tab does not directly modify activity log.

---

### 3. Promotion Tab
**Owns:** Visibility promotions
- Promotion status (promoted/not promoted)
- Promotion priority
- Promo label (e.g., "New", "Staff Pick")
- Promotion dates (start/end)

**Does NOT Mutate:**
- Product details
- Inventory records
- Activity log (read-only, but entries are created automatically)

**Operations:**
- Promote/unpromote product
- Set promotion priority
- Set promo label
- Set promotion dates
- View promotion status

**Note:** Promotion changes automatically create activity log entries, but this tab does not directly modify activity log.

---

### 4. Activity Tab
**Owns:** Activity log entries (read-only)

**Strictly Read-Only:**
- Cannot edit entries
- Cannot delete entries
- Cannot create entries manually
- Only displays existing entries

**Displays:**
- Inventory adjustments
- Related transactions
- Promotion changes
- Category changes
- Product changes

**Operations:**
- View activity timeline
- Filter by action type
- Filter by date range
- Filter by performer
- View change details
- Export activity log

---

## Tab Independence Rules

### 1. No Cross-Tab Mutations
- Details tab cannot modify inventory
- Inventory tab cannot modify product details
- Promotion tab cannot modify inventory or product details
- Activity tab cannot modify anything (read-only)

### 2. Owned Data Only
- Each tab only operates on its owned domain
- Tabs can READ data from other domains (for display)
- Tabs cannot WRITE data outside their domain

### 3. Automatic Activity Logging
- Inventory operations automatically log activities
- Promotion operations automatically log activities
- Product detail changes automatically log activities
- Activity tab only displays these logs (does not create them)

---

## Component Structure

```
ProductDetailTabs
├── TabsList
│   ├── Details Tab Trigger
│   ├── Inventory Tab Trigger
│   ├── Promotion Tab Trigger
│   └── Activity Tab Trigger
└── TabsContent
    ├── ProductDetailsTab (Details)
    ├── ProductInventoryTab (Inventory)
    ├── ProductPromotionTab (Promotion)
    └── ProductActivityTab (Activity - Read-only)
```

---

## Data Flow

### Details Tab
```
User edits product name
  → ProductDetailsTab updates product
  → Activity log entry created automatically (by service layer)
  → Activity tab shows new entry (read-only)
```

### Inventory Tab
```
User increases stock
  → ProductInventoryTab calls inventory service
  → Inventory service updates stock
  → Activity log entry created automatically (by integration layer)
  → Activity tab shows new entry (read-only)
```

### Promotion Tab
```
User promotes product
  → ProductPromotionTab calls promotion service
  → Promotion service updates promotion status
  → Activity log entry created automatically (by service layer)
  → Activity tab shows new entry (read-only)
```

### Activity Tab
```
User views activity log
  → ProductActivityTab reads activity log entries
  → Displays entries (read-only)
  → No mutations possible
```

---

## Implementation Guidelines

### 1. Tab Components Should:
- Only import services for their own domain
- Not directly call services from other domains
- Use props to receive read-only data from other domains
- Handle their own loading and error states

### 2. Service Layer Should:
- Handle automatic activity logging
- Enforce domain boundaries
- Provide clear error messages
- Return structured results

### 3. Activity Tab Should:
- Only use read methods from ActivityLogService
- Never call write methods
- Display data in a clear, chronological format
- Provide filtering and search capabilities

---

## Example: Tab Component Structure

### Details Tab
```javascript
export function ProductDetailsTab({ productId }) {
  // Only uses ProductService
  const { product, updateProduct } = useProduct(productId);
  
  // Can read inventory for display (e.g., show stock status)
  const { currentStock } = useInventory(productId); // Read-only
  
  // Handles only product details
  const handleUpdateName = (newName) => {
    updateProduct({ name: newName });
    // Activity log created automatically by ProductService
  };
  
  // Does NOT modify inventory
}
```

### Inventory Tab
```javascript
export function ProductInventoryTab({ productId }) {
  // Only uses InventoryService
  const { inventory, increaseStock, writeOff } = useInventory(productId);
  
  // Can read product for display (e.g., show product name)
  const { product } = useProduct(productId); // Read-only
  
  // Handles only inventory operations
  const handleIncreaseStock = (quantity, reason) => {
    increaseStock({ quantity, reason });
    // Activity log created automatically by InventoryService integration
  };
  
  // Does NOT modify product details
}
```

### Activity Tab
```javascript
export function ProductActivityTab({ productId }) {
  // Only uses ActivityLogService read methods
  const { activity, isLoading } = useActivityLog(productId);
  
  // Read-only - no mutations
  // Only displays activity entries
  
  // Does NOT modify anything
}
```

---

## Summary

- **4 Tabs:** Details, Inventory, Promotion, Activity
- **Independent Domains:** Each tab owns its data
- **No Cross-Tab Mutations:** Tabs cannot modify each other's data
- **Read-Only Activity:** Activity tab is strictly read-only
- **Automatic Logging:** Activity entries created automatically by services
- **Clear Boundaries:** Each tab operates only on its concern
