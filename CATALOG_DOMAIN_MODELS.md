# Catalog - Core Domain Models

## Overview
Pure domain model definitions for Catalog system. No UI, no API, no database concerns - only business logic and data structures.

---

## 1. Product

### Definition
A Product represents a sellable item in the catalog. Products may have variants (e.g., sizes, colors, types) or exist as standalone items.

### Fields

#### Required Fields
- **`id`** (string, unique identifier)
  - Format: UUID or numeric string
  - Immutable after creation
  - Primary identifier

- **`name`** (string)
  - Min length: 1 character
  - Max length: 255 characters
  - Must be unique within active products (case-insensitive)
  - Display name for the product

- **`basePrice`** (number, decimal)
  - Must be >= 0
  - Precision: 2 decimal places (currency)
  - Base price before any promotions or variant overrides

- **`categoryId`** (string, foreign key)
  - References: `Category.id`
  - Must reference an active category
  - Product must belong to exactly one category

- **`hasVariants`** (boolean)
  - Indicates if product has variant options
  - If `true`, product cannot be sold without variant selection
  - If `false`, product is sold directly

- **`status`** (enum: `"active"` | `"inactive"` | `"archived"`)
  - `active`: Product is available for sale
  - `inactive`: Product exists but not available for sale
  - `archived`: Product is soft-deleted, historical record only
  - Default: `"active"`

- **`createdAt`** (timestamp)
  - Immutable after creation
  - ISO 8601 format

- **`updatedAt`** (timestamp)
  - Updated on every modification
  - ISO 8601 format

#### Optional Fields
- **`description`** (string, nullable)
  - Max length: 5000 characters
  - Rich text or plain text description

- **`sku`** (string, nullable, unique if provided)
  - Stock Keeping Unit identifier
  - Format: alphanumeric, max 50 characters
  - If provided, must be unique across all products

- **`variantType`** (string, nullable)
  - Required if `hasVariants === true`
  - Examples: "Size", "Color", "Court Type", "Racket Type"
  - Describes what type of variant this product has

- **`imageUrls`** (array of strings, nullable)
  - Array of image URL strings
  - Max 10 images per product
  - First image is primary/thumbnail

- **`tags`** (array of strings, nullable)
  - Array of tag strings for search/filtering
  - Max 20 tags per product
  - Case-insensitive

- **`metadata`** (object, nullable)
  - Free-form JSON object for additional product data
  - Examples: weight, dimensions, specifications

### Constraints
- Product name must be unique among active products
- If `hasVariants === true`, `variantType` is required
- If `hasVariants === false`, product cannot have variants
- `basePrice` must be >= 0
- Product with `status === "archived"` cannot be reactivated

### Relationships
- **Belongs to:** `Category` (via `categoryId`)
- **Has many:** `Variant` (if `hasVariants === true`)
- **Has many:** `InventoryRecord` (one per product or per variant)
- **Has many:** `PromotionMetadata` (product-level promotions)
- **Has many:** `ActivityLog` (audit trail)

---

## 2. Variant

### Definition
A Variant represents a specific option/configuration of a Product. Variants allow products to have different prices, SKUs, and inventory levels for different options (e.g., Size 7 vs Size 8, Standard vs Premium).

### Fields

#### Required Fields
- **`id`** (string, unique identifier)
  - Format: UUID or composite key (productId_variantName)
  - Immutable after creation
  - Primary identifier

- **`productId`** (string, foreign key)
  - References: `Product.id`
  - Variant belongs to exactly one product
  - Product must have `hasVariants === true`

- **`name`** (string)
  - Min length: 1 character
  - Max length: 100 characters
  - Display name for the variant (e.g., "Size 7", "Premium", "Red")
  - Must be unique within the product

- **`price`** (number, decimal)
  - Must be >= 0
  - Precision: 2 decimal places (currency)
  - Overrides product's `basePrice` for this variant
  - If not provided, inherits from product's `basePrice`

- **`createdAt`** (timestamp)
  - Immutable after creation
  - ISO 8601 format

- **`updatedAt`** (timestamp)
  - Updated on every modification
  - ISO 8601 format

#### Optional Fields
- **`sku`** (string, nullable, unique if provided)
  - Stock Keeping Unit identifier for this variant
  - Format: alphanumeric, max 50 characters
  - If provided, must be unique across all variants

- **`imageUrl`** (string, nullable)
  - Variant-specific image URL
  - Overrides product's primary image if provided

- **`metadata`** (object, nullable)
  - Free-form JSON object for variant-specific data
  - Examples: size chart, color hex code, material type

