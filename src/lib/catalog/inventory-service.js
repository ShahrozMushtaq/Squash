/**
 * Inventory Service
 * 
 * Provides inventory operations with hard constraint enforcement.
 * This service is UI-independent and enforces all inventory rules.
 */

import {
  INVENTORY_OPERATIONS,
  OPERATION_CONTEXTS,
  InventoryOperationRequest,
  InventoryRulesEngine,
  InventoryOperationResult,
} from "./inventory-rules";

// ============================================================================
// INVENTORY SERVICE
// ============================================================================

/**
 * Inventory Service
 * Handles all inventory operations with rule enforcement
 */
export class InventoryService {
  /**
   * Constructor
   * @param {Object} inventoryStore - Storage adapter for inventory records
   */
  constructor(inventoryStore) {
    this.store = inventoryStore;
  }

  /**
   * Get current stock for a product/variant
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID (null if product has no variants)
   * @returns {Promise<number>} Current stock level
   */
  async getCurrentStock(productId, variantId = null) {
    const inventoryRecord = await this.store.getInventoryRecord(productId, variantId);
    return inventoryRecord ? inventoryRecord.currentStock : 0;
  }

  /**
   * Set initial stock for a new product/variant
   * @param {Object} params - Operation parameters
   * @param {string} params.productId - Product ID
   * @param {string|null} params.variantId - Variant ID (null if product has no variants)
   * @param {number} params.quantity - Initial stock quantity
   * @param {string} params.performedBy - User ID performing the operation
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<InventoryOperationResult>} Operation result
   */
  async setInitialStock({ productId, variantId = null, quantity, performedBy, metadata = {} }) {
    const request = new InventoryOperationRequest({
      productId,
      variantId,
      operation: INVENTORY_OPERATIONS.SET_INITIAL_STOCK,
      quantity,
      context: variantId ? OPERATION_CONTEXTS.VARIANT_CREATION : OPERATION_CONTEXTS.PRODUCT_CREATION,
      performedBy,
      metadata,
    });

    // Validate operation
    const validation = InventoryRulesEngine.validateOperation(request, 0);
    if (!validation.success) {
      return validation;
    }

    // Create inventory record
    const inventoryRecord = {
      id: this.generateId(),
      productId,
      variantId,
      currentStock: validation.data.newStock,
      stockState: this.computeStockState(validation.data.newStock),
      reorderPoint: metadata.reorderPoint || null,
      lowStockThreshold: metadata.lowStockThreshold || 3,
      lastUpdated: new Date().toISOString(),
      lastRestocked: new Date().toISOString(),
      reservedStock: 0,
    };

    await this.store.createInventoryRecord(inventoryRecord);

    // Log activity
    await this.logActivity({
      entityType: "inventory",
      entityId: inventoryRecord.id,
      action: "created",
      performedBy,
      changes: {
        initialStock: validation.data.newStock,
      },
      metadata: {
        operation: INVENTORY_OPERATIONS.SET_INITIAL_STOCK,
        ...metadata,
      },
    });

    return InventoryOperationResult.success({
      inventoryRecord,
      newStock: validation.data.newStock,
    });
  }

