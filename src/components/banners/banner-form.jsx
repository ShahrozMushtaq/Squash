"use client";

import { useState, useEffect } from "react";
import { PROMOTED_PRODUCTS } from "@/lib/banners/banners-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Banner Form
 * Create or edit banner
 */
export function BannerForm({ banner, onSave, onCancel, open, onOpenChange }) {
  const isEditing = !!banner;

  const [formData, setFormData] = useState({
    type: banner?.type || "static",
    headline: banner?.headline || "",
    subtext: banner?.subtext || "",
    imageUrl: banner?.imageUrl || "",
    ctaLink: banner?.ctaLink || "",
    ctaText: banner?.ctaText || "",
    isActive: banner?.isActive ?? false,
    isPrimary: banner?.isPrimary ?? false,
    associatedProducts: banner?.associatedProducts || [],
    startDate: banner?.startDate
      ? new Date(banner.startDate).toISOString().slice(0, 16)
      : "",
    endDate: banner?.endDate
      ? new Date(banner.endDate).toISOString().slice(0, 16)
      : "",
  });

  const handleSave = () => {
    // Validation
    if (!formData.headline.trim()) {
      alert("Headline is required");
      return;
    }

    if (!formData.imageUrl.trim()) {
      alert("Banner image is required");
      return;
    }

    const bannerData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    onSave(bannerData);
  };

  const toggleProduct = (productId) => {
    const currentProducts = formData.associatedProducts || [];
    if (currentProducts.includes(productId)) {
      setFormData({
        ...formData,
        associatedProducts: currentProducts.filter((id) => id !== productId),
      });
    } else {
      setFormData({
        ...formData,
        associatedProducts: [...currentProducts, productId],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
            {isEditing ? "Edit Banner" : "Create Banner"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600">
            {isEditing
              ? "Update banner details and settings"
              : "Fill in the details below to create a new banner"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4 sm:space-y-6 mt-3 sm:mt-4"
        >
          {/* Banner Type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Banner Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static Banner</SelectItem>
                <SelectItem value="product">Product-Based Banner</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {formData.type === "product"
                ? "References promoted products from Catalog"
                : "Standalone banner with image and text"}
            </p>
          </div>

          {/* Required Fields */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Required Fields</h3>

            {/* Banner Image */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-semibold">
                Banner Image <span className="text-red-500">*</span>
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Image URL or path"
                className="h-9"
              />
              {formData.imageUrl && (
                <div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative">
                  <img
                    src={formData.imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder) placeholder.style.display = "flex";
                    }}
                  />
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center hidden">
                    <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <span className="ml-2 text-xs sm:text-sm text-gray-500">Image not found</span>
                  </div>
                </div>
              )}
              {!formData.imageUrl && (
                <div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">No image preview</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Enter image URL above</p>
                  </div>
                </div>
              )}
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <Label htmlFor="headline" className="text-sm font-semibold">
                Headline Text <span className="text-red-500">*</span>
              </Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Enter headline text"
                className="h-9"
              />
            </div>

            {/* Active State */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Active State</Label>
                <p className="text-xs text-gray-500">Enable or disable this banner</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Optional Fields</h3>

            {/* Subtext */}
            <div className="space-y-2">
              <Label htmlFor="subtext" className="text-sm font-semibold">
                Subtext
              </Label>
              <Input
                id="subtext"
                value={formData.subtext}
                onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                placeholder="Enter subtext (optional)"
                className="h-9"
              />
            </div>

            {/* CTA Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaLink" className="text-sm font-semibold">
                  CTA Link
                </Label>
                <Input
                  id="ctaLink"
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  placeholder="/catalog"
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaText" className="text-sm font-semibold">
                  CTA Text
                </Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="Shop Now"
                  className="h-9"
                />
              </div>
            </div>

            {/* Associated Products (for product-based banners) */}
            {formData.type === "product" && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Associated Promoted Products</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Select promoted products from Catalog to associate with this banner
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROMOTED_PRODUCTS.map((product) => {
                    const isSelected = formData.associatedProducts.includes(product.id);
                    return (
                      <Badge
                        key={product.id}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer text-xs",
                          isSelected && "bg-blue-500 text-white hover:bg-blue-600"
                        )}
                        onClick={() => toggleProduct(product.id)}
                      >
                        {product.name}
                        {product.promotion?.promoLabel && (
                          <span className="ml-1">({product.promotion.promoLabel})</span>
                        )}
                      </Badge>
                    );
                  })}
                </div>
                {formData.associatedProducts.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No products selected. Click on product badges above to select.
                  </p>
                )}
              </div>
            )}

            {/* Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold">
                  Start Date (Optional)
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold">
                  End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            {/* Primary Banner */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-blue-900">Set as Primary</Label>
                <p className="text-xs text-blue-700">
                  Only one primary banner can be active at a time
                </p>
              </div>
              <Switch
                checked={formData.isPrimary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrimary: checked })
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-9 sm:h-10 w-full sm:w-auto text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-9 sm:h-10 gap-2 w-full sm:w-auto text-xs sm:text-sm">
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {isEditing ? "Update Banner" : "Create Banner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
