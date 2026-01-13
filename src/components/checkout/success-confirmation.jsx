"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Receipt } from "lucide-react";

export function SuccessConfirmation({ transaction, onComplete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background rounded-lg border border-border shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Payment Successful
            </h2>
            <p className="text-muted-foreground">
              Transaction completed successfully
            </p>
          </div>

          <div className="w-full border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono font-medium">{transaction.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">${transaction.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{transaction.paymentMethod}</span>
            </div>
            {transaction.change > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Change</span>
                <span>${transaction.change.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 w-full pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onComplete}
            >
              Print Receipt
            </Button>
            <Button
              className="flex-1"
              onClick={onComplete}
            >
              New Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
