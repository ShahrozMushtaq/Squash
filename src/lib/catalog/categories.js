/**
 * Categories - Category Management System
 * 
 * Manages product categories with visibility and ordering.
 * Enforces single-category assignment per product.
 */

// ============================================================================
// CATEGORY VISIBILITY STATES
// ============================================================================

/**
 * Category Visibility States
 */
export const CATEGORY_VISIBILITY = {
  /**
   * ACTIVE - Category is visible and products are accessible
   */
  ACTIVE: "ACTIVE",

  /**
   * HIDDEN - Category is hidden and all products within are hidden
   */
  HIDDEN: "HIDDEN",
};

// ============================================================================
// CATEGORY MODEL
// ============================================================================

/**
 * Category Model
 * Represents a product category
 */
export class Category {
  constructor({
    id,
    name,
    visibility = CATEGORY_VISIBILITY.ACTIVE,
    displayOrder = 0,
    description = null,
    slug = null,
    imageUrl = null,
    metadata = {},
  }) {
    this.id = id;
    this.name = name;
    this.visibility = visibility;
    this.displayOrder = displayOrder;
    this.description = description;
    this.slug = slug;
    this.imageUrl = imageUrl;
    this.metadata = metadata;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Validate category
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push({ field: "id", message: "Category ID is required" });
    }

    if (!this.name || typeof this.name !== "string" || this.name.trim().length === 0) {
      errors.push({
        field: "name",
        message: "Category name is required and must be a non-empty string",
      });
    }

    if (this.name && this.name.length > 100) {
      errors.push({
        field: "name",
        message: "Category name must be 100 characters or less",
      });
    }

    if (!Object.values(CATEGORY_VISIBILITY).includes(this.visibility)) {
      errors.push({
        field: "visibility",
        message: `Visibility must be one of: ${Object.values(CATEGORY_VISIBILITY).join(", ")}`,
      });
    }

    if (typeof this.displayOrder !== "number" || isNaN(this.displayOrder)) {
      errors.push({
        field: "displayOrder",
        message: "Display order must be a valid number",
      });
    }

    if (this.description !== null && typeof this.description !== "string") {
      errors.push({
        field: "description",
        message: "Description must be a string or null",
      });
    }

    if (this.description && this.description.length > 1000) {
      errors.push({
        field: "description",
        message: "Description must be 1000 characters or less",
      });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Check if category is visible
   * @returns {boolean} True if category is active
   */
  isVisible() {
    return this.visibility === CATEGORY_VISIBILITY.ACTIVE;
  }

  /**
   * Check if category is hidden
   * @returns {boolean} True if category is hidden
   */
  isHidden() {
    return this.visibility === CATEGORY_VISIBILITY.HIDDEN;
  }
}

// ============================================================================
// CATEGORY SERVICE
// ============================================================================

/**
 * Category Service
 * Manages categories and enforces constraints
 */
export class CategoryService {
  /**
   * Constructor
   * @param {Object} categoryStore - Storage adapter for categories
   * @param {Object} productStore - Storage adapter for products (for constraint checks)
   */
  constructor(categoryStore, productStore) {
    this.categoryStore = categoryStore;
    this.productStore = productStore;
  }

  /**
   * Create a new category
   * @param {Object} params - Category parameters
   * @param {string} params.id - Category ID
   * @param {string} params.name - Category name
   * @param {string} params.visibility - Visibility state (default: ACTIVE)
   * @param {number} params.displayOrder - Display order (default: 0)
   * @param {string|null} params.description - Optional description
   * @param {string|null} params.slug - Optional URL-friendly slug
   * @param {string|null} params.imageUrl - Optional image URL
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Category>} Created category
   */
  async createCategory({
    id,
    name,
    visibility = CATEGORY_VISIBILITY.ACTIVE,
    displayOrder = 0,
    description = null,
    slug = null,
    imageUrl = null,
    metadata = {},
  }) {
    // Check if category with same name already exists
    const existingByName = await this.categoryStore.getCategoryByName(name);
    
    // Validate name uniqueness using validation rules
    const { ValidationService } = await import("./validation-rules");
    const nameValidation = ValidationService.validateCategoryNameUniqueness({
      name,
      existingCategory: existingByName,
      currentCategoryId: null,
    });

    if (!nameValidation.valid) {
      const error = new Error(nameValidation.error.message);
      error.code = nameValidation.error.code;
      error.details = nameValidation.error;
      throw error;
    }

    // Check if category with same ID already exists
    const existingById = await this.categoryStore.getCategory(id);
    if (existingById) {
      throw new Error(`Category with ID "${id}" already exists`);
    }

    // Create category
    const category = new Category({
      id,
      name: name.trim(),
      visibility,
      displayOrder,
      description,
      slug,
      imageUrl,
      metadata,
    });

    // Validate
    const validation = category.validate();
    if (!validation.valid) {
      throw new Error(`Invalid category: ${validation.errors.map(e => e.message).join(", ")}`);
    }

    // Save
    return await this.categoryStore.saveCategory(category);
  }

