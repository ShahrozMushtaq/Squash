"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductDetailsDialog({ product, open, onOpenChange }) {
  if (!product) return null;

  const getStockBadge = () => {
    if (product.hasVariants && product.variants) {
      // For products with variants, show overall status
      const hasInStock = product.variants.some((v) => v.stockState === "in_stock");
      const hasLowStock = product.variants.some((v) => v.stockState === "low_stock");
      
      if (hasInStock) {
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            In Stock
          </Badge>
        );
      }
      if (hasLowStock) {
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            Low Stock
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Out of Stock
        </Badge>
      );
    }

    // For products without variants
    switch (product.stockState) {
      case "in_stock":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            In Stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            Low Stock ({product.stock})
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

  const getPriceDisplay = () => {
    if (product.hasVariants && product.variants) {
      const prices = product.variants.map((v) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `$${minPrice.toFixed(2)}`;
      }
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    return `$${product.price.toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg font-semibold text-gray-900 pr-8">
              {product.name}
            </DialogTitle>
            {getStockBadge() && (
              <div className="flex-shrink-0">
                {getStockBadge()}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Image - Compact */}
          <div className="relative w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <Package className="h-12 w-12 text-gray-400" />
          </div>

          {/* Compact Product Info */}
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">Price: </span>
              <span className="font-semibold text-gray-900">{getPriceDisplay()}</span>
            </div>
            <div>
              <span className="text-gray-500">Category: </span>
              <span className="font-medium text-gray-900">{product.category}</span>
            </div>
            {!product.hasVariants && (
              <div>
                <span className="text-gray-500">Stock: </span>
                <span className="font-medium text-gray-900">{product.stock || 0}</span>
              </div>
            )}
          </div>

          {/* Variants Section - More Compact */}
          {product.hasVariants && product.variants && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {product.variantType || "Variants"}
              </h3>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={cn(
                      "flex items-center justify-between gap-3 p-2.5 rounded border text-sm",
                      variant.stockState === "out_of_stock" || variant.stock === 0
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-0.5">
                        {variant.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>${variant.price.toFixed(2)}</span>
                        <span>•</span>
                        <span>{variant.stock || 0} units</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {variant.stockState === "in_stock" ? (
                        <Badge className="bg-green-500 text-white text-xs">In Stock</Badge>
                      ) : variant.stockState === "low_stock" ? (
                        <Badge className="bg-yellow-500 text-white text-xs">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-gray-500 text-white text-xs">Out of Stock</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description if available */}
          {product.description && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