  /**
   * Increase stock (restocking)
   * @param {Object} params - Operation parameters
   * @param {string} params.productId - Product ID
   * @param {string|null} params.variantId - Variant ID
   * @param {number} params.quantity - Quantity to add
   * @param {string} params.reason - Reason for increase (required)
   * @param {string} params.performedBy - User ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<InventoryOperationResult>} Operation result
   */
  async increaseStock({ productId, variantId = null, quantity, reason, performedBy, metadata = {} }) {
    const currentStock = await this.getCurrentStock(productId, variantId);

    const request = new InventoryOperationRequest({
      productId,
      variantId,
      operation: INVENTORY_OPERATIONS.INCREASE_STOCK,
      quantity,
      reason,
      context: OPERATION_CONTEXTS.MANUAL_RESTOCK,
      performedBy,
      metadata,
    });

    // Validate operation
    const validation = InventoryRulesEngine.validateOperation(request, currentStock);
    if (!validation.success) {
      return validation;
    }

    // Update inventory record
    const inventoryRecord = await this.store.getInventoryRecord(productId, variantId);
    if (!inventoryRecord) {
      return InventoryOperationResult.failure({
        code: "INVENTORY_RECORD_NOT_FOUND",
        message: "Inventory record not found. Use setInitialStock to create one.",
      });
    }

    inventoryRecord.currentStock = validation.data.newStock;
    inventoryRecord.stockState = this.computeStockState(validation.data.newStock);
    inventoryRecord.lastUpdated = new Date().toISOString();
    inventoryRecord.lastRestocked = new Date().toISOString();

    await this.store.updateInventoryRecord(inventoryRecord);

    // Log activity
    await this.logActivity({
      entityType: "inventory",
      entityId: inventoryRecord.id,
      action: "stock_adjusted",
      performedBy,
      changes: {
        currentStock: {
          old: validation.data.previousStock,
          new: validation.data.newStock,
        },
      },
      metadata: {
        operation: INVENTORY_OPERATIONS.INCREASE_STOCK,
        reason,
        quantity,
        ...metadata,
      },
    });

    return InventoryOperationResult.success({
      inventoryRecord,
      previousStock: validation.data.previousStock,
      newStock: validation.data.newStock,
      delta: validation.data.delta,
    });
  }

  /**
   * Decrement stock (only through successful checkout)
   * @param {Object} params - Operation parameters
   * @param {string} params.productId - Product ID
   * @param {string|null} params.variantId - Variant ID
   * @param {number} params.quantity - Quantity to remove
   * @param {string} params.transactionId - Checkout transaction ID
   * @param {string} params.performedBy - System/user ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<InventoryOperationResult>} Operation result
   */
  async decrementStock({ productId, variantId = null, quantity, transactionId, performedBy, metadata = {} }) {
    const currentStock = await this.getCurrentStock(productId, variantId);

    const request = new InventoryOperationRequest({
      productId,
      variantId,
      operation: INVENTORY_OPERATIONS.DECREMENT_STOCK,
      quantity,
      context: OPERATION_CONTEXTS.CHECKOUT_SUCCESS,
      performedBy,
      metadata: {
        transactionId,
        ...metadata,
      },
    });

    // Validate operation
    const validation = InventoryRulesEngine.validateOperation(request, currentStock);
    if (!validation.success) {
      return validation;
    }

    // Update inventory record
    const inventoryRecord = await this.store.getInventoryRecord(productId, variantId);
    if (!inventoryRecord) {
      return InventoryOperationResult.failure({
        code: "INVENTORY_RECORD_NOT_FOUND",
        message: "Inventory record not found",
      });
    }

    inventoryRecord.currentStock = validation.data.newStock;
    inventoryRecord.stockState = this.computeStockState(validation.data.newStock);
    inventoryRecord.lastUpdated = new Date().toISOString();

    await this.store.updateInventoryRecord(inventoryRecord);

    // Log activity
    await this.logActivity({
      entityType: "inventory",
      entityId: inventoryRecord.id,
      action: "stock_adjusted",
      performedBy,
      changes: {
        currentStock: {
          old: validation.data.previousStock,
          new: validation.data.newStock,
        },
      },
      metadata: {
        operation: INVENTORY_OPERATIONS.DECREMENT_STOCK,
        transactionId,
        quantity,
        ...metadata,
      },
    });

    return InventoryOperationResult.success({
      inventoryRecord,
      previousStock: validation.data.previousStock,
      newStock: validation.data.newStock,
      delta: validation.data.delta,
    });
  }

