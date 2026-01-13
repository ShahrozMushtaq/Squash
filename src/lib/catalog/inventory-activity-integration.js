/**
 * Inventory-Activity Integration
 * 
 * Automatically logs all inventory operations to activity log.
 * Ensures all inventory mutations generate activity entries.
 */

import { ActivityLogService, ACTIVITY_ENTITY_TYPES, ACTIVITY_ACTIONS } from "./activity-log";

/**
 * Inventory-Activity Integration
 * Wraps inventory operations to automatically log activities
 */
export class InventoryActivityIntegration {
  /**
   * Constructor
   * @param {InventoryService} inventoryService - Inventory service instance
   * @param {ActivityLogService} activityService - Activity log service instance
   */
  constructor(inventoryService, activityService) {
    this.inventoryService = inventoryService;
    this.activityService = activityService;
  }

  /**
   * Set initial stock and log activity
   * @param {Object} params - Operation parameters
   * @returns {Promise<Object>} Result with inventory and activity log entry
   */
  async setInitialStock(params) {
    const result = await this.inventoryService.setInitialStock(params);

    if (result.success) {
      // Log activity
      await this.activityService.logActivity({
        entityType: ACTIVITY_ENTITY_TYPES.INVENTORY,
        entityId: params.variantId ? `${params.productId}_${params.variantId}` : params.productId,
        action: ACTIVITY_ACTIONS.INVENTORY_SET_INITIAL,
        performedBy: params.performedBy,
        changes: {
          currentStock: { old: 0, new: result.data.newStock },
        },
        newState: {
          currentStock: result.data.newStock,
          stockState: result.data.inventoryRecord.stockState,
        },
        metadata: {
          operation: "SET_INITIAL_STOCK",
          productId: params.productId,
          variantId: params.variantId,
          ...params.metadata,
        },
      });
    }

    return result;
  }

  /**
   * Increase stock and log activity
   * @param {Object} params - Operation parameters
   * @returns {Promise<Object>} Result with inventory and activity log entry
   */
  async increaseStock(params) {
    const result = await this.inventoryService.increaseStock(params);

    if (result.success) {
      // Log activity
      await this.activityService.logActivity({
        entityType: ACTIVITY_ENTITY_TYPES.INVENTORY,
        entityId: params.variantId ? `${params.productId}_${params.variantId}` : params.productId,
        action: ACTIVITY_ACTIONS.INVENTORY_INCREASED,
        performedBy: params.performedBy,
        changes: {
          currentStock: {
            old: result.data.previousStock,
            new: result.data.newStock,
          },
        },
        previousState: {
          currentStock: result.data.previousStock,
        },
        newState: {
          currentStock: result.data.newStock,
          stockState: result.data.inventoryRecord.stockState,
        },
        metadata: {
          operation: "INCREASE_STOCK",
          productId: params.productId,
          variantId: params.variantId,
          quantity: params.quantity,
          reason: params.reason,
          ...params.metadata,
        },
      });
    }

    return result;
  }

  /**
   * Decrement stock and log activity
   * @param {Object} params - Operation parameters
   * @returns {Promise<Object>} Result with inventory and activity log entry
   */
  async decrementStock(params) {
    const result = await this.inventoryService.decrementStock(params);

    if (result.success) {
      // Log activity
      await this.activityService.logActivity({
        entityType: ACTIVITY_ENTITY_TYPES.INVENTORY,
        entityId: params.variantId ? `${params.productId}_${params.variantId}` : params.productId,
        action: ACTIVITY_ACTIONS.INVENTORY_DECREMENTED,
        performedBy: params.performedBy,
        changes: {
          currentStock: {
            old: result.data.previousStock,
            new: result.data.newStock,
          },
        },
        previousState: {
          currentStock: result.data.previousStock,
        },
        newState: {
          currentStock: result.data.newStock,
          stockState: result.data.inventoryRecord.stockState,
        },
        metadata: {
          operation: "DECREMENT_STOCK",
          productId: params.productId,
          variantId: params.variantId,
          quantity: params.quantity,
          transactionId: params.transactionId,
          ...params.metadata,
        },
      });
    }

    return result;
  }

