"use client";

import { useState } from "react";
import {
  TAX_RULES,
  INVENTORY_DEFAULTS,
  REORDER_ALERT_DEFAULTS,
  DISCOUNT_RULES,
  REFUND_PERMISSIONS,
  ROLE_PERMISSIONS,
  SETTINGS_CHANGE_LOG,
} from "@/lib/settings/settings-data";
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
import { Save, Shield, AlertTriangle, History } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Settings Configuration View
 * Manager/Owner only - All changes logged
 */
export function SettingsConfigView() {
  const [taxRules, setTaxRules] = useState(TAX_RULES);
  const [inventoryDefaults, setInventoryDefaults] = useState(INVENTORY_DEFAULTS);
  const [reorderDefaults, setReorderDefaults] = useState(REORDER_ALERT_DEFAULTS);
  const [discountRules, setDiscountRules] = useState(DISCOUNT_RULES);
  const [refundPermissions, setRefundPermissions] = useState(REFUND_PERMISSIONS);
  const [showChangeLog, setShowChangeLog] = useState(false);

  const handleSave = (section) => {
    alert(`${section} settings saved! Changes will be logged.`);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Access Warning */}
      <div className="p-2 sm:p-3 border-b border-yellow-200 bg-yellow-50">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />
          <p className="text-[10px] sm:text-xs text-yellow-800">
            <strong>Manager/Owner Access Only:</strong> All changes to settings are logged and auditable.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-5">
        {/* Tax Rules */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Tax Rules</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Configure tax calculation and application rules
              </p>
            </div>
            <Button onClick={() => handleSave("Tax Rules")} size="sm" className="gap-2 h-8 w-full sm:w-auto text-xs">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-900">Enable Tax</Label>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Apply tax to transactions</p>
              </div>
              <Switch
                checked={taxRules.enabled}
                onCheckedChange={(checked) =>
                  setTaxRules({ ...taxRules, enabled: checked })
                }
              />
            </div>
            {taxRules.enabled && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={taxRules.rate}
                      onChange={(e) =>
                        setTaxRules({ ...taxRules, rate: parseFloat(e.target.value) || 0 })
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700">Applies To</Label>
                    <Select
                      value={taxRules.appliesTo[0]}
                      onValueChange={(value) =>
                        setTaxRules({ ...taxRules, appliesTo: [value] })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="members_only">Members Only</SelectItem>
                        <SelectItem value="guests_only">Guests Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Last updated: {formatDateTime(taxRules.lastUpdated)} by {taxRules.updatedBy}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Inventory Defaults */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Inventory Defaults</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Set default values for new inventory records
              </p>
            </div>
            <Button onClick={() => handleSave("Inventory Defaults")} size="sm" className="gap-2 h-8 w-full sm:w-auto text-xs">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Default Reorder Point</Label>
                <Input
                  type="number"
                  value={inventoryDefaults.defaultReorderPoint}
                  onChange={(e) =>
                    setInventoryDefaults({
                      ...inventoryDefaults,
                      defaultReorderPoint: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Default Low Stock Threshold</Label>
                <Input
                  type="number"
                  value={inventoryDefaults.defaultLowStockThreshold}
                  onChange={(e) =>
                    setInventoryDefaults({
                      ...inventoryDefaults,
                      defaultLowStockThreshold: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-900">Require Reason for Adjustment</Label>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">All inventory adjustments must include a reason</p>
              </div>
              <Switch
                checked={inventoryDefaults.requireReasonForAdjustment}
                onCheckedChange={(checked) =>
                  setInventoryDefaults({
                    ...inventoryDefaults,
                    requireReasonForAdjustment: checked,
                  })
                }
              />
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 pt-2 border-t border-gray-100">
              Last updated: {formatDateTime(inventoryDefaults.lastUpdated)} by{" "}
              {inventoryDefaults.updatedBy}
            </div>
          </div>
        </div>

        {/* Reorder Alert Defaults */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Reorder Alert Defaults</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Configure default reorder alert settings
              </p>
            </div>
            <Button onClick={() => handleSave("Reorder Alert Defaults")} size="sm" className="gap-2 h-8 w-full sm:w-auto text-xs">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-900">Enable Reorder Alerts</Label>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Automatically alert when stock is low</p>
              </div>
              <Switch
                checked={reorderDefaults.enabled}
                onCheckedChange={(checked) =>
                  setReorderDefaults({ ...reorderDefaults, enabled: checked })
                }
              />
            </div>
            {reorderDefaults.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Default Reorder Point</Label>
                  <Input
                    type="number"
                    value={reorderDefaults.defaultReorderPoint}
                    onChange={(e) =>
                      setReorderDefaults({
                        ...reorderDefaults,
                        defaultReorderPoint: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Default Low Stock Threshold</Label>
                  <Input
                    type="number"
                    value={reorderDefaults.defaultLowStockThreshold}
                    onChange={(e) =>
                      setReorderDefaults({
                        ...reorderDefaults,
                        defaultLowStockThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}
            <div className="text-[10px] sm:text-xs text-gray-500 pt-2 border-t border-gray-100">
              Last updated: {formatDateTime(reorderDefaults.lastUpdated)} by{" "}
              {reorderDefaults.updatedBy}
            </div>
          </div>
        </div>

        {/* Discount Rules */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Discount Rules</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Configure discount policies and limits
              </p>
            </div>
            <Button onClick={() => handleSave("Discount Rules")} size="sm" className="gap-2 h-8 w-full sm:w-auto text-xs">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-xs sm:text-sm font-medium text-gray-900">Member Discount Enabled</Label>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Apply automatic discount to members</p>
              </div>
              <Switch
                checked={discountRules.memberDiscountEnabled}
                onCheckedChange={(checked) =>
                  setDiscountRules({ ...discountRules, memberDiscountEnabled: checked })
                }
              />
            </div>
            {discountRules.memberDiscountEnabled && (
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Member Discount (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={discountRules.memberDiscountPercentage}
                  onChange={(e) =>
                    setDiscountRules({
                      ...discountRules,
                      memberDiscountPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-9"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Max Manual Discount (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={discountRules.maxManualDiscountPercentage}
                  onChange={(e) =>
                    setDiscountRules({
                      ...discountRules,
                      maxManualDiscountPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Require Approval Over (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={discountRules.requireApprovalForDiscountsOver}
                  onChange={(e) =>
                    setDiscountRules({
                      ...discountRules,
                      requireApprovalForDiscountsOver: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 pt-2 border-t border-gray-100">
              Last updated: {formatDateTime(discountRules.lastUpdated)} by{" "}
              {discountRules.updatedBy}
            </div>
          </div>
        </div>

        {/* Refund Permissions */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Refund Permissions</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Control who can issue refunds and under what conditions
              </p>
            </div>
            <Button onClick={() => handleSave("Refund Permissions")} size="sm" className="gap-2 h-8 w-full sm:w-auto text-xs">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-medium text-gray-700">Allowed Roles</Label>
              <div className="flex flex-wrap gap-2">
                {["staff", "manager", "owner"].map((role) => (
                  <Badge
                    key={role}
                    variant={
                      refundPermissions.allowedRoles.includes(role) ? "default" : "outline"
                    }
                    className={cn(
                      "cursor-pointer text-[10px] sm:text-xs",
                      refundPermissions.allowedRoles.includes(role) &&
                        "bg-blue-500 text-white"
                    )}
                    onClick={() => {
                      const current = refundPermissions.allowedRoles;
                      if (current.includes(role)) {
                        setRefundPermissions({
                          ...refundPermissions,
                          allowedRoles: current.filter((r) => r !== role),
                        });
                      } else {
                        setRefundPermissions({
                          ...refundPermissions,
                          allowedRoles: [...current, role],
                        });
                      }
                    }}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-medium text-gray-700">Max Refund Without Approval ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={refundPermissions.maxRefundAmountWithoutApproval}
                  onChange={(e) =>
                    setRefundPermissions({
                      ...refundPermissions,
                      maxRefundAmountWithoutApproval: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs sm:text-sm font-medium text-gray-900">Require Reason</Label>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">All refunds must include a reason</p>
                </div>
                <Switch
                  checked={refundPermissions.requireReason}
                  onCheckedChange={(checked) =>
                    setRefundPermissions({ ...refundPermissions, requireReason: checked })
                  }
                />
              </div>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 pt-2 border-t border-gray-100">
              Last updated: {formatDateTime(refundPermissions.lastUpdated)} by{" "}
              {refundPermissions.updatedBy}
            </div>
          </div>
        </div>

        {/* Role-Based Permissions */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Role-Based Permissions</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Configure access levels for different user roles
              </p>
            </div>
            <Button onClick={() => handleSave("Role-Based Permissions")} size="sm" className="gap-2 h-8 w-full sm:w-auto text-xs">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-600">Permission</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-600">Staff</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-600">Manager</TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-600">Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(ROLE_PERMISSIONS.staff).map((permission) => (
                    <TableRow key={permission} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-sm capitalize">
                        {permission.replace(/([A-Z])/g, " $1").trim()}
                      </TableCell>
                      <TableCell className="text-center">
                        {ROLE_PERMISSIONS.staff[permission] ? (
                          <Badge className="bg-green-500 text-white text-xs">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-300 text-gray-600 text-xs">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {ROLE_PERMISSIONS.manager[permission] ? (
                          <Badge className="bg-green-500 text-white text-xs">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-300 text-gray-600 text-xs">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {ROLE_PERMISSIONS.owner[permission] ? (
                          <Badge className="bg-green-500 text-white text-xs">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-300 text-gray-600 text-xs">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-2">
              {Object.keys(ROLE_PERMISSIONS.staff).map((permission) => (
                <div key={permission} className="bg-white border border-gray-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2 capitalize">
                    {permission.replace(/([A-Z])/g, " $1").trim()}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 mb-1">Staff</p>
                      {ROLE_PERMISSIONS.staff[permission] ? (
                        <Badge className="bg-green-500 text-white text-[10px]">Yes</Badge>
                      ) : (
                        <Badge className="bg-gray-300 text-gray-600 text-[10px]">No</Badge>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 mb-1">Manager</p>
                      {ROLE_PERMISSIONS.manager[permission] ? (
                        <Badge className="bg-green-500 text-white text-[10px]">Yes</Badge>
                      ) : (
                        <Badge className="bg-gray-300 text-gray-600 text-[10px]">No</Badge>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 mb-1">Owner</p>
                      {ROLE_PERMISSIONS.owner[permission] ? (
                        <Badge className="bg-green-500 text-white text-[10px]">Yes</Badge>
                      ) : (
                        <Badge className="bg-gray-300 text-gray-600 text-[10px]">No</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Last updated: {formatDateTime(ROLE_PERMISSIONS.lastUpdated)} by{" "}
            {ROLE_PERMISSIONS.updatedBy}
          </div>
        </div>

        {/* Change Log */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Settings Change Log</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                Audit trail of all settings changes
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangeLog(!showChangeLog)}
              className="gap-2 h-8 w-full sm:w-auto text-xs"
            >
              <History className="h-3.5 w-3.5" />
              {showChangeLog ? "Hide" : "Show"} Log
            </Button>
          </div>
          {showChangeLog && (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-600">Date & Time</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">Setting</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">Field</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">Old Value</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">New Value</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">Changed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SETTINGS_CHANGE_LOG.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50/50">
                        <TableCell className="text-xs text-gray-600">
                          {formatDateTime(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{log.setting}</TableCell>
                        <TableCell className="text-xs text-gray-600">{log.field}</TableCell>
                        <TableCell className="text-xs text-gray-500">{log.oldValue}</TableCell>
                        <TableCell className="text-xs font-medium text-green-600">
                          {log.newValue}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500 text-white text-xs">{log.changedBy}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2">
                {SETTINGS_CHANGE_LOG.map((log) => (
                  <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-gray-900">{log.setting}</h4>
                      <Badge className="bg-blue-500 text-white text-[10px]">{log.changedBy}</Badge>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">{formatDateTime(log.timestamp)}</p>
                    <div className="space-y-1 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Field</p>
                        <p className="text-xs text-gray-700">{log.field}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500 mb-0.5">Old Value</p>
                          <p className="text-xs text-gray-500 line-through">{log.oldValue}</p>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500 mb-0.5">New Value</p>
                          <p className="text-xs font-medium text-green-600">{log.newValue}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
