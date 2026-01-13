/**
 * Activity Log - Append-Only Audit Trail
 * 
 * Tracks all changes to catalog entities.
 * Read-only and append-only - entries cannot be edited or deleted.
 */

// ============================================================================
// ACTIVITY ENTITY TYPES
// ============================================================================

/**
 * Entity Types that can have activity logs
 */
export const ACTIVITY_ENTITY_TYPES = {
  PRODUCT: "product",
  VARIANT: "variant",
  INVENTORY: "inventory",
  PROMOTION: "promotion",
  CATEGORY: "category",
  VISIBILITY_PROMOTION: "visibility_promotion",
};

// ============================================================================
// ACTIVITY ACTION TYPES
// ============================================================================

/**
 * Activity Action Types
 */
export const ACTIVITY_ACTIONS = {
  // Product actions
  PRODUCT_CREATED: "product_created",
  PRODUCT_UPDATED: "product_updated",
  PRODUCT_DELETED: "product_deleted",
  PRODUCT_STATUS_CHANGED: "product_status_changed",

  // Variant actions
  VARIANT_CREATED: "variant_created",
  VARIANT_UPDATED: "variant_updated",
  VARIANT_DELETED: "variant_deleted",

  // Inventory actions
  INVENTORY_SET_INITIAL: "inventory_set_initial",
  INVENTORY_INCREASED: "inventory_increased",
  INVENTORY_DECREMENTED: "inventory_decremented",
  INVENTORY_ADJUSTED: "inventory_adjusted",
  INVENTORY_WRITE_OFF: "inventory_write_off",
  INVENTORY_CORRECTED: "inventory_corrected",

  // Transaction actions
  TRANSACTION_CREATED: "transaction_created",
  TRANSACTION_COMPLETED: "transaction_completed",
  TRANSACTION_FAILED: "transaction_failed",

  // Promotion actions
  PROMOTION_CREATED: "promotion_created",
  PROMOTION_UPDATED: "promotion_updated",
  PROMOTION_DELETED: "promotion_deleted",
  PROMOTION_ACTIVATED: "promotion_activated",
  PROMOTION_DEACTIVATED: "promotion_deactivated",
  PROMOTION_EXPIRED: "promotion_expired",

  // Visibility promotion actions
  VISIBILITY_PROMOTED: "visibility_promoted",
  VISIBILITY_UNPROMOTED: "visibility_unpromoted",
  VISIBILITY_PRIORITY_CHANGED: "visibility_priority_changed",
  VISIBILITY_LABEL_CHANGED: "visibility_label_changed",

  // Category actions
  CATEGORY_CREATED: "category_created",
  CATEGORY_RENAMED: "category_renamed",
  CATEGORY_REORDERED: "category_reordered",
  CATEGORY_HIDDEN: "category_hidden",
  CATEGORY_UNHIDDEN: "category_unhidden",
  CATEGORY_DELETED: "category_deleted",
};

// ============================================================================
// ACTIVITY LOG ENTRY
// ============================================================================

/**
 * Activity Log Entry
 * Represents a single activity log entry (immutable)
 */
export class ActivityLogEntry {
  constructor({
    id,
    entityType,
    entityId,
    action,
    performedBy,
    changes = null,
    previousState = null,
    newState = null,
    metadata = {},
    timestamp = null,
  }) {
    this.id = id;
    this.entityType = entityType;
    this.entityId = entityId;
    this.action = action;
    this.performedBy = performedBy;
    this.changes = changes;
    this.previousState = previousState;
    this.newState = newState;
    this.metadata = metadata;
    this.timestamp = timestamp || new Date().toISOString();
  }

  /**
   * Validate activity log entry
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push({ field: "id", message: "Activity log entry ID is required" });
    }

    if (!Object.values(ACTIVITY_ENTITY_TYPES).includes(this.entityType)) {
      errors.push({
        field: "entityType",
        message: `Entity type must be one of: ${Object.values(ACTIVITY_ENTITY_TYPES).join(", ")}`,
      });
    }

    if (!this.entityId) {
      errors.push({ field: "entityId", message: "Entity ID is required" });
    }

    if (!Object.values(ACTIVITY_ACTIONS).includes(this.action)) {
      errors.push({
        field: "action",
        message: `Action must be one of: ${Object.values(ACTIVITY_ACTIONS).join(", ")}`,
      });
    }

    if (!this.performedBy) {
      errors.push({ field: "performedBy", message: "Performed by (user ID) is required" });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Check if entry is immutable (all entries are immutable)
   * @returns {boolean} Always true
   */
  isImmutable() {
    return true;
  }
}

// ============================================================================
// ACTIVITY LOG SERVICE
// ============================================================================

/**
 * Activity Log Service
 * Manages append-only activity log entries
 */
export class ActivityLogService {
  /**
   * Constructor
   * @param {Object} activityStore - Storage adapter for activity logs
   */
  constructor(activityStore) {
    this.store = activityStore;
  }