  /**
   * Write off stock and log activity
   * @param {Object} params - Operation parameters
   * @returns {Promise<Object>} Result with inventory and activity log entry
   */
  async writeOff(params) {
    const result = await this.inventoryService.writeOff(params);

    if (result.success) {
      // Log activity
      await this.activityService.logActivity({
        entityType: ACTIVITY_ENTITY_TYPES.INVENTORY,
        entityId: params.variantId ? `${params.productId}_${params.variantId}` : params.productId,
        action: ACTIVITY_ACTIONS.INVENTORY_WRITE_OFF,
        performedBy: params.performedBy,
        changes: {
          currentStock: {
            old: result.data.previousStock,
            new: result.data.newStock,
          },
        },
        previousState: {
          currentStock: result.data.previousStock,
        },
        newState: {
          currentStock: result.data.newStock,
          stockState: result.data.inventoryRecord.stockState,
        },
        metadata: {
          operation: "WRITE_OFF",
          productId: params.productId,
          variantId: params.variantId,
          quantity: params.quantity,
          reason: params.reason,
          writeOffType: params.writeOffType,
          ...params.metadata,
        },
      });
    }

    return result;
  }

  /**
   * Correct audit discrepancy and log activity
   * @param {Object} params - Operation parameters
   * @returns {Promise<Object>} Result with inventory and activity log entry
   */
  async correctAuditDiscrepancy(params) {
    const result = await this.inventoryService.correctAuditDiscrepancy(params);

    if (result.success) {
      // Log activity
      await this.activityService.logActivity({
        entityType: ACTIVITY_ENTITY_TYPES.INVENTORY,
        entityId: params.variantId ? `${params.productId}_${params.variantId}` : params.productId,
        action: ACTIVITY_ACTIONS.INVENTORY_CORRECTED,
        performedBy: params.performedBy,
        changes: {
          currentStock: {
            old: result.data.previousStock,
            new: result.data.newStock,
          },
        },
        previousState: {
          currentStock: result.data.previousStock,
        },
        newState: {
          currentStock: result.data.newStock,
          stockState: result.data.inventoryRecord.stockState,
        },
        metadata: {
          operation: "CORRECTION",
          productId: params.productId,
          variantId: params.variantId,
          actualQuantity: params.actualQuantity,
          recordedQuantity: result.data.previousStock,
          discrepancy: result.data.discrepancy,
          reason: params.reason,
          ...params.metadata,
        },
      });
    }

    return result;
  }

  /**
   * Adjust stock and log activity
   * @param {Object} params - Operation parameters
   * @returns {Promise<Object>} Result with inventory and activity log entry
   */
  async adjustStock(params) {
    const result = await this.inventoryService.adjustStock(params);

    if (result.success) {
      // Log activity
      await this.activityService.logActivity({
        entityType: ACTIVITY_ENTITY_TYPES.INVENTORY,
        entityId: params.variantId ? `${params.productId}_${params.variantId}` : params.productId,
        action: ACTIVITY_ACTIONS.INVENTORY_ADJUSTED,
        performedBy: params.performedBy,
        changes: {
          currentStock: {
            old: result.data.previousStock,
            new: result.data.newStock,
          },
        },
        previousState: {
          currentStock: result.data.previousStock,
        },
        newState: {
          currentStock: result.data.newStock,
          stockState: result.data.inventoryRecord.stockState,
        },
        metadata: {
          operation: "ADJUSTMENT",
          productId: params.productId,
          variantId: params.variantId,
          quantity: params.quantity,
          reason: params.reason,
          ...params.metadata,
        },
      });
    }

    return result;
  }
}

export default InventoryActivityIntegration;
