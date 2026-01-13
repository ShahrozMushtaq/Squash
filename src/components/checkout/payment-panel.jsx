"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentPanel({
  total,
  paymentMethod,
  onPaymentMethodChange,
  amountTendered,
  onAmountTenderedChange,
  change,
  onProcessPayment,
  isProcessing,
  canProcess,
}) {
  const handleCashAmountChange = (value) => {
    const numValue = parseFloat(value) || 0;
    onAmountTenderedChange(numValue);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Payment Method Selection */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Payment Method</h3>
        <div className="flex gap-2">
          <Button
            variant={paymentMethod === "cash" ? "default" : "outline"}
            className={cn(
              "flex-1 h-9 sm:h-10 text-xs sm:text-sm font-medium transition-all",
              paymentMethod === "cash"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => onPaymentMethodChange("cash")}
            disabled={isProcessing}
          >
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Cash
          </Button>
          <Button
            variant={paymentMethod === "card" ? "default" : "outline"}
            className={cn(
              "flex-1 h-9 sm:h-10 text-xs sm:text-sm font-medium transition-all",
              paymentMethod === "card"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => onPaymentMethodChange("card")}
            disabled={isProcessing}
          >
            <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Card
          </Button>
        </div>
      </div>

      {/* Amount Entry (only for cash) */}
      {paymentMethod === "cash" && (
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 mb-1.5 sm:mb-2 block font-medium">
                Amount Tendered
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountTendered > 0 ? amountTendered.toFixed(2) : ""}
                onChange={(e) => handleCashAmountChange(e.target.value)}
                disabled={isProcessing}
                className="h-9 sm:h-10 text-sm sm:text-base font-semibold border-gray-300"
              />
            </div>
            {change >= 0 && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Change</span>
                <span className={cn(
                  "text-sm sm:text-base font-semibold",
                  change < 0 ? "text-red-600" : "text-gray-900"
                )}>
                  ${change.toFixed(2)}
                </span>
              </div>
            )}
            {change < 0 && (
              <p className="text-[10px] sm:text-xs text-red-600 font-medium">
                Insufficient amount. Need ${Math.abs(change).toFixed(2)} more.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Card payment info */}
      {paymentMethod === "card" && (
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
          <div className="text-xs sm:text-sm text-gray-500">
            Card payment will be processed automatically
          </div>
        </div>
      )}

      {/* Process Payment Button */}
      <div className="p-3 sm:p-5">
        <Button
          variant="default"
          size="lg"
          className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!canProcess || isProcessing}
          onClick={onProcessPayment}
        >
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          {isProcessing ? "Processing..." : "Process Payment"}
        </Button>
      </div>
    </div>
  );
}
