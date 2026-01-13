"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Box, Tag, History } from "lucide-react";
import { ProductDetailsTab } from "./product-tabs/product-details-tab";
import { ProductInventoryTab } from "./product-tabs/product-inventory-tab";
import { ProductPromotionTab } from "./product-tabs/product-promotion-tab";
import { ProductActivityTab } from "./product-tabs/product-activity-tab";

/**
 * Product Detail Tabs
 * 
 * Tabbed interface for viewing/editing product information.
 * Each tab operates independently on its own domain.
 */
export function ProductDetailTabs({ productId, variantId = null }) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="inline-flex h-9 sm:h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-hide w-full">
        <TabsTrigger value="details" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Details</span>
          <span className="sm:hidden">Details</span>
        </TabsTrigger>
        <TabsTrigger value="inventory" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
          <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Inventory</span>
          <span className="sm:hidden">Stock</span>
        </TabsTrigger>
        <TabsTrigger value="promotion" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
          <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Promotion</span>
          <span className="sm:hidden">Promo</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
          <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Activity
        </TabsTrigger>
      </TabsList>

      {/* Details Tab - Owns: Product data (name, price, description, category) */}
      <TabsContent value="details" className="mt-3 sm:mt-4">
        <ProductDetailsTab productId={productId} variantId={variantId} />
      </TabsContent>

      {/* Inventory Tab - Owns: Inventory records, stock levels, reorder points */}
      <TabsContent value="inventory" className="mt-3 sm:mt-4">
        <ProductInventoryTab productId={productId} variantId={variantId} />
      </TabsContent>

      {/* Promotion Tab - Owns: Visibility promotions (promote/unpromote, priority, label) */}
      <TabsContent value="promotion" className="mt-3 sm:mt-4">
        <ProductPromotionTab productId={productId} variantId={variantId} />
      </TabsContent>

      {/* Activity Tab - Read-only, Owns: Activity log entries */}
      <TabsContent value="activity" className="mt-3 sm:mt-4">
        <ProductActivityTab productId={productId} variantId={variantId} />
      </TabsContent>
    </Tabs>
  );
}
