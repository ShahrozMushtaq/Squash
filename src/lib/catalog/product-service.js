/**
 * Product Service
 * 
 * Manages products with validation and guardrails.
 * Prevents saving invalid product states.
 */

import { ValidationService } from "./validation-rules";

/**
 * Product Service
 * Manages products with strict validation
 */
export class ProductService {
  /**
   * Constructor
   * @param {Object} productStore - Storage adapter for products
   * @param {Object} categoryStore - Storage adapter for categories (for validation)
   */
  constructor(productStore, categoryStore) {
    this.productStore = productStore;
    this.categoryStore = categoryStore;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    // Validate category assignment
    const category = await this.categoryStore.getCategory(productData.categoryId);
    const categoryValidation = ValidationService.validateCategoryAssignment({
      categoryId: productData.categoryId,
      category,
    });

    if (!categoryValidation.valid) {
      const error = new Error(categoryValidation.error.message);
      error.code = categoryValidation.error.code;
      error.details = categoryValidation.error;
      throw error;
    }

    // Check for duplicate name
    const existingByName = await this.productStore.getProductByName(productData.name);

    // Validate product state
    const validation = ValidationService.validateProduct(productData, {
      existingProductByName: existingByName,
    });

    if (!validation.valid) {
      // Fail loudly with explicit error
      const error = new Error(validation.error.message);
      error.code = validation.error.code;
      error.details = validation.error;
      throw error;
    }

    // Create product
    return await this.productStore.createProduct(productData);
  }

  /**
   * Update an existing product
   * @param {string} productId - Product ID
   * @param {Object} updates - Product updates
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, updates) {
    const existingProduct = await this.productStore.getProduct(productId);
    if (!existingProduct) {
      throw new Error(`Product with ID "${productId}" not found`);
    }

    // Merge updates with existing product
    const updatedProduct = { ...existingProduct, ...updates, id: productId };

    // Validate category assignment if category is being changed
    if (updates.categoryId && updates.categoryId !== existingProduct.categoryId) {
      const category = await this.categoryStore.getCategory(updates.categoryId);
      const categoryValidation = ValidationService.validateCategoryAssignment({
        categoryId: updates.categoryId,
        category,
      });

      if (!categoryValidation.valid) {
        const error = new Error(categoryValidation.error.message);
        error.code = categoryValidation.error.code;
        error.details = categoryValidation.error;
        throw error;
      }
    }

    // Check for duplicate name if name is being changed
    let existingByName = null;
    if (updates.name && updates.name !== existingProduct.name) {
      existingByName = await this.productStore.getProductByName(updates.name);
    }

    // Validate product state
    const validation = ValidationService.validateProduct(updatedProduct, {
      existingProduct,
      existingProductByName: existingByName,
    });

    if (!validation.valid) {
      // Fail loudly with explicit error
      const error = new Error(validation.error.message);
      error.code = validation.error.code;
      error.details = validation.error;
      throw error;
    }

    // Update product
    return await this.productStore.updateProduct(productId, updatedProduct);
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product or null
   */
  async getProduct(productId) {
    return await this.productStore.getProduct(productId);
  }

  /**
   * Get all products
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of products
   */
  async getAllProducts(options = {}) {
    return await this.productStore.getAllProducts(options);
  }
}

export default ProductService;