  /**
   * Rename a category
   * @param {string} categoryId - Category ID
   * @param {string} newName - New category name
   * @returns {Promise<Category>} Updated category
   */
  async renameCategory(categoryId, newName) {
    if (!newName || typeof newName !== "string" || newName.trim().length === 0) {
      throw new Error("Category name is required and must be a non-empty string");
    }

    const category = await this.categoryStore.getCategory(categoryId);
    if (!category) {
      throw new Error(`Category with ID "${categoryId}" not found`);
    }

    // Check if another category with same name exists
    const existingByName = await this.categoryStore.getCategoryByName(newName.trim());
    
    // Validate name uniqueness using validation rules
    const { ValidationService } = await import("./validation-rules");
    const nameValidation = ValidationService.validateCategoryNameUniqueness({
      name: newName.trim(),
      existingCategory: existingByName,
      currentCategoryId: categoryId,
    });

    if (!nameValidation.valid) {
      const error = new Error(nameValidation.error.message);
      error.code = nameValidation.error.code;
      error.details = nameValidation.error;
      throw error;
    }

    // Update name
    category.name = newName.trim();
    category.updatedAt = new Date().toISOString();

    // Validate
    const validation = category.validate();
    if (!validation.valid) {
      throw new Error(`Invalid category: ${validation.errors.map(e => e.message).join(", ")}`);
    }

    // Save
    return await this.categoryStore.saveCategory(category);
  }

  /**
   * Reorder categories
   * @param {Array<Object>} reorderData - Array of { categoryId, displayOrder }
   * @returns {Promise<Category[]>} Updated categories
   */
  async reorderCategories(reorderData) {
    if (!Array.isArray(reorderData) || reorderData.length === 0) {
      throw new Error("Reorder data must be a non-empty array");
    }

    const updatedCategories = [];

    for (const item of reorderData) {
      if (!item.categoryId || typeof item.displayOrder !== "number") {
        throw new Error("Each reorder item must have categoryId and displayOrder");
      }

      const category = await this.categoryStore.getCategory(item.categoryId);
      if (!category) {
        throw new Error(`Category with ID "${item.categoryId}" not found`);
      }

      category.displayOrder = item.displayOrder;
      category.updatedAt = new Date().toISOString();

      updatedCategories.push(category);
    }

    // Save all updated categories
    const savedCategories = [];
    for (const category of updatedCategories) {
      const saved = await this.categoryStore.saveCategory(category);
      savedCategories.push(saved);
    }

    return savedCategories;
  }

  /**
   * Hide a category
   * Hiding a category hides all products within it
   * @param {string} categoryId - Category ID
   * @returns {Promise<Category>} Updated category
   */
  async hideCategory(categoryId) {
    const category = await this.categoryStore.getCategory(categoryId);
    if (!category) {
      throw new Error(`Category with ID "${categoryId}" not found`);
    }

    if (category.visibility === CATEGORY_VISIBILITY.HIDDEN) {
      return category; // Already hidden
    }

    // Update visibility
    category.visibility = CATEGORY_VISIBILITY.HIDDEN;
    category.updatedAt = new Date().toISOString();

    // Save category
    const updatedCategory = await this.categoryStore.saveCategory(category);

    // Note: Products within this category are implicitly hidden
    // This is enforced at query time, not by modifying product records
    // The product store should filter products by category visibility

    return updatedCategory;
  }

