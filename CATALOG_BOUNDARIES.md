# Catalog - Single Source of Truth Definition

## 🎯 Core Principle
**Catalog is the single source of truth for all product-related data.** This boundary is non-negotiable and must be enforced throughout the application.

---

## ✅ Catalog OWNS (Authoritative Data)

### 1. **Products**
- Product definitions (ID, name, description, base price)
- Product metadata (SKU, barcode, images, tags)
- Product status (active, inactive, archived)
- Product relationships (parent/child products, bundles)

### 2. **Categories**
- Category hierarchy and structure
- Category assignments for products
- Category metadata (name, description, display order)

### 3. **Inventory**
- Stock levels (current quantity)
- Stock states (in_stock, low_stock, out_of_stock)
- Stock thresholds (reorder points, low stock alerts)
- Variant-level inventory (when products have variants)
- Inventory history and tracking

### 4. **Reorder Alerts**
- Low stock warnings
- Reorder point definitions
- Alert rules and thresholds
- Alert status and acknowledgments

### 5. **Product-Level Promotions**
- Product-specific discounts
- Promotional pricing
- Sale periods and schedules
- Promotion rules and conditions

---

## ❌ Catalog DOES NOT Handle

### 1. **Banners or Layout**
- Homepage banners
- Marketing banners
- Display layouts
- UI/UX presentation logic

### 2. **Front-End Messaging**
- User-facing notifications
- Marketing messages
- Display copy
- UI text and labels

### 3. **Checkout Flow**
- Cart management (Checkout owns this)
- Payment processing
- Transaction creation
- Order fulfillment workflow

### 4. **Other Systems**
- Customer data
- Order history
- Analytics and reporting
- User preferences

---

## 🔒 Integration Rules

### For Other Systems (e.g., Checkout):

#### ✅ **ALLOWED Operations:**
1. **READ operations** - Other systems can read from Catalog:
   - Query products by ID, category, or search term
   - Read inventory levels (for display purposes)
   - Read product details (name, price, description)
   - Read stock states (to determine availability)

2. **Controlled Mutations** - Other systems can trigger Catalog updates:
   - Inventory decrements (via Catalog API/service)
   - Stock state updates (via Catalog API/service)
   - All mutations must go through Catalog's controlled interface

#### ❌ **FORBIDDEN Operations:**
1. **Direct Data Modification** - Other systems MUST NOT:
   - Directly modify product data
   - Bypass Catalog's mutation interface
   - Cache product data without invalidation strategy
   - Create duplicate product definitions

2. **Ownership Violations** - Other systems MUST NOT:
   - Store product definitions locally
   - Maintain separate inventory counts
   - Create their own category structures

---

## 📋 Implementation Checklist

Before implementing Catalog features, confirm:

- [ ] Catalog is the only system that can CREATE/UPDATE/DELETE products
- [ ] Catalog is the only system that manages inventory counts
- [ ] Catalog is the only system that defines categories
- [ ] Checkout (and other systems) only READ from Catalog
- [ ] All inventory mutations go through Catalog's service layer
- [ ] No duplicate product data structures exist elsewhere
- [ ] Catalog provides a clear API/service interface for mutations

---

## 🔄 Data Flow Example

### Correct Flow:
```
Checkout needs to decrement inventory:
1. Checkout calls Catalog.decrementInventory(productId, variantId, quantity)
2. Catalog validates the request
3. Catalog updates its internal inventory state
4. Catalog returns success/failure
5. Checkout proceeds based on Catalog's response
```

### Incorrect Flow:
```
❌ Checkout directly modifies product.stock
❌ Checkout maintains its own inventory cache
❌ Checkout creates product objects independently
```

---

## 📝 Notes

- This boundary ensures data consistency and prevents conflicts
- Catalog must provide a robust API/service layer for controlled access
- All product-related queries should route through Catalog
- Inventory updates must be atomic and validated by Catalog
