"use client";

import { useState } from "react";
import { CATALOG_PRODUCTS, CATEGORIES_DATA } from "@/lib/catalog/catalog-data";
import { Package, Search, ArrowLeft, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductDetailTabs } from "./product-detail-tabs";
import { CategoryManagement } from "./category-management";
import { CreateProductDialog } from "./create-product-dialog";
import { cn } from "@/lib/utils";

/**
 * Catalog View
 * Displays products in a table layout with search and category filtering
 * Clicking a product shows its detail tabs
 */
export function CatalogView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter products
  const filteredProducts = CATALOG_PRODUCTS.filter((product) => {
    // Filter by category
    if (selectedCategory !== "All") {
      const category = CATEGORIES_DATA.find((c) => c.name === selectedCategory);
      if (!category || product.categoryId !== category.id) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return product.name.toLowerCase().includes(query);
    }

    return true;
  });

  const getStockBadge = (product) => {
    const stockState = product.inventory?.stockState || "out_of_stock";
    switch (stockState) {
      case "in_stock":
        return <Badge className="bg-green-500 text-white text-xs">In Stock</Badge>;
      case "low_stock":
        return <Badge className="bg-yellow-500 text-white text-xs">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-gray-500 text-white text-xs">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const getStockDisplay = (product) => {
    if (product.hasVariants) {
      const totalStock =
        product.variants?.reduce((sum, v) => sum + (v.inventory?.currentStock || 0), 0) || 0;
      return totalStock;
    }
    return product.inventory?.currentStock || 0;
  };

  const getCategoryName = (categoryId) => {
    const category = CATEGORIES_DATA.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getPriceDisplay = (product) => {
    if (product.hasVariants && product.variants?.length > 0) {
      const prices = product.variants.map((v) => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice
        ? `$${minPrice.toFixed(2)}`
        : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    return `$${product.basePrice.toFixed(2)}`;
  };

  // If showing category management
  if (showCategories) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCategories(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Category Management</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <CategoryManagement />
        </div>
      </div>
    );
  }

  // If a product is selected, show detail view
  if (selectedProductId) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedProductId(null)}
              className="h-8 w-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {CATALOG_PRODUCTS.find((p) => p.id === selectedProductId)?.name}
              </h2>
              <p className="text-[10px] sm:text-xs text-gray-500">Product ID: {selectedProductId}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedProductId(null)}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <ProductDetailTabs productId={selectedProductId} />
        </div>
      </div>
    );
  }

  // Show product list table
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Catalog</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage products, inventory, and categories
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 h-9 text-sm border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm border-gray-300">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-sm">
                All Categories
              </SelectItem>
              {CATEGORIES_DATA.map((category) => (
                <SelectItem key={category.id} value={category.name} className="text-sm">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => setShowCreateDialog(true)}
              className="h-9 gap-2 flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Product</span>
              <span className="sm:hidden">Create</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCategories(true)}
              className="h-9 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Manage Categories</span>
              <span className="sm:hidden">Categories</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 mb-2 opacity-40" />
            <p className="text-xs sm:text-sm">No products found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Variants</TableHead>
                    <TableHead className="text-center">Promotion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className={cn(
                        "hover:bg-gray-50 cursor-pointer",
                        product.inventory?.stockState === "out_of_stock" && "opacity-60"
                      )}
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <TableCell className="font-medium text-gray-600">
                        {product.id}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {product.name}
                        {product.promotion?.isPromoted && (
                          <Badge className="ml-2 bg-blue-500 text-white text-xs">
                            {product.promotion.promoLabel || "Promoted"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {getCategoryName(product.categoryId)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900">
                        {getPriceDisplay(product)}
                      </TableCell>
                      <TableCell className="text-center text-gray-600">
                        {getStockDisplay(product)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStockBadge(product)}
                      </TableCell>
                      <TableCell className="text-center text-gray-500">
                        {product.hasVariants ? (
                          <span className="text-sm">{product.variants?.length || 0}</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.promotion?.isPromoted ? (
                          <Badge className="bg-purple-500 text-white text-xs">
                            {product.promotion.promoLabel || "Promoted"}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-3 sm:p-4 space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "bg-white border border-gray-200 rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow",
                    product.inventory?.stockState === "out_of_stock" && "opacity-60"
                  )}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">ID: {product.id}</span>
                        {getStockBadge(product)}
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight">
                        {product.name}
                      </h3>
                      {product.promotion?.isPromoted && (
                        <Badge className="mt-1 bg-blue-500 text-white text-xs">
                          {product.promotion.promoLabel || "Promoted"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {getCategoryName(product.categoryId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {getPriceDisplay(product)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {getStockDisplay(product)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Variants</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {product.hasVariants ? (product.variants?.length || 0) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Product Dialog */}
      <CreateProductDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
