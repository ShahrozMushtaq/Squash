# Validation & Guardrails

## Overview
Validation rules and guardrails prevent invalid operations and ensure data integrity. Invalid operations fail loudly with explicit error messages.

---

## Validation Rules

### 1. Product State Validation

#### Rules Enforced:
- Product name is required and must be unique (among active products)
- Base price must be >= 0
- Category ID is required
- If product has variants, variantType is required
- If product has variants, variants array is required
- Product without variants cannot have variants
- Status must be valid (active/inactive/archived)
- Archived products cannot be reactivated

#### Failure Example:
```javascript
try {
  await productService.createProduct({
    name: "", // Invalid: empty name
    basePrice: -10, // Invalid: negative price
    categoryId: null, // Invalid: missing category
  });
} catch (error) {
  // Error: "Product validation failed"
  // error.details.errors contains array of validation errors
}
```

---

### 2. Inventory Tracking Disable Prevention

#### Rule:
**Cannot disable inventory tracking when stock exists**

#### Validation:
```javascript
// Current stock: 10
// Attempt to disable tracking
// Result: FAILURE
```

#### Failure Example:
```javascript
try {
  await inventoryService.disableTracking(productId);
  // Current stock: 10
} catch (error) {
  // Error: "Cannot disable inventory tracking when stock exists. Current stock: 10. Please write off or adjust stock to zero first."
  // error.code: "INVENTORY_TRACKING_DISABLED_WITH_STOCK"
}
```

#### Required Actions Before Disabling:
1. Write off all stock, OR
2. Adjust stock to zero, OR
3. Transfer stock to another product

---

### 3. Category Deletion Prevention

#### Rule:
**Cannot delete category with active products (unless force delete)**

#### Validation:
```javascript
// Category has 5 products (3 active, 2 inactive)
// Attempt to delete
// Result: FAILURE (unless force=true)
```

#### Failure Example:
```javascript
try {
  await categoryService.deleteCategory("cat_equipment");
  // Category has 5 products
} catch (error) {
  // Error: "Cannot delete category because it contains 5 product(s). 3 active, 2 inactive. Reassign products to another category first, or use force delete."
  // error.code: "CATEGORY_DELETE_WITH_PRODUCTS"
  // error.details.productIds: ["prod_1", "prod_2", ...]
}
```

#### Required Actions Before Deletion:
1. Reassign all products to another category, OR
2. Delete all products in category, OR
3. Use force delete (destructive)

---

### 4. Category Assignment Validation

#### Rules:
- Category must exist
- Category must be active (cannot assign to hidden category)

#### Failure Example:
```javascript
try {
  await productService.createProduct({
    name: "Racket",
    categoryId: "cat_hidden", // Category is hidden
  });
} catch (error) {
  // Error: "Cannot assign product to hidden category 'Equipment'. Unhide the category first."
  // error.code: "INVALID_CATEGORY_ASSIGNMENT"
}
```

---

## Error Structure

### Validation Error Format

```javascript
{
  code: "INVALID_PRODUCT_STATE",
  message: "Product validation failed",
  errors: [
    {
      code: "MISSING_PRODUCT_NAME",
      message: "Product name is required and must be a non-empty string",
      field: "name",
    },
    {
      code: "INVALID_BASE_PRICE",
      message: "Base price must be a number >= 0",
      field: "basePrice",
      provided: -10,
    },
  ],
}
```

### Thrown Error

```javascript
try {
  await productService.createProduct(invalidProduct);
} catch (error) {
  console.error(error.message); // "Product validation failed"
  console.error(error.code); // "INVALID_PRODUCT_STATE"
  console.error(error.details); // Full error object with errors array
}
```

---

## Usage Examples

### Example 1: Product Validation

```javascript
// Valid product
const product = await productService.createProduct({
  id: "prod_123",
  name: "Racket",
  basePrice: 50.00,
  categoryId: "cat_equipment",
  hasVariants: false,
  status: "active",
});

// Invalid product - fails loudly
try {
  await productService.createProduct({
    name: "", // Invalid
    basePrice: -10, // Invalid
    categoryId: null, // Invalid
  });
} catch (error) {
  // Explicit failure with detailed errors
  error.details.errors.forEach(err => {
    console.error(`${err.field}: ${err.message}`);
  });
}
```

### Example 2: Inventory Tracking Disable

```javascript
// Attempt to disable tracking with stock
try {
  await inventoryService.disableTracking("prod_123");
  // Current stock: 10
} catch (error) {
  // Fails loudly
  // Error: "Cannot disable inventory tracking when stock exists. Current stock: 10..."
  
  // Must write off stock first
  await inventoryService.writeOff({
    productId: "prod_123",
    quantity: 10,
    reason: "Disabling tracking",
    writeOffType: "loss",
    performedBy: "user_456",
  });
  
  // Now can disable tracking
  await inventoryService.disableTracking("prod_123");
}
```

### Example 3: Category Deletion

```javascript
// Attempt to delete category with products
try {
  await categoryService.deleteCategory("cat_equipment");
  // Category has 5 products
} catch (error) {
  // Fails loudly
  // Error: "Cannot delete category because it contains 5 product(s)..."
  
  // Must reassign products first
  const products = await productService.getProductsByCategoryId("cat_equipment");
  for (const product of products) {
    await productService.updateProduct(product.id, {
      categoryId: "cat_other",
    });
  }
  
  // Now can delete category
  await categoryService.deleteCategory("cat_equipment");
}
```

---

## Guardrail Enforcement

### 1. Product Service
- Validates product state before create/update
- Validates category assignment
- Validates variant configuration
- Fails loudly on validation errors

### 2. Inventory Service
- Validates inventory operations
- Prevents disabling tracking with stock
- Enforces stock non-negative rule
- Fails loudly on validation errors

### 3. Category Service
- Validates category deletion
- Validates category assignment
- Validates name uniqueness
- Fails loudly on validation errors

---

## Error Handling Best Practices

### 1. Check Validation Before Operations

```javascript
// Validate before attempting operation
const validation = ValidationService.validateProduct(productData);
if (!validation.valid) {
  // Handle validation errors
  return { success: false, errors: validation.error.errors };
}

// Proceed with operation
await productService.createProduct(productData);
```

### 2. Handle Errors Explicitly

```javascript
try {
  await categoryService.deleteCategory("cat_equipment");
} catch (error) {
  if (error.code === "CATEGORY_DELETE_WITH_PRODUCTS") {
    // Show user-friendly message
    showError(`Cannot delete category. ${error.details.productCount} products must be reassigned first.`);
  } else {
    // Handle other errors
    showError(error.message);
  }
}
```

### 3. Provide User Feedback

```javascript
try {
  await productService.updateProduct(productId, updates);
  showSuccess("Product updated successfully");
} catch (error) {
  if (error.code === "INVALID_PRODUCT_STATE") {
    // Show field-specific errors
    error.details.errors.forEach(err => {
      showFieldError(err.field, err.message);
    });
  } else {
    showError(error.message);
  }
}
```

---

## Summary

- **Product Validation:** Prevents invalid product states
- **Inventory Guardrails:** Prevents disabling tracking with stock
- **Category Protection:** Prevents deleting categories with products
- **Explicit Failures:** All invalid operations fail loudly with detailed errors
- **Error Structure:** Consistent error format with codes and details
- **User Feedback:** Errors provide actionable information
