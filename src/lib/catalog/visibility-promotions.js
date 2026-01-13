/**
 * Visibility Promotions - Product Promotion System
 * 
 * Promotes products for visibility purposes only.
 * Does NOT affect price or inventory.
 * Used by downstream systems (e.g., Banners) to select promoted products.
 */

// ============================================================================
// PROMOTION STATES
// ============================================================================

/**
 * Promotion States
 */
export const PROMOTION_STATES = {
  /**
   * PROMOTED - Product is currently promoted
   */
  PROMOTED: "PROMOTED",

  /**
   * NOT_PROMOTED - Product is not promoted
   */
  NOT_PROMOTED: "NOT_PROMOTED",
};

// ============================================================================
// PROMOTION CONFIGURATION
// ============================================================================

/**
 * Visibility Promotion Configuration
 * Defines promotion settings for a product
 */
export class VisibilityPromotionConfig {
  constructor({
    productId,
    isPromoted = false,
    priority = 0,
    promoLabel = null,
    startDate = null,
    endDate = null,
    metadata = {},
  }) {
    this.productId = productId;
    this.isPromoted = isPromoted;
    this.priority = priority; // Higher number = higher priority
    this.promoLabel = promoLabel; // e.g., "New", "Staff Pick", "Featured"
    this.startDate = startDate; // Optional: Promotion start date
    this.endDate = endDate; // Optional: Promotion end date
    this.metadata = metadata;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = [];

    if (!this.productId) {
      errors.push({ field: "productId", message: "Product ID is required" });
    }

    if (typeof this.priority !== "number" || isNaN(this.priority)) {
      errors.push({ field: "priority", message: "Priority must be a valid number" });
    }

    if (this.promoLabel !== null && (typeof this.promoLabel !== "string" || this.promoLabel.trim().length === 0)) {
      errors.push({
        field: "promoLabel",
        message: "Promo label must be a non-empty string or null",
      });
    }

    if (this.startDate !== null && this.endDate !== null) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        errors.push({
          field: "dates",
          message: "Start date and end date must be valid dates",
        });
      } else if (start >= end) {
        errors.push({
          field: "dates",
          message: "End date must be after start date",
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Check if promotion is currently active
   * @returns {boolean} True if promotion is active
   */
  isCurrentlyActive() {
    if (!this.isPromoted) {
      return false;
    }

    const now = new Date();

    // If no dates set, promotion is active if isPromoted is true
    if (this.startDate === null && this.endDate === null) {
      return true;
    }

    // Check start date
    if (this.startDate !== null) {
      const start = new Date(this.startDate);
      if (now < start) {
        return false; // Not started yet
      }
    }

    // Check end date
    if (this.endDate !== null) {
      const end = new Date(this.endDate);
      if (now > end) {
        return false; // Already ended
      }
    }

    return true;
  }
}

// ============================================================================
// PROMOTION RESULT
// ============================================================================

/**
 * Promotion Status Result
 * Contains promotion status and metadata
 */
export class PromotionStatusResult {
  constructor({
    productId,
    isPromoted,
    isActive,
    priority,
    promoLabel,
    startDate,
    endDate,
    metadata = {},
  }) {
    this.productId = productId;
    this.isPromoted = isPromoted;
    this.isActive = isActive;
    this.priority = priority;
    this.promoLabel = promoLabel;
    this.startDate = startDate;
    this.endDate = endDate;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Check if product should be visible in promoted listings
   * @returns {boolean} True if product should be shown as promoted
   */
  shouldShowAsPromoted() {
    return this.isPromoted && this.isActive;
  }

  /**
   * Get display label for UI
   * @returns {string|null} Promo label or null
   */
  getDisplayLabel() {
    return this.shouldShowAsPromoted() ? this.promoLabel : null;
  }
}

// ============================================================================
// VISIBILITY PROMOTION SERVICE
// ============================================================================

/**
 * Visibility Promotion Service
 * Manages product promotions for visibility purposes
 */
export class VisibilityPromotionService {
  /**
   * Constructor
   * @param {Object} promotionStore - Storage adapter for promotion configurations
   */
  constructor(promotionStore) {
    this.store = promotionStore;
  }

  /**
   * Promote a product
   * @param {Object} params - Promotion parameters
   * @param {string} params.productId - Product ID
   * @param {number} params.priority - Promotion priority (higher = more prominent)
   * @param {string|null} params.promoLabel - Optional promo label
   * @param {string|null} params.startDate - Optional start date (ISO string)
   * @param {string|null} params.endDate - Optional end date (ISO string)
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<VisibilityPromotionConfig>} Promotion configuration
   */
  async promoteProduct({
    productId,
    priority = 0,
    promoLabel = null,
    startDate = null,
    endDate = null,
    metadata = {},
  }) {
    // Get existing configuration or create new
    let config = await this.store.getPromotionConfig(productId);

    if (config) {
      // Update existing
      config.isPromoted = true;
      config.priority = priority;
      config.promoLabel = promoLabel;
      config.startDate = startDate;
      config.endDate = endDate;
      config.metadata = { ...config.metadata, ...metadata };
      config.updatedAt = new Date().toISOString();
    } else {
      // Create new
      config = new VisibilityPromotionConfig({
        productId,
        isPromoted: true,
        priority,
        promoLabel,
        startDate,
        endDate,
        metadata,
      });
    }

    // Validate
    const validation = config.validate();
    if (!validation.valid) {
      throw new Error(`Invalid promotion configuration: ${validation.errors.map(e => e.message).join(", ")}`);
    }

    // Save
    return await this.store.savePromotionConfig(config);
  }

  /**
   * Unpromote a product
   * @param {string} productId - Product ID
   * @returns {Promise<VisibilityPromotionConfig>} Updated configuration
   */
  async unpromoteProduct(productId) {
    const config = await this.store.getPromotionConfig(productId);

    if (!config) {
      // Create disabled config if it doesn't exist
      config = new VisibilityPromotionConfig({
        productId,
        isPromoted: false,
        priority: 0,
      });
    } else {
      config.isPromoted = false;
      config.updatedAt = new Date().toISOString();
    }

    return await this.store.savePromotionConfig(config);
  }

  /**
   * Set promotion priority
   * @param {string} productId - Product ID
   * @param {number} priority - New priority (higher = more prominent)
   * @returns {Promise<VisibilityPromotionConfig>} Updated configuration
   */
  async setPromotionPriority(productId, priority) {
    if (typeof priority !== "number" || isNaN(priority)) {
      throw new Error("Priority must be a valid number");
    }

    let config = await this.store.getPromotionConfig(productId);

    if (!config) {
      // Create new config with promotion disabled
      config = new VisibilityPromotionConfig({
        productId,
        isPromoted: false,
        priority,
      });
    } else {
      config.priority = priority;
      config.updatedAt = new Date().toISOString();
    }

    return await this.store.savePromotionConfig(config);
  }

  /**
   * Set promotion label
   * @param {string} productId - Product ID
   * @param {string|null} promoLabel - Promo label (e.g., "New", "Staff Pick")
   * @returns {Promise<VisibilityPromotionConfig>} Updated configuration
   */
  async setPromotionLabel(productId, promoLabel) {
    if (promoLabel !== null && (typeof promoLabel !== "string" || promoLabel.trim().length === 0)) {
      throw new Error("Promo label must be a non-empty string or null");
    }

    let config = await this.store.getPromotionConfig(productId);

    if (!config) {
      // Create new config with promotion disabled
      config = new VisibilityPromotionConfig({
        productId,
        isPromoted: false,
        promoLabel,
      });
    } else {
      config.promoLabel = promoLabel;
      config.updatedAt = new Date().toISOString();
    }

    return await this.store.savePromotionConfig(config);
  }

  /**
   * Get promotion status for a product
   * @param {string} productId - Product ID
   * @returns {Promise<PromotionStatusResult>} Promotion status
   */
  async getPromotionStatus(productId) {
    const config = await this.store.getPromotionConfig(productId);

    if (!config) {
      return new PromotionStatusResult({
        productId,
        isPromoted: false,
        isActive: false,
        priority: 0,
        promoLabel: null,
        startDate: null,
        endDate: null,
      });
    }

    const isActive = config.isCurrentlyActive();

    return new PromotionStatusResult({
      productId,
      isPromoted: config.isPromoted,
      isActive,
      priority: config.priority,
      promoLabel: config.promoLabel,
      startDate: config.startDate,
      endDate: config.endDate,
      metadata: config.metadata,
    });
  }

  /**
   * Get all promoted products
   * @param {Object} options - Query options
   * @param {boolean} options.onlyActive - Only return currently active promotions
   * @param {boolean} options.sortByPriority - Sort by priority (descending)
   * @param {number|null} options.limit - Limit number of results
   * @returns {Promise<PromotionStatusResult[]>} Array of promotion statuses
   */
  async getPromotedProducts({ onlyActive = true, sortByPriority = true, limit = null } = {}) {
    const configs = await this.store.getAllPromotionConfigs();

    const results = configs
      .map((config) => {
        const isActive = config.isCurrentlyActive();
        return new PromotionStatusResult({
          productId: config.productId,
          isPromoted: config.isPromoted,
          isActive,
          priority: config.priority,
          promoLabel: config.promoLabel,
          startDate: config.startDate,
          endDate: config.endDate,
          metadata: config.metadata,
        });
      })
      .filter((result) => {
        if (onlyActive) {
          return result.shouldShowAsPromoted();
        }
        return result.isPromoted;
      })
      .sort((a, b) => {
        if (sortByPriority) {
          // Sort by priority descending (higher priority first)
          return b.priority - a.priority;
        }
        return 0;
      });

    if (limit !== null && limit > 0) {
      return results.slice(0, limit);
    }

    return results;
  }

  /**
   * Get promoted products for downstream systems (e.g., Banners)
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of products to return
   * @param {number|null} options.minPriority - Minimum priority threshold
   * @returns {Promise<string[]>} Array of product IDs
   */
  async getPromotedProductIds({ limit = 10, minPriority = null } = {}) {
    const promoted = await this.getPromotedProducts({
      onlyActive: true,
      sortByPriority: true,
      limit: null, // Get all, then filter
    });

    let filtered = promoted;

    // Filter by minimum priority if specified
    if (minPriority !== null) {
      filtered = filtered.filter((p) => p.priority >= minPriority);
    }

    // Extract product IDs
    const productIds = filtered.map((p) => p.productId);

    // Apply limit
    if (limit > 0) {
      return productIds.slice(0, limit);
    }

    return productIds;
  }

  /**
   * Delete promotion configuration
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  async deletePromotionConfig(productId) {
    await this.store.deletePromotionConfig(productId);
  }
}

export default VisibilityPromotionService;
