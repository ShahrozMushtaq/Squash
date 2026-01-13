# Categories - Category Management System

## Overview
Categories organize products into groups. Each product belongs to exactly one category. Hiding a category hides all products within it.

---

## Key Principles

### ✅ Category Rules:
- Every product belongs to exactly one category
- Hiding a category hides all products within it
- Categories have display order for sorting
- Categories can be active or hidden
- No multi-category assignment

### ❌ What Categories DO NOT:
- Support product assignment to multiple categories
- Support category hierarchies (flat structure only)
- Modify product data directly
- Affect product pricing or inventory

---

## Category Fields

### Required Fields

- **`id`** (string)
  - Unique category identifier
  - Immutable after creation

- **`name`** (string)
  - Category display name
  - Must be unique
  - Max length: 100 characters
  - Required

- **`visibility`** (enum: `"ACTIVE"` | `"HIDDEN"`)
  - Category visibility state
  - `ACTIVE`: Category and products are visible
  - `HIDDEN`: Category and products are hidden
  - Default: `"ACTIVE"`

- **`displayOrder`** (number)
  - Order for display/sorting
  - Lower numbers appear first
  - Default: 0
  - Used for sorting categories

### Optional Fields

- **`description`** (string | null)
  - Category description
  - Max length: 1000 characters
  - Optional

- **`slug`** (string | null)
  - URL-friendly identifier
  - Optional, unique if provided

- **`imageUrl`** (string | null)
  - Category image/icon URL
  - Optional

- **`metadata`** (object)
  - Additional metadata
  - Free-form JSON object

---

## Constraints

### 1. Single Category Assignment
- **Rule:** Every product belongs to exactly one category
- **Enforcement:** Product must have `categoryId` field
- **Violation:** Product cannot be created without a category

### 2. Category Hiding
- **Rule:** Hiding a category hides all products within it
- **Enforcement:** Products are filtered by category visibility at query time
- **Behavior:** When category is hidden, products in that category are not returned in queries

### 3. Category Name Uniqueness
- **Rule:** Category names must be unique
- **Enforcement:** Checked on create and rename
- **Violation:** Operation fails if name already exists

### 4. Category Deletion
- **Rule:** Cannot delete category with products (unless force delete)
- **Enforcement:** Checked before deletion
- **Violation:** Operation fails if category has products

---

## Supported Actions

### 1. Create Category

```javascript
const categoryService = new CategoryService(categoryStore, productStore);

const category = await categoryService.createCategory({
  id: "cat_equipment",
  name: "Equipment",
  visibility: CATEGORY_VISIBILITY.ACTIVE,
  displayOrder: 1,
  description: "Squash equipment and gear",
});
```

### 2. Rename Category

```javascript
await categoryService.renameCategory("cat_equipment", "Squash Equipment");
```

### 3. Reorder Categories

```javascript
await categoryService.reorderCategories([
  { categoryId: "cat_equipment", displayOrder: 1 },
  { categoryId: "cat_courts", displayOrder: 2 },
  { categoryId: "cat_beverages", displayOrder: 3 },
]);
```

### 4. Hide Category

```javascript
await categoryService.hideCategory("cat_equipment");

// All products in "Equipment" category are now hidden
```

### 5. Unhide Category

```javascript
await categoryService.unhideCategory("cat_equipment");

// All products in "Equipment" category become visible again
```

---

## Usage Examples

### Example 1: Create and Use Categories

```javascript
// Create categories
const equipment = await categoryService.createCategory({
  id: "cat_equipment",
  name: "Equipment",
  displayOrder: 1,
});

const courts = await categoryService.createCategory({
  id: "cat_courts",
  name: "Court Rental",
  displayOrder: 2,
});

// Create product with category
const product = await productService.createProduct({
  id: "prod_123",
  name: "Racket",
  categoryId: equipment.id, // Must belong to exactly one category
  price: 50.00,
});
```

### Example 2: Hide Category and Products

```javascript
// Hide category
await categoryService.hideCategory("cat_equipment");

// Products in this category are now hidden
const products = await productService.getAllProducts({ onlyVisible: true });
// Products in "Equipment" category are filtered out
```

### Example 3: Get Visible Categories

