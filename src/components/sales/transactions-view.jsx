"use client";

import { useState } from "react";
import { TRANSACTIONS_DATA } from "@/lib/sales/sales-data";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Eye, Receipt, CreditCard, DollarSign, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Transactions View
 * Read-only view of all transactions
 */
export function TransactionsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All");
  const [selectedBuyerType, setSelectedBuyerType] = useState("All");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const filteredTransactions = TRANSACTIONS_DATA.filter((transaction) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesId = transaction.id.toLowerCase().includes(query);
      const matchesBuyer = transaction.buyerName?.toLowerCase().includes(query);
      const matchesProducts = transaction.lineItems.some((item) =>
        item.productName.toLowerCase().includes(query)
      );
      if (!matchesId && !matchesBuyer && !matchesProducts) {
        return false;
      }
    }

    // Payment method filter
    if (selectedPaymentMethod !== "All" && transaction.paymentMethod !== selectedPaymentMethod) {
      return false;
    }

    // Buyer type filter
    if (selectedBuyerType !== "All" && transaction.buyerType !== selectedBuyerType) {
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

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getPaymentMethodIcon = (method) => {
    return method === "card" ? (
      <CreditCard className="h-3 w-3" />
    ) : (
      <DollarSign className="h-3 w-3" />
    );
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
              placeholder="Search transactions..."
              className="pl-9 h-9 text-sm border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm border-gray-300">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedBuyerType} onValueChange={setSelectedBuyerType}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm border-gray-300">
                <SelectValue placeholder="Buyer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <Receipt className="h-10 w-10 sm:h-12 sm:w-12 mb-2 opacity-40" />
            <p className="text-xs sm:text-sm">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Transaction ID</TableHead>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Payment</TableHead>
                <TableHead className="text-center w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {transaction.id}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(transaction.dateTime)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.buyerName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Badge
                          className={cn(
                            "text-xs",
                            transaction.buyerType === "member"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-500 text-white"
                          )}
                        >
                          {transaction.buyerType === "member" ? "Member" : "Guest"}
                        </Badge>
                        {transaction.buyerReference && (
                          <span className="text-gray-400">
                            {transaction.buyerReference}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {transaction.lineItems.length} item(s)
                      {transaction.lineItems.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.lineItems[0].productName}
                          {transaction.lineItems.length > 1 && ` +${transaction.lineItems.length - 1} more`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {formatCurrency(transaction.subtotal)}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {formatCurrency(transaction.tax)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900">
                    {formatCurrency(transaction.total)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="text-xs text-gray-600 capitalize">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="h-8"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Transaction Details: {transaction.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          {/* Transaction Info */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                              <p className="text-sm font-medium">
                                {formatDateTime(transaction.dateTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <Badge className="bg-green-500 text-white">
                                {transaction.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Buyer</p>
                              <p className="text-sm font-medium">{transaction.buyerName}</p>
                              <p className="text-xs text-gray-500">
                                {transaction.buyerType === "member" ? "Member" : "Guest"}
                                {transaction.buyerReference && ` • ${transaction.buyerReference}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                              <p className="text-sm font-medium capitalize">
                                {transaction.paymentMethod}
                              </p>
                            </div>
                            {transaction.pickupStatus && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Pickup Status</p>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    transaction.pickupStatus === "pending" && "bg-yellow-500 text-white",
                                    transaction.pickupStatus === "picked_up" && "bg-green-500 text-white",
                                    transaction.pickupStatus === "cancelled" && "bg-red-500 text-white"
                                  )}
                                >
                                  {transaction.pickupStatus === "pending" && "Pending Pickup"}
                                  {transaction.pickupStatus === "picked_up" && "Picked Up"}
                                  {transaction.pickupStatus === "cancelled" && "Cancelled"}
                                </Badge>
                                {transaction.pickupId && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Pickup ID: {transaction.pickupId}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Line Items */}
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Line Items</h4>
                            <div className="space-y-2">
                              {transaction.lineItems.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{item.productName}</p>
                                    {item.variantName && (
                                      <p className="text-xs text-gray-500">
                                        Variant: {item.variantName}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium">
                                    {formatCurrency(item.subtotal)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Totals */}
                          <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-medium">{formatCurrency(transaction.subtotal)}</span>
                            </div>
                            {transaction.discounts && transaction.discounts.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discounts</span>
                                <span className="text-green-600">
                                  -{formatCurrency(transaction.discountsTotal || 0)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tax</span>
                              <span className="font-medium">{formatCurrency(transaction.tax)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                              <span>Total</span>
                              <span>{formatCurrency(transaction.total)}</span>
                            </div>
                          </div>

                          {/* Refund Section (Permission-based) */}
                          {transaction.status === "completed" && (
                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">Refund</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Issue refund for this transaction (permission required)
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Issue refund for ${transaction.id}? Amount: ${formatCurrency(transaction.total)}`)) {
                                      alert("Refund functionality requires backend integration and proper permissions.");
                                    }
                                  }}
                                  className="gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  Issue Refund
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-2 sm:p-4 space-y-2 sm:space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {transaction.id}
                        </h3>
                        <Badge
                          className={cn(
                            "text-[10px] px-1.5 py-0.5",
                            transaction.buyerType === "member"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-500 text-white"
                          )}
                        >
                          {transaction.buyerType === "member" ? "Member" : "Guest"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {formatDateTime(transaction.dateTime)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 bg-gray-50 px-2 py-1 rounded-md">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="text-[10px] text-gray-700 capitalize font-medium">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-0.5">
                      {transaction.buyerName}
                    </p>
                    {transaction.buyerReference && (
                      <p className="text-[11px] text-gray-500">
                        {transaction.buyerReference}
                      </p>
                    )}
                  </div>

                  {/* Items & Totals */}
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-500 mb-0.5">Items</p>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.lineItems.length} item(s)
                        </p>
                        {transaction.lineItems.length > 0 && (
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {transaction.lineItems[0].productName}
                            {transaction.lineItems.length > 1 && ` +${transaction.lineItems.length - 1} more`}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-[11px] text-gray-500 mb-0.5">Total</p>
                        <p className="text-base font-bold text-gray-900">
                          {formatCurrency(transaction.total)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-50">
                      <span>Subtotal: {formatCurrency(transaction.subtotal)}</span>
                      <span>Tax: {formatCurrency(transaction.tax)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 sm:pt-3 border-t border-gray-100">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                          className="w-full h-9 text-xs font-medium"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle className="text-base sm:text-lg">Transaction Details: {transaction.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                          {/* Transaction Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Date & Time</p>
                              <p className="text-xs sm:text-sm font-medium">
                                {formatDateTime(transaction.dateTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Status</p>
                              <Badge className="bg-green-500 text-white text-[10px] sm:text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Buyer</p>
                              <p className="text-xs sm:text-sm font-medium">{transaction.buyerName}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {transaction.buyerType === "member" ? "Member" : "Guest"}
                                {transaction.buyerReference && ` • ${transaction.buyerReference}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Payment Method</p>
                              <p className="text-xs sm:text-sm font-medium capitalize">
                                {transaction.paymentMethod}
                              </p>
                            </div>
                            {transaction.pickupStatus && (
                              <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Pickup Status</p>
                                <Badge
                                  className={cn(
                                    "text-[10px] sm:text-xs",
                                    transaction.pickupStatus === "pending" && "bg-yellow-500 text-white",
                                    transaction.pickupStatus === "picked_up" && "bg-green-500 text-white",
                                    transaction.pickupStatus === "cancelled" && "bg-red-500 text-white"
                                  )}
                                >
                                  {transaction.pickupStatus === "pending" && "Pending Pickup"}
                                  {transaction.pickupStatus === "picked_up" && "Picked Up"}
                                  {transaction.pickupStatus === "cancelled" && "Cancelled"}
                                </Badge>
                                {transaction.pickupId && (
                                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                    Pickup ID: {transaction.pickupId}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Line Items */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold mb-2">Line Items</h4>
                            <div className="space-y-2">
                              {transaction.lineItems.map((item, index) => (
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
                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                                    </p>
                                  </div>
                                  <p className="text-xs sm:text-sm font-medium ml-2 shrink-0">
                                    {formatCurrency(item.subtotal)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Totals */}
                          <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-medium">{formatCurrency(transaction.subtotal)}</span>
                            </div>
                            {transaction.discounts && transaction.discounts.length > 0 && (
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Discounts</span>
                                <span className="text-green-600">
                                  -{formatCurrency(transaction.discountsTotal || 0)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Tax</span>
                              <span className="font-medium">{formatCurrency(transaction.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm sm:text-lg font-bold border-t border-gray-200 pt-2">
                              <span>Total</span>
                              <span>{formatCurrency(transaction.total)}</span>
                            </div>
                          </div>

                          {/* Refund Section (Permission-based) */}
                          {transaction.status === "completed" && (
                            <div className="border-t border-gray-200 pt-3 sm:pt-4">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold text-gray-900">Refund</p>
                                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                    Issue refund for this transaction (permission required)
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Issue refund for ${transaction.id}? Amount: ${formatCurrency(transaction.total)}`)) {
                                      alert("Refund functionality requires backend integration and proper permissions.");
                                    }
                                  }}
                                  className="gap-2 text-red-600 hover:text-red-700 hover:border-red-300 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  Issue Refund
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
          Transactions are append-only and auditable. All transactions are linked to inventory changes.
        </p>
      </div>
    </div>
  );
}
