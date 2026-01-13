"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductVariantSelector({
  product,
  selectedVariantId,
  onVariantChange,
}) {
  if (!product.hasVariants || !product.variants) {
    return null;
  }

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );

  const getVariantStockBadge = (variant) => {
    if (variant.stockState === "out_of_stock" || variant.stock === 0) {
      return " (Out of Stock)";
    }
    if (variant.stockState === "low_stock") {
      return ` (Low: ${variant.stock})`;
    }
    return "";
  };

  return (
    <div className="space-y-1.5">
      <Select
        value={selectedVariantId || ""}
        onValueChange={onVariantChange}
      >
        <SelectTrigger
          className={cn(
            "w-full h-8 sm:h-9 text-xs sm:text-sm border-2 bg-white rounded-md",
            !selectedVariantId 
              ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200" 
              : "border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
          )}
        >
          <SelectValue placeholder={product.variantType} />
        </SelectTrigger>
        <SelectContent>
          {product.variants.map((variant) => {
            const isOutOfStock =
              variant.stockState === "out_of_stock" || variant.stock === 0;
            return (
              <SelectItem
                key={variant.id}
                value={variant.id}
                disabled={isOutOfStock}
                className={cn("text-sm", isOutOfStock && "opacity-50")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{variant.name}</span>
                  {isOutOfStock && (
                    <span className="text-xs text-gray-500 ml-2">(Out of Stock)</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {!selectedVariantId && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>Selection required</span>
        </div>
      )}
      {selectedVariant && selectedVariant.stockState === "low_stock" && (
        <div className="text-xs text-yellow-600 font-medium flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" />
          <span>Low stock ({selectedVariant.stock} left)</span>
        </div>
      )}
    </div>
  );
}
