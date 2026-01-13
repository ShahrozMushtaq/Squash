"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Package } from "lucide-react";
import { TransactionsView } from "./transactions-view";
import { PickupsView } from "./pickups-view";

/**
 * Sales View
 * Complete, auditable record of all transactions and pickups
 */
export function SalesView() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Sales</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Complete, auditable record of all transactions and pickups
          </p>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 border-b border-gray-200">
          <TabsList className="inline-flex h-9 sm:h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-hide w-full">
            <TabsTrigger value="transactions" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="pickups" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Pickups
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="transactions" className="m-0 data-[state=active]:block h-full">
            <TransactionsView />
          </TabsContent>
          <TabsContent value="pickups" className="m-0 data-[state=active]:block h-full">
            <PickupsView />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