  /**
   * Create activity log entry (append-only)
   * @param {Object} params - Activity parameters
   * @param {string} params.entityType - Entity type
   * @param {string} params.entityId - Entity ID
   * @param {string} params.action - Action type
   * @param {string} params.performedBy - User ID who performed the action
   * @param {Object|null} params.changes - Changes made (field: {old, new})
   * @param {Object|null} params.previousState - Previous state snapshot
   * @param {Object|null} params.newState - New state snapshot
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<ActivityLogEntry>} Created activity log entry
   */
  async logActivity({
    entityType,
    entityId,
    action,
    performedBy,
    changes = null,
    previousState = null,
    newState = null,
    metadata = {},
  }) {
    // Generate unique ID
    const id = this.generateId();

    // Create entry
    const entry = new ActivityLogEntry({
      id,
      entityType,
      entityId,
      action,
      performedBy,
      changes,
      previousState,
      newState,
      metadata,
    });

    // Validate
    const validation = entry.validate();
    if (!validation.valid) {
      throw new Error(`Invalid activity log entry: ${validation.errors.map(e => e.message).join(", ")}`);
    }

    // Save (append-only operation)
    return await this.store.appendActivityEntry(entry);
  }

  /**
   * Get activity log entries for an entity
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @param {Object} options - Query options
   * @param {number|null} options.limit - Limit number of results
   * @param {number|null} options.offset - Offset for pagination
   * @param {boolean} options.sortDescending - Sort by timestamp descending (newest first)
   * @returns {Promise<ActivityLogEntry[]>} Array of activity log entries
   */
  async getActivityForEntity(entityType, entityId, { limit = null, offset = 0, sortDescending = true } = {}) {
    return await this.store.getActivityByEntity(entityType, entityId, {
      limit,
      offset,
      sortDescending,
    });
  }

  /**
   * Get activity log entries by action type
   * @param {string} action - Action type
   * @param {Object} options - Query options
   * @param {number|null} options.limit - Limit number of results
   * @param {number|null} options.offset - Offset for pagination
   * @returns {Promise<ActivityLogEntry[]>} Array of activity log entries
   */
  async getActivityByAction(action, { limit = null, offset = 0 } = {}) {
    return await this.store.getActivityByAction(action, { limit, offset });
  }

  /**
   * Get activity log entries by performer
   * @param {string} performedBy - User ID
   * @param {Object} options - Query options
   * @param {number|null} options.limit - Limit number of results
   * @param {number|null} options.offset - Offset for pagination
   * @returns {Promise<ActivityLogEntry[]>} Array of activity log entries
   */
  async getActivityByPerformer(performedBy, { limit = null, offset = 0 } = {}) {
    return await this.store.getActivityByPerformer(performedBy, { limit, offset });
  }

  /**
   * Get all activity log entries
   * @param {Object} options - Query options
   * @param {number|null} options.limit - Limit number of results
   * @param {number|null} options.offset - Offset for pagination
   * @param {boolean} options.sortDescending - Sort by timestamp descending
   * @returns {Promise<ActivityLogEntry[]>} Array of activity log entries
   */
  async getAllActivity({ limit = null, offset = 0, sortDescending = true } = {}) {
    return await this.store.getAllActivity({ limit, offset, sortDescending });
  }

  /**
   * Get activity log entries within date range
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @param {Object} options - Query options
   * @returns {Promise<ActivityLogEntry[]>} Array of activity log entries
   */
  async getActivityByDateRange(startDate, endDate, options = {}) {
    return await this.store.getActivityByDateRange(startDate, endDate, options);
  }

  /**
   * Get inventory-related activity for a product/variant
   * @param {string} productId - Product ID
   * @param {string|null} variantId - Variant ID
   * @param {Object} options - Query options
   * @returns {Promise<ActivityLogEntry[]>} Array of inventory activity entries
   */
  async getInventoryActivity(productId, variantId = null, options = {}) {
    const entityType = ACTIVITY_ENTITY_TYPES.INVENTORY;
    const entityId = variantId ? `${productId}_${variantId}` : productId;

    return await this.getActivityForEntity(entityType, entityId, options);
  }

  /**
   * Get transaction-related activity
   * @param {string} transactionId - Transaction ID
   * @param {Object} options - Query options
   * @returns {Promise<ActivityLogEntry[]>} Array of transaction activity entries
   */
  async getTransactionActivity(transactionId, options = {}) {
    return await this.store.getActivityByMetadata({ transactionId }, options);
  }

  /**
   * Generate unique ID for activity log entry
   * @returns {string} Unique ID
   */
  generateId() {
    return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // READ-ONLY ENFORCEMENT
  // ============================================================================

  /**
   * Attempting to update an activity log entry will fail
   * Activity logs are immutable
   */
  async updateActivityEntry() {
    throw new Error("Activity log entries are immutable and cannot be updated");
  }

  /**
   * Attempting to delete an activity log entry will fail
   * Activity logs are append-only
   */
  async deleteActivityEntry() {
    throw new Error("Activity log entries are append-only and cannot be deleted");
  }
}

export default ActivityLogService;
