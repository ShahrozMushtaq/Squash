"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

export function ErrorDisplay({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background rounded-lg border border-destructive shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-2 shrink-0">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-destructive mb-1">
              Transaction Failed
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message}
            </p>
            
            {error.details && (
              <div className="bg-muted rounded-md p-3 mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Details:
                </p>
                <p className="text-xs text-foreground">
                  {error.details}
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
