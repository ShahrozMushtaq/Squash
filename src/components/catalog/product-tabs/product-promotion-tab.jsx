"use client";

import { useState } from "react";
import { getProductById } from "@/lib/catalog/catalog-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Tag } from "lucide-react";

/**
 * Product Promotion Tab
 * 
 * Owns: Visibility promotions (promote/unpromote, priority, promo label)
 * Does NOT mutate: Product details, Inventory, Activity (read-only)
 */
export function ProductPromotionTab({ productId, variantId = null }) {
  const product = getProductById(productId);
  const [promotionData, setPromotionData] = useState(product?.promotion || {
    isPromoted: false,
    priority: 0,
    promoLabel: null,
    startDate: null,
    endDate: null,
    isActive: false,
  });

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">
        Product not found
      </div>
    );
  }

  const handleSave = () => {
    console.log("Saving promotion settings:", promotionData);
    alert("Promotion settings saved!");
  };

  const promoLabelOptions = ["New", "Popular", "Staff Pick", "Featured", "Best Seller"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Promotion</h2>
          <p className="text-sm text-gray-600 mt-1">
            Control product visibility eligibility for banners and promotions
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Note: Promotions affect visibility only, not price or inventory
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Promotion Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold">Promote Product</Label>
            <p className="text-xs text-gray-500">
              Enable promotion to make this product eligible for banner selection
            </p>
          </div>
          <Switch
            checked={promotionData.isPromoted}
            onCheckedChange={(checked) =>
              setPromotionData({ ...promotionData, isPromoted: checked, isActive: checked })
            }
          />
        </div>

        {promotionData.isPromoted && (
          <>
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="promoLabel" className="text-sm font-semibold">
                    Promo Label
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {promoLabelOptions.map((label) => (
                      <Badge
                        key={label}
                        variant={promotionData.promoLabel === label ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer",
                          promotionData.promoLabel === label &&
                            "bg-blue-500 text-white hover:bg-blue-600"
                        )}
                        onClick={() =>
                          setPromotionData({
                            ...promotionData,
                            promoLabel: promotionData.promoLabel === label ? null : label,
                          })
                        }
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Select a label to display (e.g., &quot;New&quot;, &quot;Staff Pick&quot;)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-semibold">
                    Promotion Priority
                  </Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    value={promotionData.priority}
                    onChange={(e) =>
                      setPromotionData({
                        ...promotionData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-9"
                  />
                  <p className="text-xs text-gray-500">
                    Higher numbers = more prominent display (0-10)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold">
                    Start Date (Optional)
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={
                      promotionData.startDate
                        ? new Date(promotionData.startDate).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setPromotionData({
                        ...promotionData,
                        startDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
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
                    value={
                      promotionData.endDate
                        ? new Date(promotionData.endDate).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setPromotionData({
                        ...promotionData,
                        endDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Current Promotion Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Promotion Active</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This product is currently promoted
                    {promotionData.promoLabel && ` with label: "${promotionData.promoLabel}"`}
                    {promotionData.priority > 0 && ` (Priority: ${promotionData.priority})`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {!promotionData.isPromoted && (
          <div className="pt-4 border-t border-gray-200">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                This product is not currently promoted
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Enable promotion above to make it eligible for banner selection
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
