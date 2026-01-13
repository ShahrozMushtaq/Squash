"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES_DATA } from "@/lib/catalog/catalog-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Create Product Dialog
 * Professional product creation form matching the reference design
 */
export function CreateProductDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0",
    stock: "0",
    categoryId: "",
    hasSKU: false,
    sku: "",
    barcode: "",
    image: null,
    variants: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showVariants, setShowVariants] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        alert("Unsupported file format. Please use JPEG, PNG, GIF, WebP, BMP, or SVG.");
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { id: Date.now(), name: "", price: "", stock: "" },
      ],
    });
    setShowVariants(true);
  };

  const handleVariantChange = (id, field, value) => {
    setFormData({
      ...formData,
      variants: formData.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    });
  };

  const handleRemoveVariant = (id) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((v) => v.id !== id),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      alert("Valid price is required");
      return;
    }
    if (!formData.categoryId) {
      alert("Category is required");
      return;
    }
    if (formData.hasSKU && !formData.sku.trim()) {
      alert("SKU is required when 'This item has a SKU' is checked");
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Product data:", formData);
    alert("Product created successfully! (This is a demo - backend integration required)");
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      price: "0",
      stock: "0",
      categoryId: "",
      hasSKU: false,
      sku: "",
      barcode: "",
      image: null,
      variants: [],
    });
    setImagePreview(null);
    setShowVariants(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add Product
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Fill in the details below to add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name Section */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              className="h-10"
              required
            />
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter product description"
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Product Image Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">
              Product Image (Base)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="max-h-32 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <label htmlFor="image-upload">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer h-9"
                        onClick={() => document.getElementById("image-upload").click()}
                      >
                        Upload Image
                      </Button>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported formats: JPEG, PNG, GIF, WebP, BMP, SVG • Max size: 2MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-900">Pricing</Label>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-900">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                className="h-10"
                required
              />
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-gray-900">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES_DATA.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Inventory</h3>
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-semibold text-gray-900">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="0"
                className="h-10"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="hasSKU"
                checked={formData.hasSKU}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, hasSKU: checked })
                }
              />
              <Label
                htmlFor="hasSKU"
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                This item has a SKU
              </Label>
            </div>

            {formData.hasSKU && (
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-semibold text-gray-900">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="Enter SKU"
                  className="h-10"
                  required={formData.hasSKU}
                />
              </div>
            )}
          </div>

          {/* Barcode Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Barcode</h3>
            <div className="space-y-2">
              <Label htmlFor="barcode" className="text-sm font-semibold text-gray-900">
                Barcode
              </Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                placeholder="Enter product barcode"
                className="h-10"
              />
            </div>
          </div>

          {/* Product Variants Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Product Variants</h3>
            <p className="text-xs text-gray-600">
              Add different sizes, colors, or other options.
            </p>

            {formData.variants.length > 0 && (
              <div className="space-y-2">
                {formData.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <Input
                      placeholder="Variant name"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "name", e.target.value)
                      }
                      className="flex-1 h-9 text-sm"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "price", e.target.value)
                      }
                      className="w-28 h-9 text-sm"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "stock", e.target.value)
                      }
                      className="w-28 h-9 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-gray-400" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                  className="gap-2 h-9"
                >
                  <Plus className="h-4 w-4" />
                  Add options like size or color
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-9"
            >
              Cancel
            </Button>
            <Button type="submit" className="h-9">
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
