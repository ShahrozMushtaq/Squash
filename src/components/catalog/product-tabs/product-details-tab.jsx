"use client";

import { useState } from "react";
import { getProductById, getCategoryById, CATEGORIES_DATA } from "@/lib/catalog/catalog-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product Details Tab
 * 
 * Owns: Product data (name, price, description, category, variants)
 * Does NOT mutate: Inventory, Promotions, Activity
 */
export function ProductDetailsTab({ productId, variantId = null }) {
  const product = getProductById(productId);
  const category = product ? getCategoryById(product.categoryId) : null;

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    basePrice: product?.basePrice || 0,
    categoryId: product?.categoryId || "",
    status: product?.status || "active",
    visibility: product?.visibility || "active",
    inventoryTracking: product?.inventoryTracking || false,
    discountEligible: product?.discountEligible || false,
    hasVariants: product?.hasVariants || false,
    variantType: product?.variantType || "",
  });

  const [variants, setVariants] = useState(product?.variants || []);

  if (!product) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
        Product not found
      </div>
    );
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving product details:", formData, variants);
    alert("Product details saved!");
  };

  const addVariant = () => {
    const newVariant = {
      id: `variant-${Date.now()}`,
      name: "",
      sku: "",
      price: formData.basePrice,
      inventory: {
        currentStock: 0,
        reservedStock: 0,
        reorderPoint: 0,
        lowStockThreshold: 0,
        isEnabled: true,
        stockState: "out_of_stock",
      },
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  const updateVariant = (variantId, field, value) => {
    setVariants(
      variants.map((v) =>
        v.id === variantId ? { ...v, [field]: value } : v
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage product information, pricing, and variants
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Required Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES_DATA.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-semibold">
              Price <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) =>
                setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })
              }
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku" className="text-sm font-semibold">
              SKU
            </Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="h-9"
            />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">
            Description
          </Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product description..."
          />
        </div>

        {/* Image Management */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Images</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">Image Upload & Management</p>
            <p className="text-xs text-gray-400">
              Drag and drop images here or click to browse
            </p>
            <Button variant="outline" className="mt-3 gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Upload Images
            </Button>
            {product.imageUrls && product.imageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded border border-gray-200">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => {
                        // Remove image logic
                        console.log("Remove image", index);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Inventory Tracking</Label>
              <p className="text-xs text-gray-500">Track stock levels for this product</p>
            </div>
            <Switch
              checked={formData.inventoryTracking}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, inventoryTracking: checked })
              }
            />
          </div>

          {/* Product States Section */}
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Product States</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Active State - Manual */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Active</Label>
                    <p className="text-xs text-gray-500">Product is sellable (Admin-controlled)</p>
                  </div>
                  <Switch
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        status: checked ? "active" : "inactive",
                      })
                    }
                  />
                </div>

                {/* Hidden State - Manual */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Hidden</Label>
                    <p className="text-xs text-gray-500">Hide from catalog (Admin-controlled)</p>
                  </div>
                  <Switch
                    checked={formData.visibility === "hidden"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        visibility: checked ? "hidden" : "active",
                      })
                    }
                  />
                </div>

                {/* Out of Stock State - Derived (Read-only) */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Out of Stock</Label>
                    <p className="text-xs text-blue-600">System-driven (computed from inventory)</p>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      product.inventory?.stockState === "out_of_stock"
                        ? "bg-red-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    )}
                  >
                    {product.inventory?.stockState === "out_of_stock" ? "Yes" : "No"}
                  </Badge>
                </div>

                {/* On Sale State - Derived (Read-only) */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">On Sale</Label>
                    <p className="text-xs text-blue-600">Price-driven (computed from promotions)</p>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      product.promotion?.isPromoted && product.promotion?.isActive
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    )}
                  >
                    {product.promotion?.isPromoted && product.promotion?.isActive ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">Discount Eligible</Label>
              <p className="text-xs text-gray-500">Allow discounts on this product</p>
            </div>
            <Switch
              checked={formData.discountEligible}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, discountEligible: checked })
              }
            />
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Variants</Label>
              <p className="text-xs text-gray-500">Manage product variants (sizes, colors, etc.)</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.hasVariants}
                onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
              />
              <span className="text-sm text-gray-600">Enable Variants</span>
            </div>
          </div>

          {formData.hasVariants && (
            <>
              <div className="space-y-2">
                <Label htmlFor="variantType" className="text-sm font-semibold">
                  Variant Type
                </Label>
                <Input
                  id="variantType"
                  value={formData.variantType}
                  onChange={(e) => setFormData({ ...formData, variantType: e.target.value })}
                  placeholder="e.g., Size, Color, Type"
                  className="h-9"
                />
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <Input
                      placeholder="Variant name"
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                      className="flex-1 h-9"
                    />
                    <Input
                      placeholder="SKU"
                      value={variant.sku || ""}
                      onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                      className="w-32 h-9"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(variant.id, "price", parseFloat(e.target.value) || 0)
                      }
                      className="w-32 h-9"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(variant.id)}
                      className="h-9 w-9 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addVariant}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