### Constraints
- Variant `name` must be unique within the product
- Variant can only exist if parent product has `hasVariants === true`
- Variant `price` must be >= 0
- Deleting a product must cascade delete all variants (or prevent deletion if variants exist)

### Relationships
- **Belongs to:** `Product` (via `productId`)
- **Has one:** `InventoryRecord` (one inventory record per variant)
- **Has many:** `PromotionMetadata` (variant-level promotions)
- **Has many:** `ActivityLog` (audit trail)

---

## 3. InventoryRecord

### Definition
An InventoryRecord tracks the current stock level and state for a Product or Variant. Each Product (without variants) or Variant has exactly one InventoryRecord.

### Fields

#### Required Fields
- **`id`** (string, unique identifier)
  - Format: UUID
  - Primary identifier

- **`productId`** (string, foreign key)
  - References: `Product.id`
  - Every inventory record must reference a product

- **`currentStock`** (integer)
  - Must be >= 0
  - Current quantity available
  - Cannot be negative

- **`stockState`** (enum: `"in_stock"` | `"low_stock"` | `"out_of_stock"`)
  - `in_stock`: Stock is above low stock threshold
  - `low_stock`: Stock is at or below low stock threshold but > 0
  - `out_of_stock`: Stock is 0
  - Computed from `currentStock` and `lowStockThreshold`
  - Cannot be manually set (derived field)

- **`lastUpdated`** (timestamp)
  - Updated whenever stock changes
  - ISO 8601 format

#### Optional Fields
- **`variantId`** (string, nullable, foreign key)
  - References: `Variant.id`
  - Required if product has variants (`Product.hasVariants === true`)
  - Must be null if product has no variants
  - Creates one-to-one relationship: Variant → InventoryRecord

- **`reorderPoint`** (integer, nullable)
  - Must be >= 0 if provided
  - Stock level at which reorder alert should trigger
  - If `currentStock <= reorderPoint`, alert should be generated

- **`lowStockThreshold`** (integer, nullable)
  - Must be >= 0 if provided
  - Stock level below which `stockState` becomes `"low_stock"`
  - Default: 3 if not provided
  - Used to compute `stockState`

- **`lastRestocked`** (timestamp, nullable)
  - Last time inventory was increased (restocked)
  - ISO 8601 format
  - Updated when stock increases

- **`reservedStock`** (integer, nullable)
  - Must be >= 0 if provided
  - Stock reserved for pending orders/transactions
  - `availableStock = currentStock - reservedStock`
  - Default: 0

### Constraints
- `currentStock` cannot be negative
- If `variantId` is provided, product must have `hasVariants === true`
- If `variantId` is null, product must have `hasVariants === false`
- Exactly one InventoryRecord per Product (if no variants) or per Variant
- `stockState` is computed, not manually settable:
  - If `currentStock === 0`: `stockState = "out_of_stock"`
  - Else if `currentStock <= lowStockThreshold`: `stockState = "low_stock"`
  - Else: `stockState = "in_stock"`
- `reorderPoint` should typically be >= `lowStockThreshold`

### Relationships
- **Belongs to:** `Product` (via `productId`)
- **Belongs to:** `Variant` (via `variantId`, optional)
- **Has many:** `ActivityLog` (audit trail for stock changes)

### Computed Fields
- **`availableStock`** (integer, computed)
  - Formula: `currentStock - (reservedStock || 0)`
  - Stock available for new orders

---

## 4. PromotionMetadata

### Definition
PromotionMetadata defines product-level or variant-level promotional pricing and discounts. Promotions have time windows and can override regular pricing.

### Fields

#### Required Fields
- **`id`** (string, unique identifier)
  - Format: UUID
  - Primary identifier

- **`productId`** (string, foreign key)
  - References: `Product.id`
  - Promotion applies to this product

- **`discountType`** (enum: `"percentage"` | `"fixed_amount"`)
  - `percentage`: Discount is a percentage (e.g., 10% off)
  - `fixed_amount`: Discount is a fixed amount (e.g., $5 off)

- **`discountValue`** (number, decimal)
  - Must be > 0
  - Precision: 2 decimal places
  - If `discountType === "percentage"`: value between 0-100 (e.g., 10 = 10%)
  - If `discountType === "fixed_amount"`: value in currency units

- **`startDate`** (timestamp)
  - Promotion becomes active at this time
  - ISO 8601 format
  - Must be <= `endDate`

