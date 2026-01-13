/**
 * Validation Rules & Guardrails
 * 
 * Enforces business rules and prevents invalid operations.
 * Invalid operations fail loudly with explicit error messages.
 */

// ============================================================================
// VALIDATION ERROR CODES
// ============================================================================

export const VALIDATION_ERROR_CODES = {
  INVALID_PRODUCT_STATE: "INVALID_PRODUCT_STATE",
  INVENTORY_TRACKING_DISABLED_WITH_STOCK: "INVENTORY_TRACKING_DISABLED_WITH_STOCK",
  CATEGORY_DELETE_WITH_PRODUCTS: "CATEGORY_DELETE_WITH_PRODUCTS",
  INVALID_CATEGORY_ASSIGNMENT: "INVALID_CATEGORY_ASSIGNMENT",
  INVALID_VARIANT_CONFIGURATION: "INVALID_VARIANT_CONFIGURATION",
};

// ============================================================================
// VALIDATION RESULT
// ============================================================================

/**
 * Validation Result
 */
export class ValidationResult {
  constructor(valid, error = null) {
    this.valid = valid;
    this.error = error;
  }

  static success() {
    return new ValidationResult(true);
  }

  static failure(error) {
    return new ValidationResult(false, error);
  }
}

// ============================================================================
// PRODUCT VALIDATION RULES
// ============================================================================

/**
 * Product Validation Rules
 */
export class ProductValidationRules {
  /**
   * Validate product state before saving
   * @param {Object} product - Product object
   * @param {Object} context - Validation context (e.g., existing product, inventory)
   * @returns {ValidationResult} Validation result
   */
  static validateProductState(product, context = {}) {
    const errors = [];

    // Rule 1: Product name is required
    if (!product.name || typeof product.name !== "string" || product.name.trim().length === 0) {
      errors.push({
        code: "MISSING_PRODUCT_NAME",
        message: "Product name is required and must be a non-empty string",
        field: "name",
      });
    }

    // Rule 2: Product name must be unique (among active products)
    if (context.existingProductByName && context.existingProductByName.id !== product.id) {
      errors.push({
        code: "DUPLICATE_PRODUCT_NAME",
        message: `Product with name "${product.name}" already exists`,
        field: "name",
        conflictingProductId: context.existingProductByName.id,
      });
    }

    // Rule 3: Base price must be >= 0
    if (typeof product.basePrice !== "number" || product.basePrice < 0) {
      errors.push({
        code: "INVALID_BASE_PRICE",
        message: "Base price must be a number >= 0",
        field: "basePrice",
        provided: product.basePrice,
      });
    }

    // Rule 4: Category ID is required
    if (!product.categoryId) {
      errors.push({
        code: "MISSING_CATEGORY",
        message: "Product must belong to exactly one category",
        field: "categoryId",
      });
    }

    // Rule 5: If product has variants, variantType is required
    if (product.hasVariants === true) {
      if (!product.variantType || typeof product.variantType !== "string" || product.variantType.trim().length === 0) {
        errors.push({
          code: "MISSING_VARIANT_TYPE",
          message: "Product with variants must specify variantType",
          field: "variantType",
        });
      }

      // Rule 6: Product with variants must have variants array
      if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
        errors.push({
          code: "MISSING_VARIANTS",
          message: "Product with hasVariants=true must have at least one variant",
          field: "variants",
        });
      }
    } else {
      // Rule 7: Product without variants must not have variants array
      if (product.variants && product.variants.length > 0) {
        errors.push({
          code: "INVALID_VARIANT_CONFIGURATION",
          message: "Product with hasVariants=false cannot have variants",
          field: "variants",
        });
      }
    }

    // Rule 8: Status must be valid
    const validStatuses = ["active", "inactive", "archived"];
    if (!validStatuses.includes(product.status)) {
      errors.push({
        code: "INVALID_STATUS",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
        field: "status",
        provided: product.status,
      });
    }

    // Rule 9: Cannot set archived product to active
    if (context.existingProduct && context.existingProduct.status === "archived" && product.status === "active") {
      errors.push({
        code: "CANNOT_REACTIVATE_ARCHIVED",
        message: "Archived products cannot be reactivated",
        field: "status",
        currentStatus: "archived",
        attemptedStatus: "active",
      });
    }

