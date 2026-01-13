// Transaction service - handles atomic transaction processing
// In production, this would be API calls

// Simulate inventory check - in production, this would check actual inventory
function checkInventoryAvailability(items) {
  const issues = [];
  
  items.forEach((item) => {
    const product = item.product;
    const variant = item.variant;
    
    if (product.hasVariants && variant) {
      // Check variant stock
      const currentVariant = product.variants.find((v) => v.id === variant.id);
      if (!currentVariant) {
        issues.push({
          type: "variant_not_found",
          product: product.name,
          variant: variant.name,
        });
      } else if (currentVariant.stock < item.quantity) {
        issues.push({
          type: "insufficient_stock",
          product: product.name,
          variant: variant.name,
          requested: item.quantity,
          available: currentVariant.stock,
        });
      } else if (currentVariant.stockState === "out_of_stock") {
        issues.push({
          type: "out_of_stock",
          product: product.name,
          variant: variant.name,
        });
      }
    } else {
      // Check product stock
      if (product.stock < item.quantity) {
        issues.push({
          type: "insufficient_stock",
          product: product.name,
          requested: item.quantity,
          available: product.stock,
        });
      } else if (product.stockState === "out_of_stock") {
        issues.push({
          type: "out_of_stock",
          product: product.name,
        });
      }
    }
  });

  return issues;
}

// Simulate payment processing - in production, this would be an API call
function processPayment(paymentMethod, amount, total) {
  // Simulate payment failures (10% chance for demo purposes)
  // In production, this would be actual payment gateway response
  if (Math.random() < 0.1) {
    if (paymentMethod === "card") {
      return {
        success: false,
        error: "payment_declined",
        message: "Card payment was declined. Please try a different payment method.",
      };
    } else {
      return {
        success: false,
        error: "payment_failed",
        message: "Payment processing failed. Please try again.",
      };
    }
  }

  // Validate cash amount
  if (paymentMethod === "cash" && amount < total) {
    return {
      success: false,
      error: "insufficient_amount",
      message: `Insufficient amount. Total is $${total.toFixed(2)} but only $${amount.toFixed(2)} was tendered.`,
    };
  }

  return {
    success: true,
  };
}

export function processTransaction(transactionData) {
  // Step 1: Check inventory availability BEFORE processing payment
  const inventoryIssues = checkInventoryAvailability(transactionData.items);
  
  if (inventoryIssues.length > 0) {
    const issue = inventoryIssues[0];
    let message = "";
    let details = "";

    if (issue.type === "insufficient_stock") {
      message = "Insufficient inventory";
      details = `${issue.product}${issue.variant ? ` - ${issue.variant}` : ""}: Requested ${issue.requested}, but only ${issue.available} available.`;
    } else if (issue.type === "out_of_stock") {
      message = "Item out of stock";
      details = `${issue.product}${issue.variant ? ` - ${issue.variant}` : ""} is now out of stock.`;
    } else if (issue.type === "variant_not_found") {
      message = "Variant not found";
      details = `${issue.product} - ${issue.variant} is no longer available.`;
    }

    return {
      success: false,
      error: {
        type: "inventory_mismatch",
        message,
        details,
        issues: inventoryIssues,
      },
    };
  }

  // Step 2: Process payment
  const paymentResult = processPayment(
    transactionData.paymentMethod,
    transactionData.amountTendered,
    transactionData.total
  );

  if (!paymentResult.success) {
    return {
      success: false,
      error: {
        type: "payment_failure",
        message: paymentResult.message,
        details: paymentResult.error === "insufficient_amount"
          ? `Please provide at least $${transactionData.total.toFixed(2)}.`
          : "Please check your payment method and try again.",
      },
    };
  }

  // Step 3: Only if both checks pass, create transaction and decrement inventory
  const transaction = {
    id: `TXN-${Date.now()}`,
    timestamp: new Date().toISOString(),
    customer: transactionData.customer,
    items: transactionData.items,
    paymentMethod: transactionData.paymentMethod,
    amountTendered: transactionData.amountTendered,
    subtotal: transactionData.subtotal,
    discount: transactionData.discount,
    tax: transactionData.tax,
    total: transactionData.total,
    change: transactionData.change,
  };

  // Simulate inventory decrement (only on success)
  // In production, this would be an API call that atomically decrements inventory
  const inventoryUpdates = transactionData.items.map((item) => ({
    productId: item.product.id,
    variantId: item.variant?.id || null,
    quantity: item.quantity,
  }));

  return {
    success: true,
    transaction,
    inventoryUpdates,
  };
}
