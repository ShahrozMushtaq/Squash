"use client";

import { useState, useRef } from "react";
import { BANNERS_DATA, PROMOTED_PRODUCTS } from "@/lib/banners/banners-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BannerForm } from "./banner-form";

/**
 * Banners View
 * Manages front-end visual promotions and messaging
 */
export function BannersView() {
  const [banners, setBanners] = useState([...BANNERS_DATA]);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const bannerIdCounter = useRef(0);

  const handleToggleActive = (bannerId) => {
    setBanners(
      banners.map((banner) => {
        if (banner.id === bannerId) {
          const newActive = !banner.isActive;
          // If activating and this becomes primary, ensure only one primary
          if (newActive && !banner.isPrimary) {
            return {
              ...banner,
              isActive: newActive,
              isPrimary: true,
            };
          }
          return { ...banner, isActive: newActive };
        }
        // If activating a banner, deactivate others as primary
        if (banner.isPrimary && banner.id !== bannerId) {
          return { ...banner, isPrimary: false };
        }
        return banner;
      })
    );
  };

  const handleReorder = (bannerId, direction) => {
    const index = banners.findIndex((b) => b.id === bannerId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === banners.length - 1)
    ) {
      return;
    }

    const newBanners = [...banners];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newBanners[index], newBanners[newIndex]] = [
      newBanners[newIndex],
      newBanners[index],
    ];

    // Update display priorities
    newBanners.forEach((banner, idx) => {
      banner.displayPriority = idx + 1;
    });

    setBanners(newBanners);
  };

  const handleSaveBanner = (bannerData) => {
    if (editingBannerId) {
      // Update existing banner
      setBanners(
        banners.map((b) =>
          b.id === editingBannerId ? { ...b, ...bannerData } : b
        )
      );
      setEditingBannerId(null);
    } else {
      // Create new banner
      bannerIdCounter.current += 1;
      const now = new Date().toISOString();
      const newBanner = {
        id: `banner-${bannerIdCounter.current}-${now}`,
        ...bannerData,
        displayPriority: banners.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      setBanners([...banners, newBanner]);
      setShowCreateForm(false);
    }
    alert("Banner saved successfully!");
    handleCloseDialog();
  };

  const handleDeleteBanner = (bannerId) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      setBanners(banners.filter((b) => b.id !== bannerId));
    }
  };

  const getBannerTypeBadge = (type) => {
    return (
      <Badge
        className={cn(
          "text-xs",
          type === "product" ? "bg-blue-500 text-white" : "bg-gray-500 text-white"
        )}
      >
        {type === "product" ? "Product" : "Static"}
      </Badge>
    );
  };

  const getAssociatedProductsText = (productIds) => {
    if (!productIds || productIds.length === 0) return "—";
    const products = productIds
      .map((id) => PROMOTED_PRODUCTS.find((p) => p.id === id)?.name)
      .filter(Boolean);
    return products.length > 0 ? products.join(", ") : "—";
  };

  const bannerToEdit = editingBannerId
    ? banners.find((b) => b.id === editingBannerId)
    : null;

  const handleCloseDialog = () => {
    setShowCreateForm(false);
    setEditingBannerId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Banners</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Manage front-end visual promotions and messaging
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2 w-full sm:w-auto text-xs sm:text-sm h-9">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Create Banner</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Rules Info */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-blue-50">
        <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1.5 sm:mb-2">Banner Rules</h4>
        <p className="text-[10px] sm:text-xs text-blue-800">
          Only one primary banner active at a time. Manual ordering determines display priority.
        </p>
        <p className="text-[10px] sm:text-xs text-blue-800 mt-1">
          Simple content only. Product-based banners reference promoted products from Catalog.
        </p>
      </div>

      {/* Banners Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 opacity-40" />
            <p className="text-xs sm:text-sm">No banners created yet</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 gap-2 text-xs sm:text-sm h-9"
              variant="outline"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Create Your First Banner</span>
              <span className="sm:hidden">Create Banner</span>
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Order</TableHead>
                <TableHead className="w-[100px]">Preview</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners
                .sort((a, b) => a.displayPriority - b.displayPriority)
                .map((banner, index) => (
                  <TableRow
                    key={banner.id}
                    className={cn(
                      "hover:bg-gray-50",
                      !banner.isActive && "opacity-60"
                    )}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleReorder(banner.id, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleReorder(banner.id, "down")}
                          disabled={index === banners.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden relative">
                        {banner.imageUrl ? (
                          <>
                            <img
                              src={banner.imageUrl}
                              alt={banner.headline}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display = "flex";
                              }}
                            />
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center hidden">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {banner.headline}
                        </div>
                        {banner.subtext && (
                          <div className="text-xs text-gray-500 mt-1">
                            {banner.subtext}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getBannerTypeBadge(banner.type)}
                        {banner.type === "product" && (
                          <Package className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[200px]">
                      <div className="truncate">
                        {getAssociatedProductsText(banner.associatedProducts)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          className={cn(
                            "text-xs",
                            banner.isActive
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          )}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {banner.isPrimary && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-gray-600">
                      {banner.displayPriority}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(banner.id)}
                          className="h-8"
                        >
                          {banner.isActive ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBannerId(banner.id)}
                          className="h-8"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-3 sm:p-4 space-y-3">
              {banners
                .sort((a, b) => a.displayPriority - b.displayPriority)
                .map((banner, index) => (
                  <div
                    key={banner.id}
                    className={cn(
                      "bg-white border border-gray-200 rounded-lg p-3 sm:p-4",
                      !banner.isActive && "opacity-60"
                    )}
                  >
                    {/* Header with Preview and Order */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-16 h-10 sm:w-20 sm:h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                        {banner.imageUrl ? (
                          <>
                            <img
                              src={banner.imageUrl}
                              alt={banner.headline}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display = "flex";
                              }}
                            />
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center hidden">
                              <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 leading-tight">
                            {banner.headline}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleReorder(banner.id, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleReorder(banner.id, "down")}
                              disabled={index === banners.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {banner.subtext && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {banner.subtext}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Type</p>
                        <div className="flex items-center gap-1.5">
                          {getBannerTypeBadge(banner.type)}
                          {banner.type === "product" && (
                            <Package className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Status</p>
                        <div className="flex flex-col gap-1">
                          <Badge
                            className={cn(
                              "text-[10px] sm:text-xs w-fit",
                              banner.isActive
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white"
                            )}
                          >
                            {banner.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {banner.isPrimary && (
                            <Badge className="bg-blue-500 text-white text-[10px] sm:text-xs w-fit">
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Priority</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {banner.displayPriority}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Products</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {getAssociatedProductsText(banner.associatedProducts)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(banner.id)}
                        className="h-8 flex-1 text-xs"
                      >
                        {banner.isActive ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBannerId(banner.id)}
                        className="h-8 flex-1 text-xs"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Banner Form Dialog */}
      <BannerForm
        banner={bannerToEdit}
        open={showCreateForm || !!editingBannerId}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog();
          }
        }}
        onSave={handleSaveBanner}
        onCancel={handleCloseDialog}
      />
    </div>
  );
}