    if (errors.length > 0) {
      return ValidationResult.failure({
        code: VALIDATION_ERROR_CODES.INVALID_PRODUCT_STATE,
        message: "Product validation failed",
        errors,
      });
    }

    return ValidationResult.success();
  }

  /**
   * Validate variant configuration
   * @param {Object} product - Product object
   * @returns {ValidationResult} Validation result
   */
  static validateVariantConfiguration(product) {
    if (!product.hasVariants) {
      return ValidationResult.success();
    }

    const errors = [];

    // Variant names must be unique within product
    const variantNames = product.variants?.map(v => v.name) || [];
    const uniqueNames = new Set(variantNames);
    if (variantNames.length !== uniqueNames.size) {
      errors.push({
        code: "DUPLICATE_VARIANT_NAMES",
        message: "Variant names must be unique within a product",
        field: "variants",
      });
    }

    // Each variant must have required fields
    product.variants?.forEach((variant, index) => {
      if (!variant.name || variant.name.trim().length === 0) {
        errors.push({
          code: "MISSING_VARIANT_NAME",
          message: `Variant at index ${index} is missing a name`,
          field: `variants[${index}].name`,
        });
      }

      if (typeof variant.price !== "number" || variant.price < 0) {
        errors.push({
          code: "INVALID_VARIANT_PRICE",
          message: `Variant "${variant.name}" has invalid price`,
          field: `variants[${index}].price`,
          provided: variant.price,
        });
      }
    });

    if (errors.length > 0) {
      return ValidationResult.failure({
        code: VALIDATION_ERROR_CODES.INVALID_VARIANT_CONFIGURATION,
        message: "Variant configuration validation failed",
        errors,
      });
    }

    return ValidationResult.success();
  }
}

// ============================================================================
// INVENTORY VALIDATION RULES
// ============================================================================

/**
 * Inventory Validation Rules
 */
export class InventoryValidationRules {
  /**
   * Validate that inventory tracking cannot be disabled if stock exists
   * @param {Object} params - Validation parameters
   * @param {number} params.currentStock - Current stock level
   * @param {boolean} params.isTrackingEnabled - Whether tracking is being enabled/disabled
   * @returns {ValidationResult} Validation result
   */
  static validateInventoryTrackingDisable(currentStock, isTrackingEnabled) {
    // If disabling tracking and stock exists, fail
    if (!isTrackingEnabled && currentStock > 0) {
      return ValidationResult.failure({
        code: VALIDATION_ERROR_CODES.INVENTORY_TRACKING_DISABLED_WITH_STOCK,
        message: `Cannot disable inventory tracking when stock exists. Current stock: ${currentStock}. Please write off or adjust stock to zero first.`,
        currentStock,
        attemptedAction: "disable_tracking",
      });
    }

    return ValidationResult.success();
  }

  /**
   * Validate inventory operation
   * @param {Object} params - Operation parameters
   * @param {number} params.currentStock - Current stock
   * @param {number} params.requestedChange - Requested stock change
   * @returns {ValidationResult} Validation result
   */
  static validateInventoryOperation({ currentStock, requestedChange }) {
    const newStock = currentStock + requestedChange;

    // Stock cannot go below zero
    if (newStock < 0) {
      return ValidationResult.failure({
        code: "INSUFFICIENT_STOCK",
        message: `Stock cannot go below zero. Current: ${currentStock}, Requested change: ${requestedChange}, Would result in: ${newStock}`,
        currentStock,
        requestedChange,
        wouldResultIn: newStock,
      });
    }

    return ValidationResult.success();
  }
}

// ============================================================================
// CATEGORY VALIDATION RULES
// ============================================================================

/**
 * Category Validation Rules
 */
