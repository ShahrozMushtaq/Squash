# Product State Machine

## Overview
Product lifecycle and state management as a finite state machine. Defines allowed states, transitions, and derivation rules.

---

## Product States

### State Definitions

#### 1. **Active** (Base Operational State)
- **Type:** Manual (admin-controlled)
- **Description:** Product is available for sale and visible in catalog
- **Default State:** Yes (new products start as Active)
- **Derived From:** Admin action
- **Mutually Exclusive With:** None (can coexist with other states)

#### 2. **Out of Stock** (Inventory-Driven State)
- **Type:** Derived (system-driven)
- **Description:** Product has zero available inventory
- **Derived From:** `InventoryRecord.currentStock === 0` OR `InventoryRecord.stockState === "out_of_stock"`
- **Cannot Be:** Manually set (always computed)
- **Mutually Exclusive With:** None (can coexist with Active/Hidden/On Sale)

#### 3. **Hidden** (Visibility State)
- **Type:** Manual (admin-controlled)
- **Description:** Product exists but is not visible in public catalog
- **Derived From:** Admin action
- **Mutually Exclusive With:** None (can coexist with other states)
- **Use Cases:** 
  - Temporarily hide product without deleting
  - Hide products being updated/restocked
  - Hide discontinued products while maintaining history

#### 4. **On Sale** (Promotion-Driven State)
- **Type:** Derived (price-driven)
- **Description:** Product has an active promotion applied
- **Derived From:** `PromotionMetadata.isCurrentlyActive === true` for this product/variant
- **Cannot Be:** Manually set (always computed)
- **Mutually Exclusive With:** None (can coexist with other states)

---

## State Model

### State Representation

Products can have **multiple states simultaneously**. States are represented as a set/array of state flags:

```typescript
ProductState = {
  isActive: boolean,        // Manual: Admin sets
  isOutOfStock: boolean,    // Derived: From inventory
  isHidden: boolean,        // Manual: Admin sets
  isOnSale: boolean         // Derived: From promotions
}
```

### State Combinations

All states are **independent flags** - they can coexist:

| Active | Out of Stock | Hidden | On Sale | Description |
|--------|--------------|--------|---------|-------------|
| ✅ | ❌ | ❌ | ❌ | Normal active product |
| ✅ | ✅ | ❌ | ❌ | Active but out of stock |
| ✅ | ❌ | ✅ | ❌ | Active but hidden from public |
| ✅ | ❌ | ❌ | ✅ | Active and on sale |
| ✅ | ✅ | ✅ | ❌ | Active, out of stock, hidden |
| ✅ | ✅ | ❌ | ✅ | Active, out of stock, on sale |
| ✅ | ❌ | ✅ | ✅ | Active, hidden, on sale |
| ✅ | ✅ | ✅ | ✅ | All states (rare but possible) |
| ❌ | ✅ | ❌ | ❌ | Inactive and out of stock |
| ❌ | ❌ | ✅ | ❌ | Inactive and hidden |

---

## State Transitions

### Transition Rules

#### **Active State Transitions**

**To Active:**
- **From:** Any state
- **Trigger:** Admin action (`setActive()`)
- **Allowed:** Always (unless product is archived)
- **Side Effects:** None

**From Active:**
- **To:** Inactive (via `setInactive()`)
- **Trigger:** Admin action
- **Allowed:** Always
- **Side Effects:** Product becomes unavailable for sale

#### **Out of Stock State Transitions**

**To Out of Stock:**
- **From:** Any state
- **Trigger:** System event (inventory reaches 0)
- **Allowed:** Automatic (cannot be manually set)
- **Conditions:** 
  - `InventoryRecord.currentStock === 0` OR
  - `InventoryRecord.stockState === "out_of_stock"`
- **Side Effects:** 
  - Product may be filtered from "available" searches
  - Add to cart may be disabled (Checkout system decision)

**From Out of Stock:**
- **To:** Not Out of Stock
- **Trigger:** System event (inventory restored)
- **Allowed:** Automatic (cannot be manually cleared)
- **Conditions:** `InventoryRecord.currentStock > 0`
- **Side Effects:** Product becomes available again

#### **Hidden State Transitions**

**To Hidden:**
- **From:** Any state
- **Trigger:** Admin action (`setHidden(true)`)
- **Allowed:** Always
- **Side Effects:** 
  - Product removed from public catalog views
  - Product still accessible via direct ID/URL (admin decision)
  - Product still appears in admin interfaces