- **`endDate`** (timestamp)
  - Promotion expires at this time
  - ISO 8601 format
  - Must be >= `startDate`

- **`createdAt`** (timestamp)
  - Immutable after creation
  - ISO 8601 format

#### Optional Fields
- **`variantId`** (string, nullable, foreign key)
  - References: `Variant.id`
  - If provided, promotion applies only to this variant
  - If null, promotion applies to entire product (all variants if applicable)

- **`name`** (string, nullable)
  - Max length: 255 characters
  - Human-readable promotion name (e.g., "Summer Sale", "Black Friday")

- **`description`** (string, nullable)
  - Max length: 1000 characters
  - Promotion description/details

- **`maxUses`** (integer, nullable)
  - Must be > 0 if provided
  - Maximum number of times promotion can be applied
  - If null, unlimited uses

- **`currentUses`** (integer, nullable)
  - Must be >= 0 if provided
  - Current number of times promotion has been applied
  - Default: 0
  - Must be <= `maxUses` if `maxUses` is provided

- **`isActive`** (boolean, nullable)
  - Manual override to enable/disable promotion
  - If false, promotion is inactive regardless of dates
  - Default: `true`
  - Computed: `isActive && currentDate >= startDate && currentDate <= endDate && (maxUses === null || currentUses < maxUses)`

### Constraints
- `endDate` must be >= `startDate`
- `discountValue` must be > 0
- If `discountType === "percentage"`, `discountValue` must be <= 100
- If `variantId` is provided, product must have `hasVariants === true`
- `currentUses` must be <= `maxUses` if `maxUses` is provided
- Promotion cannot overlap with another active promotion for the same product/variant

### Relationships
- **Belongs to:** `Product` (via `productId`)
- **Belongs to:** `Variant` (via `variantId`, optional)
- **Has many:** `ActivityLog` (audit trail)

### Computed Fields
- **`isCurrentlyActive`** (boolean, computed)
  - Formula: `isActive && currentDate >= startDate && currentDate <= endDate && (maxUses === null || currentUses < maxUses)`
  - Whether promotion is currently applicable

- **`discountedPrice`** (number, computed)
  - Formula depends on `discountType`:
    - If `percentage`: `originalPrice * (1 - discountValue / 100)`
    - If `fixed_amount`: `Math.max(0, originalPrice - discountValue)`
  - Final price after promotion applied

---

## 5. Category

### Definition
A Category organizes products into hierarchical groups. Categories can have parent categories to create a tree structure.

### Fields

#### Required Fields
- **`id`** (string, unique identifier)
  - Format: UUID or slug
  - Immutable after creation
  - Primary identifier

- **`name`** (string)
  - Min length: 1 character
  - Max length: 100 characters
  - Must be unique (case-insensitive)
  - Display name for the category

- **`isActive`** (boolean)
  - Whether category is currently active
  - Inactive categories cannot have new products assigned
  - Default: `true`

- **`createdAt`** (timestamp)
  - Immutable after creation
  - ISO 8601 format

- **`updatedAt`** (timestamp)
  - Updated on every modification
  - ISO 8601 format

#### Optional Fields
- **`description`** (string, nullable)
  - Max length: 1000 characters
  - Category description

- **`parentCategoryId`** (string, nullable, foreign key)
  - References: `Category.id` (self-referential)
  - Creates category hierarchy
  - If provided, category is a subcategory
  - If null, category is a top-level category
  - Cannot reference itself (no circular references)
  - Maximum depth: 3 levels (root → level 1 → level 2)

- **`displayOrder`** (integer, nullable)
  - Must be >= 0 if provided
  - Order for display/sorting purposes
  - Lower numbers appear first
  - If null, sorted alphabetically by name

- **`slug`** (string, nullable, unique if provided)
  - URL-friendly identifier
  - Format: lowercase, alphanumeric, hyphens
  - Max length: 100 characters
  - If provided, must be unique

- **`imageUrl`** (string, nullable)
  - Category image/icon URL

- **`metadata`** (object, nullable)
  - Free-form JSON object for additional category data

### Constraints
- Category `name` must be unique (case-insensitive)
- `parentCategoryId` cannot reference itself
- Maximum category depth: 3 levels
- Cannot delete category if it has products assigned (or must reassign products first)
- Cannot delete category if it has subcategories (or must delete/reassign subcategories first)
- `displayOrder` must be unique within siblings (categories with same `parentCategoryId`)