  /**
   * Unhide a category
   * Unhiding a category makes all products within it visible again
   * @param {string} categoryId - Category ID
   * @returns {Promise<Category>} Updated category
   */
  async unhideCategory(categoryId) {
    const category = await this.categoryStore.getCategory(categoryId);
    if (!category) {
      throw new Error(`Category with ID "${categoryId}" not found`);
    }

    if (category.visibility === CATEGORY_VISIBILITY.ACTIVE) {
      return category; // Already active
    }

    // Update visibility
    category.visibility = CATEGORY_VISIBILITY.ACTIVE;
    category.updatedAt = new Date().toISOString();

    // Save category
    const updatedCategory = await this.categoryStore.saveCategory(category);

    // Note: Products within this category become visible again
    // This is enforced at query time, not by modifying product records

    return updatedCategory;
  }

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Category|null>} Category or null if not found
   */
  async getCategory(categoryId) {
    return await this.categoryStore.getCategory(categoryId);
  }

  /**
   * Get category by name
   * @param {string} name - Category name
   * @returns {Promise<Category|null>} Category or null if not found
   */
  async getCategoryByName(name) {
    return await this.categoryStore.getCategoryByName(name);
  }

  /**
   * Get all categories
   * @param {Object} options - Query options
   * @param {boolean} options.onlyVisible - Only return visible categories
   * @param {boolean} options.sortByOrder - Sort by display order
   * @returns {Promise<Category[]>} Array of categories
   */
  async getAllCategories({ onlyVisible = false, sortByOrder = true } = {}) {
    let categories = await this.categoryStore.getAllCategories();

    // Filter by visibility
    if (onlyVisible) {
      categories = categories.filter((cat) => cat.isVisible());
    }

    // Sort by display order
    if (sortByOrder) {
      categories.sort((a, b) => {
        // First sort by display order (ascending)
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        // Then sort by name (alphabetical)
        return a.name.localeCompare(b.name);
      });
    }

    return categories;
  }

  /**
   * Get visible categories (for UI display)
   * @returns {Promise<Category[]>} Array of visible categories
   */
  async getVisibleCategories() {
    return this.getAllCategories({ onlyVisible: true, sortByOrder: true });
  }

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   * @param {boolean} force - Force delete even if products exist
   * @returns {Promise<void>}
   */
  async deleteCategory(categoryId, force = false) {
    const category = await this.categoryStore.getCategory(categoryId);
    if (!category) {
      throw new Error(`Category with ID "${categoryId}" not found`);
    }

    // Check if category has products
    const productsInCategory = await this.productStore.getProductsByCategoryId(categoryId);
    
    // Validate deletion using validation rules
    const { ValidationService } = await import("./validation-rules");
    const validation = ValidationService.validateCategoryDeletion({
      categoryId,
      productsInCategory,
      force,
    });

    if (!validation.valid) {
      // Fail loudly with explicit error
      const error = new Error(validation.error.message);
      error.code = validation.error.code;
      error.details = validation.error;
      throw error;
    }

    // If force delete, reassign products to a default category or delete them
    if (force && productsInCategory.length > 0) {
      // This is a destructive operation - should be handled carefully
      // For now, we'll just delete the category and let the product store handle orphaned products
      // In production, you might want to reassign to a default category
    }

    await this.categoryStore.deleteCategory(categoryId);
  }

  /**
   * Get products in a category (respecting visibility)
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of products (empty if category is hidden)
   */
  async getProductsInCategory(categoryId) {
    const category = await this.categoryStore.getCategory(categoryId);
    if (!category) {
      return [];
    }

    // If category is hidden, return empty array (all products are hidden)
    if (category.isHidden()) {
      return [];
    }

    // Get products in category
    return await this.productStore.getProductsByCategoryId(categoryId);
  }

  /**
   * Check if category is visible
   * @param {string} categoryId - Category ID
   * @returns {Promise<boolean>} True if category is visible
   */
  async isCategoryVisible(categoryId) {
    const category = await this.categoryStore.getCategory(categoryId);
    if (!category) {
      return false;
    }
    return category.isVisible();
  }
}

export default CategoryService;
