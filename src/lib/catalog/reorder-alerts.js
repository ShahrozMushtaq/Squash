/**
 * Reorder Alerts - Signal System
 * 
 * Monitors inventory levels and generates alerts when thresholds are crossed.
 * This is a READ-ONLY signal system - it does NOT modify stock or trigger orders.
 */

// ============================================================================
// ALERT STATES
// ============================================================================

/**
 * Reorder Alert States
 */
export const ALERT_STATES = {
  /**
   * NORMAL - Stock is above threshold
   */
  NORMAL: "NORMAL",

  /**
   * LOW_STOCK - Stock is at or below threshold (alert triggered)
   */
  LOW_STOCK: "LOW_STOCK",

  /**
   * OUT_OF_STOCK - Stock is zero
   */
  OUT_OF_STOCK: "OUT_OF_STOCK",

  /**
   * ALERT_DISABLED - Alert is disabled for this product/variant
   */
  ALERT_DISABLED: "ALERT_DISABLED",
};

// ============================================================================
// ALERT CONFIGURATION
// ============================================================================

/**
 * Reorder Alert Configuration
 * Defines threshold and alert settings for a product/variant
 */
export class ReorderAlertConfig {
  constructor({
    productId,
    variantId = null,
    reorderPoint = null,
    lowStockThreshold = null,
    isEnabled = true,
    alertEmail = null,
    alertRecipients = [],
    metadata = {},
  }) {
    this.productId = productId;
    this.variantId = variantId;
    this.reorderPoint = reorderPoint; // Stock level at which alert triggers
    this.lowStockThreshold = lowStockThreshold; // Stock level for "low stock" status (defaults to reorderPoint if not set)
    this.isEnabled = isEnabled;
    this.alertEmail = alertEmail;
    this.alertRecipients = alertRecipients; // Array of user IDs or emails
    this.metadata = metadata;
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = [];

    if (!this.productId) {
      errors.push({ field: "productId", message: "Product ID is required" });
    }

    if (this.reorderPoint !== null && this.reorderPoint < 0) {
      errors.push({
        field: "reorderPoint",
        message: "Reorder point must be >= 0",
      });
    }

    if (this.lowStockThreshold !== null && this.lowStockThreshold < 0) {
      errors.push({
        field: "lowStockThreshold",
        message: "Low stock threshold must be >= 0",
      });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Get effective low stock threshold
   * Uses lowStockThreshold if set, otherwise falls back to reorderPoint
   */
  getEffectiveLowStockThreshold() {
    return this.lowStockThreshold !== null
      ? this.lowStockThreshold
      : this.reorderPoint !== null
        ? this.reorderPoint
        : null;
  }
}

// ============================================================================
// ALERT RESULT
// ============================================================================

/**
 * Reorder Alert Result
 * Contains alert state and metadata
 */
export class ReorderAlertResult {
  constructor({
    productId,
    variantId = null,
    currentStock,
    reorderPoint,
    lowStockThreshold,
    alertState,
    isAlertTriggered,
    isEnabled,
    message = null,
    metadata = {},
  }) {
    this.productId = productId;
    this.variantId = variantId;
    this.currentStock = currentStock;
    this.reorderPoint = reorderPoint;
    this.lowStockThreshold = lowStockThreshold;
    this.alertState = alertState;
    this.isAlertTriggered = isAlertTriggered;
    this.isEnabled = isEnabled;
    this.message = message;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if product should be highlighted in UI
   */
  shouldHighlight() {
    return this.isAlertTriggered && this.isEnabled;
  }

  /**
   * Get display message for UI
   */
  getDisplayMessage() {
    if (!this.isEnabled) {
      return null;
    }

    switch (this.alertState) {
      case ALERT_STATES.LOW_STOCK:
        return `Low stock: ${this.currentStock} remaining (threshold: ${this.lowStockThreshold})`;
      case ALERT_STATES.OUT_OF_STOCK:
        return "Out of stock";
      case ALERT_STATES.NORMAL:
        return null;
      default:
        return null;
    }
  }
}

// ============================================================================
// REORDER ALERT SERVICE
// ============================================================================

/**
 * Reorder Alert Service
 * Monitors inventory and generates alerts
 */
export class ReorderAlertService {
  /**
   * Constructor
   * @param {Object} alertConfigStore - Storage adapter for alert configurations
   * @param {Object} inventoryStore - Storage adapter for inventory records
   */
  constructor(alertConfigStore, inventoryStore) {
    this.alertConfigStore = alertConfigStore;
    this.inventoryStore = inventoryStore;
  }

  /**
   * Check alert status for a product/variant
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID (null if product has no variants)
   * @returns {Promise<ReorderAlertResult>} Alert result
   */
  async checkAlertStatus(productId, variantId = null) {
    // Get alert configuration
    const alertConfig = await this.alertConfigStore.getAlertConfig(productId, variantId);

    // If no configuration exists, return default (no alert)
    if (!alertConfig) {
      const inventoryRecord = await this.inventoryStore.getInventoryRecord(productId, variantId);
      return new ReorderAlertResult({
        productId,
        variantId,
        currentStock: inventoryRecord?.currentStock || 0,
        reorderPoint: null,
        lowStockThreshold: null,
        alertState: ALERT_STATES.ALERT_DISABLED,
        isAlertTriggered: false,
        isEnabled: false,
        message: "Alert not configured",
      });
    }

    // If alert is disabled, return disabled state
    if (!alertConfig.isEnabled) {
      const inventoryRecord = await this.inventoryStore.getInventoryRecord(productId, variantId);
      return new ReorderAlertResult({
        productId,
        variantId,
        currentStock: inventoryRecord?.currentStock || 0,
        reorderPoint: alertConfig.reorderPoint,
        lowStockThreshold: alertConfig.getEffectiveLowStockThreshold(),
        alertState: ALERT_STATES.ALERT_DISABLED,
        isAlertTriggered: false,
        isEnabled: false,
        message: "Alert disabled",
      });
    }

    // Get current inventory
    const inventoryRecord = await this.inventoryStore.getInventoryRecord(productId, variantId);
    if (!inventoryRecord) {
      return new ReorderAlertResult({
        productId,
        variantId,
        currentStock: 0,
        reorderPoint: alertConfig.reorderPoint,
        lowStockThreshold: alertConfig.getEffectiveLowStockThreshold(),
        alertState: ALERT_STATES.OUT_OF_STOCK,
        isAlertTriggered: true,
        isEnabled: true,
        message: "Inventory record not found",
      });
    }

    const currentStock = inventoryRecord.currentStock;
    const lowStockThreshold = alertConfig.getEffectiveLowStockThreshold();

    // Determine alert state
    let alertState;
    let isAlertTriggered = false;
    let message = null;

    if (currentStock === 0) {
      alertState = ALERT_STATES.OUT_OF_STOCK;
      isAlertTriggered = true;
      message = "Out of stock";
    } else if (lowStockThreshold !== null && currentStock <= lowStockThreshold) {
      alertState = ALERT_STATES.LOW_STOCK;
      isAlertTriggered = true;
      message = `Low stock: ${currentStock} remaining (threshold: ${lowStockThreshold})`;
    } else {
      alertState = ALERT_STATES.NORMAL;
      isAlertTriggered = false;
      message = null;
    }

    return new ReorderAlertResult({
      productId,
      variantId,
      currentStock,
      reorderPoint: alertConfig.reorderPoint,
      lowStockThreshold,
      alertState,
      isAlertTriggered,
      isEnabled: true,
      message,
      metadata: {
        alertEmail: alertConfig.alertEmail,
        alertRecipients: alertConfig.alertRecipients,
        ...alertConfig.metadata,
      },
    });
  }

  /**
   * Check alerts for all products/variants
   * @param {Object} options - Query options
   * @param {boolean} options.onlyTriggered - Only return triggered alerts
   * @param {boolean} options.onlyEnabled - Only return enabled alerts
   * @returns {Promise<ReorderAlertResult[]>} Array of alert results
   */
  async checkAllAlerts({ onlyTriggered = false, onlyEnabled = true } = {}) {
    const alertConfigs = await this.alertConfigStore.getAllAlertConfigs({
      onlyEnabled,
    });

    const results = [];

    for (const config of alertConfigs) {
      const result = await this.checkAlertStatus(config.productId, config.variantId);

      if (onlyTriggered && !result.isAlertTriggered) {
        continue;
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Get all triggered alerts (for UI display)
   * @returns {Promise<ReorderAlertResult[]>} Array of triggered alerts
   */
  async getTriggeredAlerts() {
    return this.checkAllAlerts({ onlyTriggered: true, onlyEnabled: true });
  }

  /**
   * Configure alert for a product/variant
   * @param {ReorderAlertConfig} config - Alert configuration
   * @returns {Promise<ReorderAlertConfig>} Saved configuration
   */
  async configureAlert(config) {
    const validation = config.validate();
    if (!validation.valid) {
      throw new Error(`Invalid alert configuration: ${validation.errors.map(e => e.message).join(", ")}`);
    }

    return await this.alertConfigStore.saveAlertConfig(config);
  }

  /**
   * Enable alert for a product/variant
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID
   * @returns {Promise<ReorderAlertConfig>} Updated configuration
   */
  async enableAlert(productId, variantId = null) {
    const config = await this.alertConfigStore.getAlertConfig(productId, variantId);
    if (!config) {
      throw new Error("Alert configuration not found. Create configuration first.");
    }

    config.isEnabled = true;
    return await this.alertConfigStore.saveAlertConfig(config);
  }

  /**
   * Disable alert for a product/variant
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID
   * @returns {Promise<ReorderAlertConfig>} Updated configuration
   */
  async disableAlert(productId, variantId = null) {
    const config = await this.alertConfigStore.getAlertConfig(productId, variantId);
    if (!config) {
      throw new Error("Alert configuration not found. Create configuration first.");
    }

    config.isEnabled = false;
    return await this.alertConfigStore.saveAlertConfig(config);
  }

  /**
   * Update reorder point for a product/variant
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID
   * @param {number} reorderPoint - New reorder point
   * @returns {Promise<ReorderAlertConfig>} Updated configuration
   */
  async updateReorderPoint(productId, variantId = null, reorderPoint) {
    if (reorderPoint < 0) {
      throw new Error("Reorder point must be >= 0");
    }

    const config = await this.alertConfigStore.getAlertConfig(productId, variantId);
    if (!config) {
      // Create new configuration if it doesn't exist
      const newConfig = new ReorderAlertConfig({
        productId,
        variantId,
        reorderPoint,
        isEnabled: true,
      });
      return await this.alertConfigStore.saveAlertConfig(newConfig);
    }

    config.reorderPoint = reorderPoint;
    return await this.alertConfigStore.saveAlertConfig(config);
  }

  /**
   * Update low stock threshold for a product/variant
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID
   * @param {number} lowStockThreshold - New low stock threshold
   * @returns {Promise<ReorderAlertConfig>} Updated configuration
   */
  async updateLowStockThreshold(productId, variantId = null, lowStockThreshold) {
    if (lowStockThreshold < 0) {
      throw new Error("Low stock threshold must be >= 0");
    }

    const config = await this.alertConfigStore.getAlertConfig(productId, variantId);
    if (!config) {
      // Create new configuration if it doesn't exist
      const newConfig = new ReorderAlertConfig({
        productId,
        variantId,
        lowStockThreshold,
        isEnabled: true,
      });
      return await this.alertConfigStore.saveAlertConfig(newConfig);
    }

    config.lowStockThreshold = lowStockThreshold;
    return await this.alertConfigStore.saveAlertConfig(config);
  }

  /**
   * Delete alert configuration
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID
   * @returns {Promise<void>}
   */
  async deleteAlertConfig(productId, variantId = null) {
    await this.alertConfigStore.deleteAlertConfig(productId, variantId);
  }
}

export default ReorderAlertService;