### Relationships
- **Has many:** `Product` (products assigned to this category)
- **Belongs to:** `Category` (via `parentCategoryId`, optional, self-referential)
- **Has many:** `Category` (subcategories, via `parentCategoryId`)
- **Has many:** `ActivityLog` (audit trail)

### Computed Fields
- **`path`** (string, computed)
  - Full category path (e.g., "Sports > Equipment > Rackets")
  - Computed by traversing parent chain

- **`level`** (integer, computed)
  - Depth level in hierarchy (0 = root, 1 = first level, etc.)
  - Computed by counting parent chain

---

## 6. ActivityLog

### Definition
An ActivityLog records all changes and actions performed on Catalog entities. Provides audit trail and change history.

### Fields

#### Required Fields
- **`id`** (string, unique identifier)
  - Format: UUID
  - Primary identifier

- **`entityType`** (enum: `"product"` | `"variant"` | `"inventory"` | `"promotion"` | `"category"`)
  - Type of entity that was modified
  - Determines which entity the log entry refers to

- **`entityId`** (string)
  - ID of the entity that was modified
  - References the entity identified by `entityType`

- **`action`** (enum: `"created"` | `"updated"` | `"deleted"` | `"stock_adjusted"` | `"status_changed"` | `"promotion_applied"` | `"promotion_expired"`)
  - Type of action performed
  - `created`: Entity was created
  - `updated`: Entity was modified
  - `deleted`: Entity was deleted (soft or hard)
  - `stock_adjusted`: Inventory stock was changed
  - `status_changed`: Entity status changed (e.g., active → inactive)
  - `promotion_applied`: Promotion was applied to a transaction
  - `promotion_expired`: Promotion expired

- **`performedBy`** (string)
  - User ID or system identifier who performed the action
  - Format: user ID string or "system"

- **`timestamp`** (timestamp)
  - When the action occurred
  - ISO 8601 format
  - Immutable after creation

#### Optional Fields
- **`changes`** (object, nullable)
  - JSON object describing what changed
  - Format: `{ field: { old: value, new: value }, ... }`
  - Example: `{ "price": { "old": 25.00, "new": 30.00 }, "status": { "old": "active", "new": "inactive" } }`

- **`metadata`** (object, nullable)
  - Additional context about the action
  - Examples: reason for change, related transaction ID, IP address
  - Free-form JSON object

- **`previousState`** (object, nullable)
  - Snapshot of entity state before the change
  - Full entity object (for deleted entities or major changes)

- **`newState`** (object, nullable)
  - Snapshot of entity state after the change
  - Full entity object (for created entities or major changes)

### Constraints
- `entityId` must reference a valid entity of type `entityType`
- `timestamp` cannot be in the future
- `changes` object should only include fields that actually changed
- Log entries are immutable (cannot be updated or deleted)

### Relationships
- **Belongs to:** Various entities (via `entityType` + `entityId` composite reference)
  - Product (if `entityType === "product"`)
  - Variant (if `entityType === "variant"`)
  - InventoryRecord (if `entityType === "inventory"`)
  - PromotionMetadata (if `entityType === "promotion"`)
  - Category (if `entityType === "category"`)

### Use Cases
- Audit trail for compliance
- Debugging and troubleshooting
- Change history for users
- Analytics on catalog changes
- Rollback support (using `previousState`)

---

## Domain Model Relationships Summary

```
Category (1) ──< (many) Product
Product (1) ──< (many) Variant (if hasVariants === true)
Product (1) ──< (1) InventoryRecord (if hasVariants === false)
Variant (1) ──< (1) InventoryRecord (if hasVariants === true)
Product (1) ──< (many) PromotionMetadata
Variant (1) ──< (many) PromotionMetadata
Category (1) ──< (many) Category (self-referential, parent-child)
All Entities ──< (many) ActivityLog
```

---

## Validation Rules Summary

### Product
- Name unique among active products
- `variantType` required if `hasVariants === true`
- `basePrice >= 0`

### Variant
- Name unique within product
- Product must have `hasVariants === true`
- `price >= 0`

### InventoryRecord
- `currentStock >= 0`
- `variantId` required if product has variants
- `variantId` must be null if product has no variants
- `stockState` is computed, not settable

### PromotionMetadata
- `endDate >= startDate`
- `discountValue > 0`
- Percentage discounts: `discountValue <= 100`
- `currentUses <= maxUses` if `maxUses` provided

### Category
- Name unique (case-insensitive)
- Maximum depth: 3 levels
- Cannot reference itself
- `displayOrder` unique within siblings

### ActivityLog
- `timestamp` cannot be in future
- Log entries are immutable
