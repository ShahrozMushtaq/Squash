/**
 * Inventory Rules - Hard Constraints and Invariants
 * 
 * These rules are NON-NEGOTIABLE and must be enforced at all times.
 * Violations result in explicit operation failures.
 */

// ============================================================================
// INVENTORY INVARIANTS (Hard Constraints)
// ============================================================================

/**
 * Inventory Invariants - Rules that CANNOT be violated
 */
export const INVENTORY_INVARIANTS = {
  /**
   * INVARIANT 1: Stock can never go below zero
   * Violation: Operation fails with INSUFFICIENT_STOCK error
   */
  STOCK_NON_NEGATIVE: {
    name: "STOCK_NON_NEGATIVE",
    description: "Stock quantity must always be >= 0",
    validate: (currentStock, delta) => {
      const newStock = currentStock + delta;
      if (newStock < 0) {
        return {
          valid: false,
          error: {
            code: "INSUFFICIENT_STOCK",
            message: `Stock cannot go below zero. Current: ${currentStock}, Requested change: ${delta}`,
            currentStock,
            requestedChange: delta,
            wouldResultIn: newStock,
          },
        };
      }
      return { valid: true };
    },
  },

  /**
   * INVARIANT 2: Stock decrements only on successful checkout
   * Violation: Decrement operations outside checkout context are blocked
   */
  DECREMENT_ONLY_ON_CHECKOUT: {
    name: "DECREMENT_ONLY_ON_CHECKOUT",
    description: "Stock can only be decremented through successful checkout transactions",
    validate: (operation, context) => {
      if (operation === "DECREMENT" && context !== "CHECKOUT_SUCCESS") {
        return {
          valid: false,
          error: {
            code: "INVALID_DECREMENT_CONTEXT",
            message: "Stock decrements are only allowed through successful checkout transactions. Use ADJUSTMENT operations for manual corrections.",
            operation,
            context,
          },
        };
      }
      return { valid: true };
    },
  },

  /**
   * INVARIANT 3: Manual adjustments require a reason
   * Violation: Operation fails with MISSING_REASON error
   */
  MANUAL_ADJUSTMENT_REQUIRES_REASON: {
    name: "MANUAL_ADJUSTMENT_REQUIRES_REASON",
    description: "All manual inventory adjustments must include a reason",
    validate: (operation, reason) => {
      const manualOperations = ["ADJUSTMENT", "WRITE_OFF", "CORRECTION"];
      if (manualOperations.includes(operation)) {
        if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
          return {
            valid: false,
            error: {
              code: "MISSING_REASON",
              message: `Manual operation '${operation}' requires a non-empty reason`,
              operation,
            },
          };
        }
      }
      return { valid: true };
    },
  },

  /**
   * INVARIANT 4: Initial stock must be non-negative
   * Violation: Operation fails with INVALID_INITIAL_STOCK error
   */
  INITIAL_STOCK_NON_NEGATIVE: {
    name: "INITIAL_STOCK_NON_NEGATIVE",
    description: "Initial stock must be >= 0",
    validate: (initialStock) => {
      if (initialStock < 0) {
        return {
          valid: false,
          error: {
            code: "INVALID_INITIAL_STOCK",
            message: `Initial stock must be >= 0. Provided: ${initialStock}`,
            provided: initialStock,
          },
        };
      }
      return { valid: true };
    },
  },
};

// ============================================================================
// INVENTORY OPERATION TYPES
// ============================================================================

/**
 * Supported Inventory Operations
 */
export const INVENTORY_OPERATIONS = {
  /**
   * SET_INITIAL_STOCK
   * Sets the initial stock level for a new product/variant
   * Context: Product creation, variant creation
   */
  SET_INITIAL_STOCK: "SET_INITIAL_STOCK",

  /**
   * INCREASE_STOCK
   * Increases stock (restocking, receiving inventory)
   * Context: Manual restock, receiving shipment
   */
  INCREASE_STOCK: "INCREASE_STOCK",

  /**
   * DECREMENT_STOCK
   * Decreases stock (only allowed through checkout)
   * Context: Successful checkout transaction
   */
  DECREMENT_STOCK: "DECREMENT_STOCK",

  /**
   * ADJUSTMENT
   * Manual adjustment (increase or decrease)
   * Context: Manual correction, audit adjustment
   */
  ADJUSTMENT: "ADJUSTMENT",

  /**
   * WRITE_OFF
   * Write off damaged or lost items (decrease stock)
   * Context: Damage, loss, theft, expiration
   */
  WRITE_OFF: "WRITE_OFF",

  /**
   * CORRECTION
   * Correct audit discrepancies (increase or decrease)
   * Context: Physical inventory count correction
   */
  CORRECTION: "CORRECTION",
};