**From Hidden:**
- **To:** Not Hidden
- **Trigger:** Admin action (`setHidden(false)`)
- **Allowed:** Always
- **Side Effects:** Product becomes visible in public catalog

#### **On Sale State Transitions**

**To On Sale:**
- **From:** Any state
- **Trigger:** System event (promotion becomes active)
- **Allowed:** Automatic (cannot be manually set)
- **Conditions:** 
  - `PromotionMetadata.isCurrentlyActive === true` exists for product/variant
  - Promotion's `startDate <= currentDate <= endDate`
  - Promotion's `isActive === true`
  - Promotion's `currentUses < maxUses` (if `maxUses` is set)
- **Side Effects:** 
  - Product price displays as discounted
  - Promotion badge/indicator may be shown (UI decision)

**From On Sale:**
- **To:** Not On Sale
- **Trigger:** System event (promotion expires or is deactivated)
- **Allowed:** Automatic (cannot be manually cleared)
- **Conditions:** 
  - No active `PromotionMetadata` exists for product/variant OR
  - Promotion's `endDate < currentDate` OR
  - Promotion's `isActive === false` OR
  - Promotion's `currentUses >= maxUses`
- **Side Effects:** Product price returns to regular price

---

## State Derivation Rules

### Manual States (Admin-Controlled)

#### **Active**
- **Set By:** Admin action
- **Stored In:** `Product.status` field (enum: `"active"` | `"inactive"`)
- **Default:** `"active"` for new products
- **Validation:** Cannot set to active if product is archived

#### **Hidden**
- **Set By:** Admin action
- **Stored In:** `Product.isHidden` boolean field (new field)
- **Default:** `false` for new products
- **Validation:** None (can be set/unset at any time)

### Derived States (System-Computed)

#### **Out of Stock**
- **Computed From:** `InventoryRecord`
- **Computation Logic:**
  ```typescript
  isOutOfStock = (inventory: InventoryRecord) => {
    if (product.hasVariants) {
      // Product is out of stock if ALL variants are out of stock
      return product.variants.every(v => 
        v.inventoryRecord.currentStock === 0
      );
    } else {
      // Product is out of stock if inventory is 0
      return inventory.currentStock === 0;
    }
  }
  ```
- **Update Trigger:** 
  - When `InventoryRecord.currentStock` changes
  - When `InventoryRecord.stockState` changes
  - When variant inventory changes (for products with variants)
- **Caching:** Can be cached but must be recomputed on inventory changes

#### **On Sale**
- **Computed From:** `PromotionMetadata`
- **Computation Logic:**
  ```typescript
  isOnSale = (product: Product, currentDate: Date) => {
    // Check product-level promotions
    const productPromotions = product.promotions.filter(p => 
      p.isActive === true &&
      currentDate >= p.startDate &&
      currentDate <= p.endDate &&
      (p.maxUses === null || p.currentUses < p.maxUses)
    );
    
    if (productPromotions.length > 0) {
      return true;
    }
    
    // Check variant-level promotions (if product has variants)
    if (product.hasVariants) {
      return product.variants.some(v => 
        v.promotions.some(p =>
          p.isActive === true &&
          currentDate >= p.startDate &&
          currentDate <= p.endDate &&
          (p.maxUses === null || p.currentUses < p.maxUses)
        )
      );
    }
    
    return false;
  }
  ```
- **Update Trigger:**
  - When `PromotionMetadata` is created/updated/deleted
  - When promotion's `startDate` or `endDate` is reached (scheduled check)
  - When promotion's `currentUses` reaches `maxUses`
  - When promotion's `isActive` flag changes
- **Caching:** Can be cached but must be recomputed on promotion changes or date transitions

---

## State Transition Diagram

```
                    ┌─────────────┐
                    │   Initial   │
                    │   (New)     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Active    │◄──────┐
                    │   (Base)    │       │
                    └──────┬──────┘       │
                           │              │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Out of Stock  │  │    Hidden     │  │   On Sale    │
│  (Derived)    │  │   (Manual)    │  │  (Derived)   │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Inactive   │
                    │  (Manual)    │
                    └──────────────┘
```

**Note:** States can coexist. The diagram shows possible transitions, not mutually exclusive paths.

---

## State Priority & Display Logic

### State Priority (for UI/Display decisions)

When multiple states are active, priority order:

1. **Hidden** (highest priority)
   - If `isHidden === true`, product should not appear in public catalog
   - Overrides all other states for visibility

