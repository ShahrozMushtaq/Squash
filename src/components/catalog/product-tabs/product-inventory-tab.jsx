"use client";

import { useState } from "react";
import { getProductById } from "@/lib/catalog/catalog-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product Inventory Tab
 * 
 * Owns: Inventory records, stock levels, reorder points, low stock thresholds
 * Does NOT mutate: Product details, Promotions, Activity (read-only)
 */
export function ProductInventoryTab({ productId, variantId = null }) {
  const product = getProductById(productId);
  const [inventoryData, setInventoryData] = useState(
    variantId
      ? product?.variants?.find((v) => v.id === variantId)?.inventory || product?.inventory
      : product?.inventory
  );

  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("increase");

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">
        Product not found
      </div>
    );
  }

  const getStockStatusBadge = (stockState) => {
    switch (stockState) {
      case "in_stock":
        return <Badge className="bg-green-500 text-white">Normal</Badge>;
      case "low_stock":
        return <Badge className="bg-yellow-500 text-white">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-gray-500 text-white">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const handleStockAdjustment = () => {
    if (!adjustmentReason.trim()) {
      alert("Please provide a reason for the adjustment");
      return;
    }

    const amount = parseFloat(adjustmentAmount) || 0;
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newStock =
      adjustmentType === "increase"
        ? inventoryData.currentStock + amount
        : Math.max(0, inventoryData.currentStock - amount);

    setInventoryData({
      ...inventoryData,
      currentStock: newStock,
      stockState:
        newStock === 0
          ? "out_of_stock"
          : newStock <= inventoryData.lowStockThreshold
          ? "low_stock"
          : "in_stock",
    });

    setAdjustmentAmount("");
    setAdjustmentReason("");
    alert("Stock adjusted successfully!");
  };

  const handleSave = () => {
    console.log("Saving inventory settings:", inventoryData);
    alert("Inventory settings saved!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track stock levels, reorder points, and manage inventory adjustments
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Current Stock Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Stock on Hand</Label>
            <div className="text-2xl font-bold text-gray-900">
              {inventoryData.currentStock}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Reserved Stock</Label>
            <div className="text-2xl font-bold text-gray-600">
              {inventoryData.reservedStock}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Available Stock</Label>
            <div className="text-2xl font-bold text-green-600">
              {inventoryData.currentStock - inventoryData.reservedStock}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Status</Label>
            <div className="mt-1">
              {getStockStatusBadge(inventoryData.stockState)}
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Alerts Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Reorder Alerts</h3>
            <p className="text-xs text-gray-500 mt-1">
              Configure thresholds for low stock alerts
            </p>
          </div>
          <Switch
            checked={inventoryData.isEnabled}
            onCheckedChange={(checked) =>
              setInventoryData({ ...inventoryData, isEnabled: checked })
            }
          />
        </div>

        {inventoryData.isEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="reorderPoint" className="text-sm font-semibold">
                Reorder Point
              </Label>
              <Input
                id="reorderPoint"
                type="number"
                value={inventoryData.reorderPoint}
                onChange={(e) =>
                  setInventoryData({
                    ...inventoryData,
                    reorderPoint: parseInt(e.target.value) || 0,
                  })
                }
                className="h-9"
              />
              <p className="text-xs text-gray-500">
                Alert when stock falls below this level
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold" className="text-sm font-semibold">
                Low Stock Threshold
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={inventoryData.lowStockThreshold}
                onChange={(e) =>
                  setInventoryData({
                    ...inventoryData,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  })
                }
                className="h-9"
              />
              <p className="text-xs text-gray-500">
                Mark as &quot;Low Stock&quot; when at or below this level
              </p>
            </div>
          </div>
        )}

        {inventoryData.currentStock <= inventoryData.lowStockThreshold &&
          inventoryData.currentStock > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Low stock alert: Current stock ({inventoryData.currentStock}) is at or below
                threshold ({inventoryData.lowStockThreshold})
              </p>
            </div>
          )}

        {inventoryData.currentStock === 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">Out of stock - immediate restocking required</p>
          </div>
        )}
      </div>

      {/* Stock Adjustments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Stock Adjustments</h3>
        <p className="text-xs text-gray-500">
          Manually adjust stock levels. All adjustments require a reason.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={setAdjustmentType}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">Increase Stock</SelectItem>
                <SelectItem value="decrease">Decrease Stock</SelectItem>
                <SelectItem value="writeoff">Write Off (Damaged/Lost)</SelectItem>
                <SelectItem value="correction">Audit Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustmentAmount" className="text-sm font-semibold">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="adjustmentAmount"
              type="number"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
              placeholder="Enter amount"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustmentReason" className="text-sm font-semibold">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Input
              id="adjustmentReason"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              placeholder="e.g., Restocking, Damage"
              className="h-9"
            />
          </div>
        </div>

        <Button onClick={handleStockAdjustment} className="gap-2">
          <Plus className="h-4 w-4" />
          Apply Adjustment
        </Button>
      </div>

      {/* Variants Inventory Table (if product has variants) */}
      {product.hasVariants && !variantId && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Variant Inventory</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Reorder Point</TableHead>
                <TableHead className="text-center">Low Stock Threshold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants?.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell className="text-center">
                    {variant.inventory.currentStock}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStockStatusBadge(variant.inventory.stockState)}
                  </TableCell>
                  <TableCell className="text-center">
                    {variant.inventory.reorderPoint}
                  </TableCell>
                  <TableCell className="text-center">
                    {variant.inventory.lowStockThreshold}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