```javascript
// Get only visible categories, sorted by display order
const visibleCategories = await categoryService.getVisibleCategories();

visibleCategories.forEach(category => {
  console.log(`${category.displayOrder}. ${category.name}`);
});
```

### Example 4: Reorder Categories

```javascript
// Reorder categories for display
await categoryService.reorderCategories([
  { categoryId: "cat_courts", displayOrder: 1 },      // First
  { categoryId: "cat_equipment", displayOrder: 2 },   // Second
  { categoryId: "cat_beverages", displayOrder: 3 },   // Third
]);
```

---

## Product-Category Relationship

### Assignment

```javascript
// Product must have categoryId
const product = {
  id: "prod_123",
  name: "Racket",
  categoryId: "cat_equipment", // Required: exactly one category
  // ... other fields
};
```

### Visibility Inheritance

```javascript
// If category is hidden, products are hidden
const category = await categoryService.getCategory("cat_equipment");
if (category.isHidden()) {
  // All products in this category are hidden
  // They will not appear in product queries
}
```

### Query Filtering

```javascript
// Get products, filtering by category visibility
const allCategories = await categoryService.getAllCategories({ onlyVisible: true });
const visibleCategoryIds = allCategories.map(cat => cat.id);

const products = await productService.getAllProducts({
  categoryIds: visibleCategoryIds, // Only products in visible categories
});
```

---

## Category Visibility Flow

### Active Category
```
Category: ACTIVE
  → Products in category: VISIBLE
  → Category appears in category list
  → Products appear in product queries
```

### Hidden Category
```
Category: HIDDEN
  → Products in category: HIDDEN (implicitly)
  → Category does not appear in category list
  → Products do not appear in product queries
```

---

## Best Practices

### 1. **Use Meaningful Names**
- Keep category names clear and descriptive
- Use consistent naming conventions
- Avoid overly specific or overly broad names

### 2. **Set Display Order**
- Use display order to control category listing order
- Lower numbers appear first
- Update order when reorganizing categories

### 3. **Handle Category Hiding**
- Hide categories instead of deleting when possible
- Hidden categories preserve product assignments
- Easier to restore later

### 4. **Product Assignment**
- Ensure every product has a category
- Choose appropriate categories
- Reassign products before deleting categories

---

## Integration with Products

### Product Creation

```javascript
// Product must specify category
const product = await productService.createProduct({
  id: "prod_123",
  name: "Racket",
  categoryId: "cat_equipment", // Required
  // ... other fields
});
```

### Product Queries

```javascript
// Get products, respecting category visibility
const visibleCategories = await categoryService.getVisibleCategories();
const visibleCategoryIds = visibleCategories.map(cat => cat.id);

const products = await productService.getAllProducts({
  categoryIds: visibleCategoryIds,
  onlyVisible: true,
});
```

### Category Filtering

```javascript
// Filter products by category
const equipmentProducts = await productService.getProductsByCategoryId("cat_equipment");

// This will return empty array if category is hidden
const products = await categoryService.getProductsInCategory("cat_equipment");
```

---

## Error Handling

### Common Errors

1. **Category Name Already Exists**
   ```javascript
   try {
     await categoryService.createCategory({ id: "cat_new", name: "Equipment" });
   } catch (error) {
     // Error: "Category with name 'Equipment' already exists"
   }
   ```

2. **Cannot Delete Category with Products**
   ```javascript
   try {
     await categoryService.deleteCategory("cat_equipment");
   } catch (error) {
     // Error: "Cannot delete category 'Equipment' because it contains 5 product(s)"
   }
   ```

3. **Category Not Found**
   ```javascript
   try {
     await categoryService.renameCategory("cat_invalid", "New Name");
   } catch (error) {
     // Error: "Category with ID 'cat_invalid' not found"
   }
   ```

---

## Summary

- **Single Assignment:** Every product belongs to exactly one category
- **Visibility Inheritance:** Hiding category hides all products
- **Display Order:** Categories can be ordered for display
- **Actions:** Create, Rename, Reorder, Hide/Unhide
- **Constraints:** Name uniqueness, deletion protection
- **No Multi-Category:** Products cannot belong to multiple categories
