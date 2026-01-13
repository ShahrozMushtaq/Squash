"use client";

import { useState } from "react";
import { PICKUPS_DATA } from "@/lib/sales/sales-data";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Eye, CheckCircle, XCircle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pickups View
 * Manage pickup states for externally-originated purchases
 */
export function PickupsView() {
  const [pickups, setPickups] = useState([...PICKUPS_DATA]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPickup, setSelectedPickup] = useState(null);

  const filteredPickups = pickups.filter((pickup) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesId = pickup.id.toLowerCase().includes(query);
      const matchesTransaction = pickup.transactionId.toLowerCase().includes(query);
      const matchesBuyer = pickup.buyerName?.toLowerCase().includes(query);
      if (!matchesId && !matchesTransaction && !matchesBuyer) {
        return false;
      }
    }

    // Status filter
    if (selectedStatus !== "All" && pickup.status !== selectedStatus) {
      return false;
    }

    return true;
  });

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending Pickup</Badge>;
      case "picked_up":
        return <Badge className="bg-green-500 text-white">Picked Up</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const handleMarkPickedUp = (pickupId) => {
    if (confirm("Mark this pickup as complete?")) {
      setPickups(
        pickups.map((p) =>
          p.id === pickupId
            ? {
                ...p,
                status: "picked_up",
                pickedUpAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      alert("Pickup marked as complete!");
    }
  };

  const handleCancelPickup = (pickupId) => {
    if (confirm("Cancel this pickup? This action may require a refund.")) {
      setPickups(
        pickups.map((p) =>
          p.id === pickupId
            ? {
                ...p,
                status: "cancelled",
                cancelledAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      alert("Pickup cancelled!");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search pickups..."
              className="pl-9 h-9 text-sm border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Pickup</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pickups Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {filteredPickups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 mb-2 opacity-40" />
            <p className="text-xs sm:text-sm">No pickups found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Pickup ID</TableHead>
                <TableHead className="w-[120px]">Transaction ID</TableHead>
                <TableHead className="w-[180px]">Pickup Date</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPickups.map((pickup) => (
                <TableRow
                  key={pickup.id}
                  className={cn(
                    "hover:bg-gray-50",
                    pickup.status === "cancelled" && "opacity-60"
                  )}
                >
                  <TableCell className="font-medium text-gray-900">
                    {pickup.id}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {pickup.transactionId}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(pickup.dateTime)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{pickup.buyerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {pickup.buyerEmail}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Badge
                          className={cn(
                            "text-xs",
                            pickup.buyerType === "member"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-500 text-white"
                          )}
                        >
                          {pickup.buyerType === "member" ? "Member" : "Guest"}
                        </Badge>
                        {pickup.buyerReference && (
                          <span className="text-gray-400">{pickup.buyerReference}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {pickup.lineItems.length} item(s)
                      {pickup.lineItems.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {pickup.lineItems[0].productName}
                          {pickup.lineItems.length > 1 && ` +${pickup.lineItems.length - 1} more`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(pickup.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPickup(pickup)}
                            className="h-8"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Pickup Details: {pickup.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            {/* Pickup Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Pickup Date</p>
                                <p className="text-sm font-medium">
                                  {formatDateTime(pickup.dateTime)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                <div>{getStatusBadge(pickup.status)}</div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Buyer</p>
                                <p className="text-sm font-medium">{pickup.buyerName}</p>
                                <p className="text-xs text-gray-500">{pickup.buyerEmail}</p>
                                <p className="text-xs text-gray-500">{pickup.buyerPhone}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Transaction</p>
                                <p className="text-sm font-medium">{pickup.transactionId}</p>
                              </div>
                            </div>

                            {/* Line Items */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Items to Pick Up</h4>
                              <div className="space-y-2">
                                {pickup.lineItems.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{item.productName}</p>
                                      {item.variantName && (
                                        <p className="text-xs text-gray-500">
                                          Variant: {item.variantName}
                                        </p>
                                      )}
                                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Notes */}
                            {pickup.notes && (
                              <div>
                                <h4 className="text-sm font-semibold mb-2">Notes</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  {pickup.notes}
                                </p>
                              </div>
                            )}

                            {/* Timestamps */}
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Created: {formatDateTime(pickup.createdAt)}</p>
                              <p>Updated: {formatDateTime(pickup.updatedAt)}</p>
                              {pickup.pickedUpAt && (
                                <p>Picked Up: {formatDateTime(pickup.pickedUpAt)}</p>
                              )}
                              {pickup.cancelledAt && (
                                <p>Cancelled: {formatDateTime(pickup.cancelledAt)}</p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {pickup.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkPickedUp(pickup.id)}
                            className="h-8 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelPickup(pickup.id)}
                            className="h-8 text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-2 sm:p-4 space-y-2 sm:space-y-3">
              {filteredPickups.map((pickup) => (
                <div
                  key={pickup.id}
                  className={cn(
                    "bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow",
                    pickup.status === "cancelled" && "opacity-60"
                  )}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {pickup.id}
                        </h3>
                        {getStatusBadge(pickup.status)}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {formatDateTime(pickup.dateTime)}
                      </p>
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-0.5">
                      {pickup.buyerName}
                    </p>
                    <p className="text-[11px] text-gray-500 mb-1">
                      {pickup.buyerEmail}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0.5",
                          pickup.buyerType === "member"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-500 text-white"
                        )}
                      >
                        {pickup.buyerType === "member" ? "Member" : "Guest"}
                      </Badge>
                      {pickup.buyerReference && (
                        <span className="text-[11px] text-gray-500">
                          {pickup.buyerReference}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-500 mb-0.5">Transaction</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pickup.transactionId}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-[11px] text-gray-500 mb-0.5">Items</p>
                        <p className="text-sm font-medium text-gray-900">
                          {pickup.lineItems.length} item(s)
                        </p>
                      </div>
                    </div>
                    {pickup.lineItems.length > 0 && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {pickup.lineItems[0].productName}
                        {pickup.lineItems.length > 1 && ` +${pickup.lineItems.length - 1} more`}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2 sm:pt-3 border-t border-gray-100">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPickup(pickup)}
                          className="w-full h-9 text-xs font-medium"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle className="text-base sm:text-lg">Pickup Details: {pickup.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                          {/* Pickup Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Pickup Date</p>
                              <p className="text-xs sm:text-sm font-medium">
                                {formatDateTime(pickup.dateTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Status</p>
                              <div>{getStatusBadge(pickup.status)}</div>
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Buyer</p>
                              <p className="text-xs sm:text-sm font-medium">{pickup.buyerName}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">{pickup.buyerEmail}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">{pickup.buyerPhone}</p>
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Transaction</p>
                              <p className="text-xs sm:text-sm font-medium">{pickup.transactionId}</p>
                            </div>
                          </div>

                          {/* Line Items */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold mb-2">Items to Pick Up</h4>
                            <div className="space-y-2">
                              {pickup.lineItems.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium truncate">{item.productName}</p>
                                    {item.variantName && (
                                      <p className="text-[10px] sm:text-xs text-gray-500">
                                        Variant: {item.variantName}
                                      </p>
                                    )}
                                    <p className="text-[10px] sm:text-xs text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          {pickup.notes && (
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold mb-2">Notes</h4>
                              <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                                {pickup.notes}
                              </p>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="text-[10px] sm:text-xs text-gray-500 space-y-1">
                            <p>Created: {formatDateTime(pickup.createdAt)}</p>
                            <p>Updated: {formatDateTime(pickup.updatedAt)}</p>
                            {pickup.pickedUpAt && (
                              <p>Picked Up: {formatDateTime(pickup.pickedUpAt)}</p>
                            )}
                            {pickup.cancelledAt && (
                              <p>Cancelled: {formatDateTime(pickup.cancelledAt)}</p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {pickup.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkPickedUp(pickup.id)}
                          className="flex-1 h-9 text-xs font-medium text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelPickup(pickup.id)}
                          className="flex-1 h-9 text-xs font-medium text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-[10px] sm:text-xs text-gray-500">
          Pickups apply only to externally-originated purchases. Checkout sales never create pickup states.
        </p>
      </div>
    </div>
  );
}
