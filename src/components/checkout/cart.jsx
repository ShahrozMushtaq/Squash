"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";

export function Cart({
  items,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  discount,
  tax,
  total,
}) {
  const hasItems = items && items.length > 0;

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Cart Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">
          Cart
        </h2>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 sm:py-12">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mb-3 opacity-30" />
            <p className="text-xs sm:text-sm font-medium">Cart is empty</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const itemKey = item.cartId;
              const displayName = item.variant
                ? `${item.product.name} - ${item.variant.name}`
                : item.product.name;
              const itemPrice = item.variant ? item.variant.price : item.product.price;
              const itemTotal = itemPrice * item.quantity;

              return (
                <div
                  key={itemKey}
                  className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs sm:text-sm text-gray-900 leading-5">
                      {displayName}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        ${itemPrice.toFixed(2)} × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 border border-gray-200 rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-gray-100"
                        onClick={() => onDecreaseQuantity(itemKey)}
                      >
                        <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-gray-100"
                        onClick={() => onIncreaseQuantity(itemKey)}
                      >
                        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[60px] sm:min-w-[70px]">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">
                        ${itemTotal.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onRemoveItem(itemKey)}
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {hasItems && (
        <>
          <div className="border-t border-gray-200 px-3 sm:px-5 py-3 sm:py-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-green-600">
                <span>Discount</span>
                <span className="font-medium">-${discount.toFixed(2)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>Tax</span>
                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base font-semibold text-gray-900">Total</span>
                <span className="text-base sm:text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
