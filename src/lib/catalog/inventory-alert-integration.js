/**
 * Inventory-Alert Integration
 * 
 * Integrates reorder alerts with inventory operations.
 * Automatically checks alerts when inventory changes.
 */

import { ReorderAlertService, ALERT_STATES } from "./reorder-alerts";

/**
 * Inventory-Alert Integration Hook
 * Wraps inventory operations to automatically check alerts
 */
export class InventoryAlertIntegration {
  /**
   * Constructor
   * @param {InventoryService} inventoryService - Inventory service instance
   * @param {ReorderAlertService} alertService - Reorder alert service instance
   */
  constructor(inventoryService, alertService) {
    this.inventoryService = inventoryService;
    this.alertService = alertService;
  }

  /**
   * Decrement stock and check alerts
   * @param {Object} params - Decrement parameters
   * @returns {Promise<Object>} Result with inventory and alert status
   */
  async decrementStockAndCheckAlerts(params) {
    // Decrement stock
    const inventoryResult = await this.inventoryService.decrementStock(params);

    if (!inventoryResult.success) {
      return inventoryResult;
    }

    // Check alert status after decrement
    const alertResult = await this.alertService.checkAlertStatus(
      params.productId,
      params.variantId
    );

    return {
      success: true,
      inventory: inventoryResult.data,
      alert: alertResult,
    };
  }

  /**
   * Increase stock and check alerts
   * @param {Object} params - Increase parameters
   * @returns {Promise<Object>} Result with inventory and alert status
   */
  async increaseStockAndCheckAlerts(params) {
    // Increase stock
    const inventoryResult = await this.inventoryService.increaseStock(params);

    if (!inventoryResult.success) {
      return inventoryResult;
    }

    // Check alert status after increase
    const alertResult = await this.alertService.checkAlertStatus(
      params.productId,
      params.variantId
    );

    return {
      success: true,
      inventory: inventoryResult.data,
      alert: alertResult,
    };
  }

  /**
   * Get product status including alert state
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID
   * @returns {Promise<Object>} Product status with alert information
   */
  async getProductStatus(productId, variantId = null) {
    // Get inventory record
    const currentStock = await this.inventoryService.getCurrentStock(productId, variantId);

    // Get alert status
    const alertResult = await this.alertService.checkAlertStatus(productId, variantId);

    // Determine product status
    let productStatus = "in_stock";
    if (currentStock === 0) {
      productStatus = "out_of_stock";
    } else if (alertResult.alertState === ALERT_STATES.LOW_STOCK) {
      productStatus = "low_stock";
    }

    return {
      productId,
      variantId,
      currentStock,
      productStatus,
      alert: alertResult,
      shouldHighlight: alertResult.shouldHighlight(),
      displayMessage: alertResult.getDisplayMessage(),
    };
  }
}

export default InventoryAlertIntegration;