// ============================================================================
// OPERATION CONTEXTS
// ============================================================================

/**
 * Operation Contexts - Where the operation originates
 */
export const OPERATION_CONTEXTS = {
  CHECKOUT_SUCCESS: "CHECKOUT_SUCCESS",      // Successful checkout transaction
  MANUAL_RESTOCK: "MANUAL_RESTOCK",          // Admin manually restocking
  PRODUCT_CREATION: "PRODUCT_CREATION",      // Creating new product
  VARIANT_CREATION: "VARIANT_CREATION",      // Creating new variant
  MANUAL_ADJUSTMENT: "MANUAL_ADJUSTMENT",    // Admin manual adjustment
  AUDIT_CORRECTION: "AUDIT_CORRECTION",      // Physical inventory audit
  DAMAGE_WRITE_OFF: "DAMAGE_WRITE_OFF",      // Writing off damaged items
  LOSS_WRITE_OFF: "LOSS_WRITE_OFF",          // Writing off lost items
  THEFT_WRITE_OFF: "THEFT_WRITE_OFF",        // Writing off stolen items
  EXPIRATION_WRITE_OFF: "EXPIRATION_WRITE_OFF", // Writing off expired items
};

// ============================================================================
// INVENTORY OPERATION RESULT
// ============================================================================

/**
 * Result of an inventory operation
 */