  /**
   * Write off damaged or lost items
   * @param {Object} params - Operation parameters
   * @param {string} params.productId - Product ID
   * @param {string|null} params.variantId - Variant ID
   * @param {number} params.quantity - Quantity to write off
   * @param {string} params.reason - Reason for write-off (required)
   * @param {string} params.writeOffType - Type: "damage" | "loss" | "theft" | "expiration"
   * @param {string} params.performedBy - User ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<InventoryOperationResult>} Operation result
   */
  async writeOff({ productId, variantId = null, quantity, reason, writeOffType, performedBy, metadata = {} }) {
    const currentStock = await this.getCurrentStock(productId, variantId);

    const contextMap = {
      damage: OPERATION_CONTEXTS.DAMAGE_WRITE_OFF,
      loss: OPERATION_CONTEXTS.LOSS_WRITE_OFF,
      theft: OPERATION_CONTEXTS.THEFT_WRITE_OFF,
      expiration: OPERATION_CONTEXTS.EXPIRATION_WRITE_OFF,
    };

    const request = new InventoryOperationRequest({
      productId,
      variantId,
      operation: INVENTORY_OPERATIONS.WRITE_OFF,
      quantity,
      reason,
      context: contextMap[writeOffType] || OPERATION_CONTEXTS.DAMAGE_WRITE_OFF,
      performedBy,
      metadata: {
        writeOffType,
        ...metadata,
      },
    });

    // Validate operation
    const validation = InventoryRulesEngine.validateOperation(request, currentStock);
    if (!validation.success) {
      return validation;
    }

    // Update inventory record
    const inventoryRecord = await this.store.getInventoryRecord(productId, variantId);
    if (!inventoryRecord) {
      return InventoryOperationResult.failure({
        code: "INVENTORY_RECORD_NOT_FOUND",
        message: "Inventory record not found",
      });
    }

    inventoryRecord.currentStock = validation.data.newStock;
    inventoryRecord.stockState = this.computeStockState(validation.data.newStock);
    inventoryRecord.lastUpdated = new Date().toISOString();

    await this.store.updateInventoryRecord(inventoryRecord);

    // Log activity
    await this.logActivity({
      entityType: "inventory",
      entityId: inventoryRecord.id,
      action: "stock_adjusted",
      performedBy,
      changes: {
        currentStock: {
          old: validation.data.previousStock,
          new: validation.data.newStock,
        },
      },
      metadata: {
        operation: INVENTORY_OPERATIONS.WRITE_OFF,
        writeOffType,
        reason,
        quantity,
        ...metadata,
      },
    });

    return InventoryOperationResult.success({
      inventoryRecord,
      previousStock: validation.data.previousStock,
      newStock: validation.data.newStock,
      delta: validation.data.delta,
    });
  }

  /**
   * Correct audit discrepancies
   * @param {Object} params - Operation parameters
   * @param {string} params.productId - Product ID
   * @param {string|null} params.variantId - Variant ID
   * @param {number} params.actualQuantity - Actual physical count
   * @param {string} params.reason - Reason for correction (required)
   * @param {string} params.performedBy - User ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<InventoryOperationResult>} Operation result
   */
  async correctAuditDiscrepancy({ productId, variantId = null, actualQuantity, reason, performedBy, metadata = {} }) {
    const currentStock = await this.getCurrentStock(productId, variantId);
    const discrepancy = actualQuantity - currentStock;

    // If no discrepancy, return success with no changes
    if (discrepancy === 0) {
      return InventoryOperationResult.success({
        inventoryRecord: await this.store.getInventoryRecord(productId, variantId),
        previousStock: currentStock,
        newStock: currentQuantity,
        delta: 0,
        message: "No discrepancy found",
      });
    }

    const request = new InventoryOperationRequest({
      productId,
      variantId,
      operation: INVENTORY_OPERATIONS.CORRECTION,
      quantity: discrepancy, // Can be positive or negative
      reason,
      context: OPERATION_CONTEXTS.AUDIT_CORRECTION,
      performedBy,
      metadata: {
        actualQuantity,
        recordedQuantity: currentStock,
        discrepancy,
        ...metadata,
      },
    });

    // Validate operation
    const validation = InventoryRulesEngine.validateOperation(request, currentStock);
    if (!validation.success) {
      return validation;
    }

    // Update inventory record
    const inventoryRecord = await this.store.getInventoryRecord(productId, variantId);
    if (!inventoryRecord) {
      return InventoryOperationResult.failure({
        code: "INVENTORY_RECORD_NOT_FOUND",
        message: "Inventory record not found",
      });
    }

    inventoryRecord.currentStock = validation.data.newStock;
    inventoryRecord.stockState = this.computeStockState(validation.data.newStock);
    inventoryRecord.lastUpdated = new Date().toISOString();

    await this.store.updateInventoryRecord(inventoryRecord);

    // Log activity
    await this.logActivity({
      entityType: "inventory",
      entityId: inventoryRecord.id,
      action: "stock_adjusted",
      performedBy,
      changes: {
        currentStock: {
          old: validation.data.previousStock,
          new: validation.data.newStock,
        },
      },
      metadata: {
        operation: INVENTORY_OPERATIONS.CORRECTION,
        reason,
        actualQuantity,
        recordedQuantity: currentStock,
        discrepancy,
        ...metadata,
      },
    });

    return InventoryOperationResult.success({
      inventoryRecord,
      previousStock: validation.data.previousStock,
      newStock: validation.data.newStock,
      delta: validation.data.delta,
      discrepancy,
    });
  }

