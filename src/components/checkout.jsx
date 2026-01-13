"use client";

import { useState, useMemo } from "react";
import { ProductSearch } from "./checkout/product-search";
import { ProductList } from "./checkout/product-list";
import { Cart } from "./checkout/cart";
import { CustomerSelector } from "./checkout/customer-selector";
import { PaymentPanel } from "./checkout/payment-panel";
import { SuccessConfirmation } from "./checkout/success-confirmation";
import { ErrorDisplay } from "./checkout/error-display";
import { STUB_PRODUCTS, CATEGORIES } from "./checkout/stub-data";
import { STUB_CUSTOMERS } from "./checkout/stub-customers";
import { CART_CONFIG } from "./checkout/cart-config";
import { processTransaction } from "./checkout/transaction-service";

// Generate unique cart ID for items
const generateCartId = (product, variant = null) => {
  if (variant) {
    return `${product.id}_${variant.id}`;
  }
  return `${product.id}`;
};

export function Checkout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Track selected variants per product: { productId: variantId }
  const [selectedVariants, setSelectedVariants] = useState({});
  // Cart items: array of { cartId, product, variant, quantity }
  const [cartItems, setCartItems] = useState([]);
  // Selected customer (optional - can be null for guest checkout)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState(null); // "cash" | "card" | null
  const [amountTendered, setAmountTendered] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  // Transaction completion state
  const [completedTransaction, setCompletedTransaction] = useState(null);
  // Error state
  const [error, setError] = useState(null);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = STUB_PRODUCTS;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    }

    // Limit to 8 items
    return filtered.slice(0, 8);
  }, [searchQuery, selectedCategory]);

  // Calculate cart totals synchronously
  const cartTotals = useMemo(() => {
    let subtotal = 0;
    
    cartItems.forEach((item) => {
      const itemPrice = item.variant ? item.variant.price : item.product.price;
      subtotal += itemPrice * item.quantity;
    });

    // Apply member discount if customer is selected and is a member
    let discount = 0;
    if (selectedCustomer && selectedCustomer.isMember && selectedCustomer.memberDiscount > 0) {
      discount = subtotal * selectedCustomer.memberDiscount;
    }

    const tax = CART_CONFIG.taxRate > 0 ? (subtotal - discount) * CART_CONFIG.taxRate : 0;
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  }, [cartItems, selectedCustomer]);

  const handleVariantChange = (productId, variantId) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  const handleAddToCart = (product, variant = null) => {
    // Strict enforcement: If product has variants, variant MUST be provided
    if (product.hasVariants) {
      if (!variant) {
        console.error("Variant selection required but missing");
        return;
      }

      // Validate variant exists for this product
      const validVariant = product.variants?.find((v) => v.id === variant.id);
      if (!validVariant) {
        console.error("Invalid variant provided");
        return;
      }

      // Check variant stock
      if (validVariant.stock === 0 || validVariant.stockState === "out_of_stock") {
        console.error("Variant is out of stock");
        return;
      }
    } else {
      // Product without variants
      if (product.stock === 0 || product.stockState === "out_of_stock") {
        console.error("Product is out of stock");
        return;
      }
    }

    // Add to cart - immediate and synchronous
    const cartId = generateCartId(product, variant);
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.cartId === cartId);
      if (existingItem) {
        // Increase quantity if item already exists
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        return [
          ...prev,
          {
            cartId,
            product,
            variant,
            quantity: 1,
          },
        ];
      }
    });
  };

  const handleIncreaseQuantity = (cartId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecreaseQuantity = (cartId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCustomerClear = () => {
    setSelectedCustomer(null);
  };

  // Calculate change for cash payments
  const change = useMemo(() => {
    if (paymentMethod === "cash" && amountTendered > 0) {
      return amountTendered - cartTotals.total;
    }
    return 0;
  }, [paymentMethod, amountTendered, cartTotals.total]);

  // Check if payment can be processed
  const canProcessPayment = useMemo(() => {
    if (cartItems.length === 0) return false;
    if (!paymentMethod) return false;
    if (paymentMethod === "cash" && change < 0) return false;
    return true;
  }, [cartItems.length, paymentMethod, change]);

  // Atomic transaction processing
  const handleProcessPayment = async () => {
    if (!canProcessPayment) return;

    setIsProcessing(true);
    setError(null); // Clear any previous errors

    try {
      // Atomic operation: Process transaction
      const transactionData = {
        customer: selectedCustomer,
        items: cartItems,
        paymentMethod,
        amountTendered: paymentMethod === "cash" ? amountTendered : cartTotals.total,
        subtotal: cartTotals.subtotal,
        discount: cartTotals.discount,
        tax: cartTotals.tax,
        total: cartTotals.total,
        change: paymentMethod === "cash" ? change : 0,
      };

      // Process transaction (atomic operation)
      const result = processTransaction(transactionData);

      if (result.success) {
        // On success: Inventory decrements immediately (simulated)
        // In production, this would be handled by the API atomically
        
        // On success: Transaction record is created
        // In production, this would be saved to database
        
        // On success: Checkout state resets completely
        setCartItems([]);
        setSelectedVariants({});
        setSelectedCustomer(null);
        setPaymentMethod(null);
        setAmountTendered(0);
        setSearchQuery("");
        setSelectedCategory("All");
        
        // On success: Success confirmation is shown
        setCompletedTransaction(result.transaction);
      } else {
        // On failure: Cart remains intact (NOT cleared)
        // On failure: No inventory is decremented (transaction failed before that step)
        // On failure: Clear error feedback is shown
        setError(result.error);
      }
    } catch (error) {
      // Unexpected error - cart remains intact
      setError({
        type: "unexpected_error",
        message: "An unexpected error occurred",
        details: error.message || "Please try again or contact support.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleErrorDismiss = () => {
    setError(null);
  };

  const handleTransactionComplete = () => {
    // Clear transaction confirmation
    setCompletedTransaction(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Checkout</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Process sales and manage customer transactions
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-full w-full gap-3 sm:gap-4 p-2 sm:p-4 overflow-y-auto">
      {/* Left: Product Search & Product List */}
      <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 min-w-0 overflow-hidden order-2 lg:order-1">
        <ProductSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={CATEGORIES}
        />
        <ProductList
          products={filteredProducts}
          selectedVariants={selectedVariants}
          onVariantChange={handleVariantChange}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* Right: Checkout Panel */}
      <div className="w-full lg:w-[400px] flex flex-col gap-3 sm:gap-4 shrink-0 order-1 lg:order-2">
        {/* Cart */}
        <div className="flex-1 min-h-0 lg:min-h-[400px]">
          <Cart
            items={cartItems}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            subtotal={cartTotals.subtotal}
            discount={cartTotals.discount}
            tax={cartTotals.tax}
            total={cartTotals.total}
          />
        </div>

        {/* Customer Selector (Optional) */}
        <CustomerSelector
          customers={STUB_CUSTOMERS}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          onCustomerClear={handleCustomerClear}
        />

        {/* Payment Panel */}
        <PaymentPanel
          total={cartTotals.total}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          amountTendered={amountTendered}
          onAmountTenderedChange={setAmountTendered}
          change={change}
          onProcessPayment={handleProcessPayment}
          isProcessing={isProcessing}
          canProcess={canProcessPayment}
        />
      </div>

      {/* Success Confirmation Modal */}
      {completedTransaction && (
        <SuccessConfirmation
          transaction={completedTransaction}
          onComplete={handleTransactionComplete}
        />
      )}

      {/* Error Display Modal */}
      <ErrorDisplay error={error} onDismiss={handleErrorDismiss} />
    </div>
    </div>
  );
}