export class CategoryValidationRules {
  /**
   * Validate category deletion
   * @param {Object} params - Validation parameters
   * @param {string} params.categoryId - Category ID
   * @param {Array} params.productsInCategory - Products in this category
   * @param {boolean} params.force - Force delete flag
   * @returns {ValidationResult} Validation result
   */
  static validateCategoryDeletion({ categoryId, productsInCategory, force = false }) {
    // If category has products and force is false, fail
    if (productsInCategory.length > 0 && !force) {
      const activeProducts = productsInCategory.filter(p => p.status === "active");
      const inactiveProducts = productsInCategory.filter(p => p.status !== "active");

      return ValidationResult.failure({
        code: VALIDATION_ERROR_CODES.CATEGORY_DELETE_WITH_PRODUCTS,
        message: `Cannot delete category because it contains ${productsInCategory.length} product(s). ${activeProducts.length} active, ${inactiveProducts.length} inactive. Reassign products to another category first, or use force delete.`,
        categoryId,
        productCount: productsInCategory.length,
        activeProductCount: activeProducts.length,
        inactiveProductCount: inactiveProducts.length,
        productIds: productsInCategory.map(p => p.id),
      });
    }

    return ValidationResult.success();
  }

  /**
   * Validate category assignment
   * @param {Object} params - Validation parameters
   * @param {string} params.categoryId - Category ID to assign
   * @param {Object} params.category - Category object (must exist and be active)
   * @returns {ValidationResult} Validation result
   */
  static validateCategoryAssignment({ categoryId, category }) {
    // Category must exist
    if (!category) {
      return ValidationResult.failure({
        code: VALIDATION_ERROR_CODES.INVALID_CATEGORY_ASSIGNMENT,
        message: `Category with ID "${categoryId}" does not exist`,
        categoryId,
      });
    }

    // Category must be active (products cannot be assigned to hidden categories)
    if (category.visibility === "HIDDEN") {
      return ValidationResult.failure({
        code: VALIDATION_ERROR_CODES.INVALID_CATEGORY_ASSIGNMENT,
        message: `Cannot assign product to hidden category "${category.name}". Unhide the category first.`,
        categoryId,
        categoryName: category.name,
      });
    }

    return ValidationResult.success();
  }

  /**
   * Validate category name uniqueness
   * @param {Object} params - Validation parameters
   * @param {string} params.name - Category name
   * @param {Object|null} params.existingCategory - Existing category with same name
   * @param {string|null} params.currentCategoryId - Current category ID (for updates)
   * @returns {ValidationResult} Validation result
   */
  static validateCategoryNameUniqueness({ name, existingCategory, currentCategoryId = null }) {
    if (existingCategory && existingCategory.id !== currentCategoryId) {
      return ValidationResult.failure({
        code: "DUPLICATE_CATEGORY_NAME",
        message: `Category with name "${name}" already exists`,
        name,
        conflictingCategoryId: existingCategory.id,
      });
    }

    return ValidationResult.success();
  }
}

// ============================================================================
// VALIDATION SERVICE
// ============================================================================

/**
 * Validation Service
 * Centralized validation and guardrail enforcement
 */
export class ValidationService {
  /**
   * Validate product before save
   * @param {Object} product - Product to validate
   * @param {Object} context - Validation context
   * @returns {ValidationResult} Validation result
   */
  static validateProduct(product, context = {}) {
    // Validate product state
    const stateValidation = ProductValidationRules.validateProductState(product, context);
    if (!stateValidation.valid) {
      return stateValidation;
    }

    // Validate variant configuration if applicable
    const variantValidation = ProductValidationRules.validateVariantConfiguration(product);
    if (!variantValidation.valid) {
      return variantValidation;
    }

    return ValidationResult.success();
  }

  /**
   * Validate inventory tracking disable
   * @param {number} currentStock - Current stock level
   * @param {boolean} isTrackingEnabled - Whether tracking is enabled
   * @returns {ValidationResult} Validation result
   */
  static validateInventoryTrackingDisable(currentStock, isTrackingEnabled) {
    return InventoryValidationRules.validateInventoryTrackingDisable(currentStock, isTrackingEnabled);
  }

  /**
   * Validate category deletion
   * @param {Object} params - Validation parameters
   * @returns {ValidationResult} Validation result
   */
  static validateCategoryDeletion(params) {
    return CategoryValidationRules.validateCategoryDeletion(params);
  }

  /**
   * Validate category assignment
   * @param {Object} params - Validation parameters
   * @returns {ValidationResult} Validation result
   */
  static validateCategoryAssignment(params) {
    return CategoryValidationRules.validateCategoryAssignment(params);
  }
}

export default ValidationService;