  /**
   * Manual adjustment (increase or decrease)
   * @param {Object} params - Operation parameters
   * @param {string} params.productId - Product ID
   * @param {string|null} params.variantId - Variant ID
   * @param {number} params.quantity - Quantity change (positive = increase, negative = decrease)
   * @param {string} params.reason - Reason for adjustment (required)
   * @param {string} params.performedBy - User ID
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<InventoryOperationResult>} Operation result
   */
  async adjustStock({ productId, variantId = null, quantity, reason, performedBy, metadata = {} }) {
    const currentStock = await this.getCurrentStock(productId, variantId);

    const request = new InventoryOperationRequest({
      productId,
      variantId,
      operation: INVENTORY_OPERATIONS.ADJUSTMENT,
      quantity, // Can be positive or negative
      reason,
      context: OPERATION_CONTEXTS.MANUAL_ADJUSTMENT,
      performedBy,
      metadata,
    });

    // Validate operation
    const validation = InventoryRulesEngine.validateOperation(request, currentStock);
    if (!validation.success) {
      return validation;
    }

    // Update inventory record
    const inventoryRecord = await this.store.getInventoryRecord(productId, variantId);
    if (!inventoryRecord) {
      return InventoryOperationResult.failure({
        code: "INVENTORY_RECORD_NOT_FOUND",
        message: "Inventory record not found",
      });
    }

    inventoryRecord.currentStock = validation.data.newStock;
    inventoryRecord.stockState = this.computeStockState(validation.data.newStock);
    inventoryRecord.lastUpdated = new Date().toISOString();

    await this.store.updateInventoryRecord(inventoryRecord);

    // Log activity
    await this.logActivity({
      entityType: "inventory",
      entityId: inventoryRecord.id,
      action: "stock_adjusted",
      performedBy,
      changes: {
        currentStock: {
          old: validation.data.previousStock,
          new: validation.data.newStock,
        },
      },
      metadata: {
        operation: INVENTORY_OPERATIONS.ADJUSTMENT,
        reason,
        quantity,
        ...metadata,
      },
    });

    return InventoryOperationResult.success({
      inventoryRecord,
      previousStock: validation.data.previousStock,
      newStock: validation.data.newStock,
      delta: validation.data.delta,
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Compute stock state from current stock
   * @param {number} currentStock - Current stock level
   * @param {number} lowStockThreshold - Low stock threshold (default: 3)
   * @returns {string} Stock state
   */
  computeStockState(currentStock, lowStockThreshold = 3) {
    if (currentStock === 0) {
      return "out_of_stock";
    }
    if (currentStock <= lowStockThreshold) {
      return "low_stock";
    }
    return "in_stock";
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log activity (to be implemented by storage adapter)
   * @param {Object} activity - Activity data
   */
  async logActivity(activity) {
    // This should be implemented by the storage adapter
    // For now, it's a placeholder
    if (this.store.logActivity) {
      await this.store.logActivity(activity);
    }
  }
}

export default InventoryService;