export class InventoryOperationResult {
  constructor(success, data = null, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success(data) {
    return new InventoryOperationResult(true, data, null);
  }

  static failure(error) {
    return new InventoryOperationResult(false, null, error);
  }
}

// ============================================================================
// INVENTORY OPERATION REQUEST
// ============================================================================

/**
 * Request structure for inventory operations
 */
export class InventoryOperationRequest {
  constructor({
    productId,
    variantId = null,
    operation,
    quantity,
    reason = null,
    context,
    performedBy,
    metadata = {},
  }) {
    this.productId = productId;
    this.variantId = variantId;
    this.operation = operation;
    this.quantity = quantity;
    this.reason = reason;
    this.context = context;
    this.performedBy = performedBy;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Validate the request structure
   */
  validate() {
    const errors = [];

    if (!this.productId) {
      errors.push({ field: "productId", message: "Product ID is required" });
    }

    if (!this.operation || !Object.values(INVENTORY_OPERATIONS).includes(this.operation)) {
      errors.push({
        field: "operation",
        message: `Invalid operation. Must be one of: ${Object.values(INVENTORY_OPERATIONS).join(", ")}`,
      });
    }

    if (typeof this.quantity !== "number" || isNaN(this.quantity)) {
      errors.push({ field: "quantity", message: "Quantity must be a valid number" });
    }

    if (this.quantity <= 0 && this.operation !== "SET_INITIAL_STOCK") {
      errors.push({ field: "quantity", message: "Quantity must be > 0 for this operation" });
    }

    if (!this.context || !Object.values(OPERATION_CONTEXTS).includes(this.context)) {
      errors.push({
        field: "context",
        message: `Invalid context. Must be one of: ${Object.values(OPERATION_CONTEXTS).join(", ")}`,
      });
    }

    if (!this.performedBy) {
      errors.push({ field: "performedBy", message: "Performed by (user ID) is required" });
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
      };
    }

    return { valid: true };
  }
}

// ============================================================================
// INVENTORY RULES ENGINE
// ============================================================================

/**
 * Inventory Rules Engine
 * Validates and enforces inventory invariants
 */
export class InventoryRulesEngine {
  /**
   * Validate an inventory operation against all invariants
   * @param {InventoryOperationRequest} request - The operation request
   * @param {number} currentStock - Current stock level
   * @returns {Object} Validation result
   */
  static validateOperation(request, currentStock) {
    // Validate request structure
    const structureValidation = request.validate();
    if (!structureValidation.valid) {
      return InventoryOperationResult.failure({
        code: "INVALID_REQUEST",
        message: "Request validation failed",
        errors: structureValidation.errors,
      });
    }

    const { operation, quantity, context, reason } = request;

    // Calculate stock delta based on operation
    let delta = 0;
    switch (operation) {
      case INVENTORY_OPERATIONS.SET_INITIAL_STOCK:
        // SET_INITIAL_STOCK sets stock to quantity (not a delta)
        // Validate initial stock is non-negative
        const initialStockValidation = INVENTORY_INVARIANTS.INITIAL_STOCK_NON_NEGATIVE.validate(quantity);
        if (!initialStockValidation.valid) {
          return InventoryOperationResult.failure(initialStockValidation.error);
        }
        return InventoryOperationResult.success({ newStock: quantity });

      case INVENTORY_OPERATIONS.INCREASE_STOCK:
        delta = quantity; // Positive delta
        break;

      case INVENTORY_OPERATIONS.DECREMENT_STOCK:
        delta = -quantity; // Negative delta
        // Validate decrement context
        const decrementValidation = INVENTORY_INVARIANTS.DECREMENT_ONLY_ON_CHECKOUT.validate(
          operation,
          context
        );
        if (!decrementValidation.valid) {
          return InventoryOperationResult.failure(decrementValidation.error);
        }
        break;

      case INVENTORY_OPERATIONS.ADJUSTMENT:
        // Adjustment can be positive or negative
        // Quantity sign indicates direction
        delta = quantity;
        // Validate reason
        const adjustmentReasonValidation = INVENTORY_INVARIANTS.MANUAL_ADJUSTMENT_REQUIRES_REASON.validate(
          operation,
          reason
        );
        if (!adjustmentReasonValidation.valid) {
          return InventoryOperationResult.failure(adjustmentReasonValidation.error);
        }
        break;

      case INVENTORY_OPERATIONS.WRITE_OFF:
        delta = -quantity; // Always decreases stock
        // Validate reason
        const writeOffReasonValidation = INVENTORY_INVARIANTS.MANUAL_ADJUSTMENT_REQUIRES_REASON.validate(
          operation,
          reason
        );
        if (!writeOffReasonValidation.valid) {
          return InventoryOperationResult.failure(writeOffReasonValidation.error);
        }
        break;

      case INVENTORY_OPERATIONS.CORRECTION:
        // Correction can be positive or negative
        // Quantity sign indicates direction
        delta = quantity;
        // Validate reason
        const correctionReasonValidation = INVENTORY_INVARIANTS.MANUAL_ADJUSTMENT_REQUIRES_REASON.validate(
          operation,
          reason
        );
        if (!correctionReasonValidation.valid) {
          return InventoryOperationResult.failure(correctionReasonValidation.error);
        }
        break;

      default:
        return InventoryOperationResult.failure({
          code: "UNKNOWN_OPERATION",
          message: `Unknown operation: ${operation}`,
        });
    }

    // Validate stock non-negative invariant
    const stockValidation = INVENTORY_INVARIANTS.STOCK_NON_NEGATIVE.validate(currentStock, delta);
    if (!stockValidation.valid) {
      return InventoryOperationResult.failure(stockValidation.error);
    }

    // All validations passed
    const newStock = currentStock + delta;
    return InventoryOperationResult.success({
      newStock,
      delta,
      previousStock: currentStock,
    });
  }

  /**
   * Check if an operation is allowed
   * @param {string} operation - Operation type
   * @param {string} context - Operation context
   * @returns {boolean} True if allowed
   */
  static isOperationAllowed(operation, context) {
    // Decrement is only allowed in checkout context
    if (operation === INVENTORY_OPERATIONS.DECREMENT_STOCK) {
      return context === OPERATION_CONTEXTS.CHECKOUT_SUCCESS;
    }

    // All other operations are allowed in any context
    return true;
  }
}

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * Inventory Error Codes
 */
export const INVENTORY_ERROR_CODES = {
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  INVALID_DECREMENT_CONTEXT: "INVALID_DECREMENT_CONTEXT",
  MISSING_REASON: "MISSING_REASON",
  INVALID_INITIAL_STOCK: "INVALID_INITIAL_STOCK",
  INVALID_REQUEST: "INVALID_REQUEST",
  UNKNOWN_OPERATION: "UNKNOWN_OPERATION",
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  INVENTORY_INVARIANTS,
  INVENTORY_OPERATIONS,
  OPERATION_CONTEXTS,
  InventoryOperationResult,
  InventoryOperationRequest,
  InventoryRulesEngine,
  INVENTORY_ERROR_CODES,
};