2. **Out of Stock**
   - If `isOutOfStock === true`, product may be shown but marked unavailable
   - May disable add-to-cart functionality

3. **On Sale**
   - If `isOnSale === true`, show promotion badge/indicator
   - Display discounted price

4. **Active**
   - Base state - if `isActive === false`, product is unavailable

### Display Rules (for other systems like Checkout)

```typescript
function canDisplayProduct(product: Product): boolean {
  // Hidden products are not displayed
  if (product.isHidden) return false;
  
  // Inactive products are not displayed
  if (!product.isActive) return false;
  
  return true;
}

function canAddToCart(product: Product): boolean {
  // Must be displayable
  if (!canDisplayProduct(product)) return false;
  
  // Cannot add if out of stock
  if (product.isOutOfStock) return false;
  
  // Must have variant selected if product has variants
  if (product.hasVariants && !selectedVariant) return false;
  
  return true;
}
```

---

## State Validation Rules

### Transition Validation

1. **Active → Inactive**
   - ✅ Always allowed
   - ⚠️ Warning if product has pending orders

2. **Inactive → Active**
   - ✅ Allowed if product is not archived
   - ❌ Blocked if product is archived

3. **Hidden Toggle**
   - ✅ Always allowed (can toggle at any time)
   - No restrictions

4. **Out of Stock**
   - ✅ Automatically set when inventory reaches 0
   - ❌ Cannot be manually set
   - ✅ Automatically cleared when inventory restored

5. **On Sale**
   - ✅ Automatically set when promotion becomes active
   - ❌ Cannot be manually set
   - ✅ Automatically cleared when promotion expires

### State Consistency Rules

1. **Archived Products**
   - Cannot be set to Active
   - Cannot have promotions (On Sale cannot be true)
   - Can remain Hidden or Out of Stock

2. **Products with Variants**
   - `isOutOfStock` is true only if ALL variants are out of stock
   - `isOnSale` is true if ANY variant has active promotion

3. **Deleted Products**
   - All states become irrelevant
   - Product should be soft-deleted (archived) rather than hard-deleted

---

## State Change Events

### Events Emitted on State Changes

1. **Active State Changed**
   - Event: `product.active.changed`
   - Payload: `{ productId, oldState, newState, changedBy }`

2. **Out of Stock State Changed**
   - Event: `product.outOfStock.changed`
   - Payload: `{ productId, oldState, newState, inventoryRecord }`

3. **Hidden State Changed**
   - Event: `product.hidden.changed`
   - Payload: `{ productId, oldState, newState, changedBy }`

4. **On Sale State Changed**
   - Event: `product.onSale.changed`
   - Payload: `{ productId, oldState, newState, promotionId }`

### Event Listeners (for other systems)

- **Checkout System:** Listen to `outOfStock.changed` to update availability
- **Search/Display Systems:** Listen to `hidden.changed` to update visibility
- **Pricing Systems:** Listen to `onSale.changed` to update displayed prices
- **Analytics:** Listen to all state changes for reporting

---

## Implementation Notes

### State Storage

```typescript
interface Product {
  // Manual states
  status: "active" | "inactive" | "archived";  // Active state
  isHidden: boolean;                            // Hidden state
  
  // Derived states (computed, not stored)
  // These are computed on read/query
  isOutOfStock: boolean;  // Computed from InventoryRecord
  isOnSale: boolean;      // Computed from PromotionMetadata
}
```

### State Computation

- **Derived states** should be computed:
  - On product read/query
  - When related entities change (inventory, promotions)
  - Can be cached with TTL (time-to-live) for performance
  - Must be invalidated when dependencies change

### State Queries

- Filter products by state combinations:
  - `active AND NOT hidden` - Visible active products
  - `active AND NOT outOfStock` - Available products
  - `active AND onSale` - Products currently on sale
  - `hidden OR NOT active` - Hidden/unavailable products

---

## Summary

### State Types
- **Manual (Admin):** Active, Hidden
- **Derived (System):** Out of Stock, On Sale

### Mutually Exclusive
- **None** - All states can coexist

### Transition Rules
- Manual states: Admin-controlled transitions
- Derived states: Automatic transitions based on dependencies
- No invalid transitions (all transitions are allowed based on conditions)

### Key Principles
1. States are independent flags (not mutually exclusive)
2. Derived states are always computed, never manually set
3. Manual states can be changed by admin at any time
4. State changes emit events for other systems to react
5. State priority determines display/availability logic
