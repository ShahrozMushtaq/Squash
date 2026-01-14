"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductVariantSelector } from "./product-variant-selector";

export function ProductList({
  products,
  selectedVariants,
  onVariantChange,
  onAddToCart,
  onProductClick,
}) {
  const getStockBadge = (product, variant = null) => {
    const stockState = variant ? variant.stockState : product.stockState;
    const stock = variant ? variant.stock : product.stock;

    switch (stockState) {
      case "in_stock":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            In Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            Low Stock ({stock})
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Out of Stock
          </Badge>
        );
      default:
        return null;
    }
  };

  const getProductPrice = (product, variant = null) => {
    return variant ? variant.price : product.price;
  };

  const getProductStockState = (product, variant = null) => {
    if (variant) {
      return variant.stockState;
    }
    return product.stockState;
  };

  const getProductStock = (product, variant = null) => {
    return variant ? variant.stock : product.stock;
  };

  const isProductAddable = (product, variant = null) => {
    const stockState = getProductStockState(product, variant);
    const stock = getProductStock(product, variant);

    // If product has variants, variant MUST be selected
    if (product.hasVariants && !variant) {
      return false;
    }

    // Stock must be available
    return stockState !== "out_of_stock" && stock > 0;
  };

  if (products.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {products.slice(0, 6).map((product) => {
          const selectedVariantId = selectedVariants[product.id] || null;
          const selectedVariant = product.hasVariants
            ? product.variants?.find((v) => v.id === selectedVariantId)
            : null;

          const price = getProductPrice(product, selectedVariant);
          const stockState = getProductStockState(product, selectedVariant);
          const stock = getProductStock(product, selectedVariant);
          const addable = isProductAddable(product, selectedVariant);
          const isLowStock = stockState === "low_stock";
          const variantRequired = product.hasVariants && !selectedVariantId;

          // Get stock status for badge
          const getStockStatus = () => {
            if (selectedVariant) {
              if (selectedVariant.stockState === "out_of_stock" || selectedVariant.stock === 0) {
                return { label: "Out of Stock", color: "bg-gray-500" };
              }
              if (selectedVariant.stockState === "low_stock") {
                return { label: "Low Stock", color: "bg-yellow-500" };
              }
              return { label: "In Stock", color: "bg-green-500" };
            }
            if (product.stockState === "out_of_stock" || product.stock === 0) {
              return { label: "Out of Stock", color: "bg-gray-500" };
            }
            if (product.stockState === "low_stock") {
              return { label: "Low Stock", color: "bg-yellow-500" };
            }
            return { label: "In Stock", color: "bg-green-500" };
          };

          const stockStatus = getStockStatus();

          return (
            <div
              key={product.id}
              className={cn(
                "relative flex flex-col rounded-lg border transition-all bg-white overflow-hidden group cursor-pointer",
                addable && !variantRequired
                  ? "border-gray-200 hover:border-gray-300 hover:shadow-xl"
                  : "border-gray-200"
              )}
              onClick={() => onProductClick && onProductClick(product)}
            >
              {/* Product Image Placeholder */}
              <div className="relative w-full h-32 sm:h-40 lg:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                <div className="text-gray-400">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
                </div>
                
                {/* Status Badge - Top Right */}
                <div className={cn(
                  "absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium text-white",
                  stockStatus.color === "bg-green-500" ? "bg-green-600" :
                  stockStatus.color === "bg-yellow-500" ? "bg-yellow-600" :
                  "bg-gray-700"
                )}>
                  {stockStatus.label}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col p-3 sm:p-4">
                {/* Product Name - Semibold for better hierarchy */}
                <div className="font-semibold text-base sm:text-lg leading-tight line-clamp-2 mb-2 text-gray-900">
                  {product.name}
                </div>

                {/* Price Display - Bold to stand out */}
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  ${price.toFixed(2)}
                </div>

                {/* Variant Selector - Compact Design */}
                {product.hasVariants && (
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <ProductVariantSelector
                      product={product}
                      selectedVariantId={selectedVariantId}
                      onVariantChange={(variantId) =>
                        onVariantChange(product.id, variantId)
                      }
                    />
                  </div>
                )}

                {/* Add Button - Clear CTA with Icon */}
                <div className="mt-auto">
                  <Button
                    variant={addable && !variantRequired ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "w-full h-10 sm:h-11 text-sm sm:text-base font-semibold",
                      !addable || variantRequired ? "text-gray-500 border-gray-300" : ""
                    )}
                    disabled={!addable || variantRequired}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering product click
                      if (addable && !variantRequired) {
                        if (product.hasVariants && !selectedVariant) {
                          console.error("Variant selection required but missing");
                          return;
                        }
                        onAddToCart(product, selectedVariant);
                      }
                    }}
                  >
                    {addable && !variantRequired && (
                      <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    )}
                    {variantRequired
                      ? "Select Variant"
                      : addable
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
