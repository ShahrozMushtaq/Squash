"use client";

import { useState } from "react";
import {
  SALES_BY_DATE,
  SALES_BY_CATEGORY,
  TOP_SELLING_PRODUCTS,
  INVENTORY_MOVEMENT,
  MEMBER_VS_GUEST_SPEND,
} from "@/lib/settings/reports-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Calendar, TrendingUp, Package, Users } from "lucide-react";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { cn } from "@/lib/utils";

/**
 * Reports View
 * Read-only reports with date range filtering and CSV export
 */
export function ReportsView() {
  const [dateRange, setDateRange] = useState({
    from: new Date("2024-01-16"),
    to: new Date("2024-01-20"),
  });
  const [selectedReport, setSelectedReport] = useState("sales-by-date");

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExportCSV = () => {
    alert("CSV export functionality requires backend integration.");
  };

  const filteredSalesByDate = SALES_BY_DATE.filter((item) => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const itemDate = new Date(item.date);
    const start = new Date(dateRange.from);
    const end = new Date(dateRange.to);
    return itemDate >= start && itemDate <= end;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Date Range Filter */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Label className="text-xs sm:text-sm font-semibold">Date Range</Label>
          </div>
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
            className="flex-1 sm:flex-initial"
          />
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 w-full sm:w-auto h-9 text-xs sm:text-sm">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Report Selector */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <Select value={selectedReport} onValueChange={setSelectedReport}>
          <SelectTrigger className="w-full sm:w-[250px] h-9 text-sm">
            <SelectValue placeholder="Select Report" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales-by-date">Sales by Date</SelectItem>
            <SelectItem value="sales-by-category">Sales by Category</SelectItem>
            <SelectItem value="top-selling">Top Selling Products</SelectItem>
            <SelectItem value="inventory-movement">Inventory Movement</SelectItem>
            <SelectItem value="member-vs-guest">Member vs Guest Spend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-4">
        {/* Sales by Date */}
        {selectedReport === "sales-by-date" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sales by Date</h3>
              <Badge className="bg-blue-500 text-white text-[10px] sm:text-xs">
                {filteredSalesByDate.length} days
              </Badge>
            </div>
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-right">Member Spend</TableHead>
                  <TableHead className="text-right">Guest Spend</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalesByDate.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
                    <TableCell className="text-center">{item.transactions}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.memberSpend)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.guestSpend)}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-center">
                    {filteredSalesByDate.reduce((sum, item) => sum + item.transactions, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      filteredSalesByDate.reduce((sum, item) => sum + item.memberSpend, 0)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      filteredSalesByDate.reduce((sum, item) => sum + item.guestSpend, 0)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      filteredSalesByDate.reduce((sum, item) => sum + item.total, 0)
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2">
                {filteredSalesByDate.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{formatDate(item.date)}</h4>
                      <Badge className="bg-blue-500 text-white text-[10px]">{item.transactions} txns</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Member</p>
                        <p className="text-xs font-medium text-gray-900">{formatCurrency(item.memberSpend)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Guest</p>
                        <p className="text-xs font-medium text-gray-900">{formatCurrency(item.guestSpend)}</p>
                      </div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Total</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Total Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">Total</h4>
                    <Badge className="bg-blue-500 text-white text-[10px]">
                      {filteredSalesByDate.reduce((sum, item) => sum + item.transactions, 0)} txns
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Member</p>
                      <p className="text-xs font-medium text-gray-900">
                        {formatCurrency(filteredSalesByDate.reduce((sum, item) => sum + item.memberSpend, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-0.5">Guest</p>
                      <p className="text-xs font-medium text-gray-900">
                        {formatCurrency(filteredSalesByDate.reduce((sum, item) => sum + item.guestSpend, 0))}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-900">Total</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(filteredSalesByDate.reduce((sum, item) => sum + item.total, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
        )}

        {/* Sales by Category */}
        {selectedReport === "sales-by-category" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sales by Category</h3>
            </div>
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SALES_BY_CATEGORY.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className="text-center">{item.transactions}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={cn(
                          "text-xs",
                          item.percentage > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                        )}
                      >
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2">
                {SALES_BY_CATEGORY.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{item.category}</h4>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          item.percentage > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                        )}
                      >
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Transactions</p>
                        <p className="text-xs font-medium text-gray-900">{item.transactions}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Revenue</p>
                        <p className="text-xs font-bold text-gray-900">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          </div>
        )}

        {/* Top Selling Products */}
        {selectedReport === "top-selling" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Selling Products</h3>
            </div>
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Quantity Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP_SELLING_PRODUCTS.map((item, index) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Badge className="bg-blue-500 text-white">#{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-gray-600">{item.category}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(item.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2">
                {TOP_SELLING_PRODUCTS.map((item, index) => (
                  <div key={item.productId} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge className="bg-blue-500 text-white text-[10px]">#{index + 1}</Badge>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h4>
                          <p className="text-[10px] text-gray-500">{item.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Quantity</p>
                        <p className="text-xs font-medium text-gray-900">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Revenue</p>
                        <p className="text-xs font-bold text-gray-900">{formatCurrency(item.revenue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          </div>
        )}

        {/* Inventory Movement */}
        {selectedReport === "inventory-movement" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Inventory Movement</h3>
            </div>
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Stock Before</TableHead>
                  <TableHead className="text-center">Stock After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVENTORY_MOVEMENT.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "text-xs",
                          item.action === "sale"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        )}
                      >
                        {item.action === "sale" ? "Sale" : "Restock"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center font-medium",
                        item.quantity < 0 ? "text-red-600" : "text-green-600"
                      )}
                    >
                      {item.quantity > 0 ? "+" : ""}
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-center">{item.stockBefore}</TableCell>
                    <TableCell className="text-center font-bold">{item.stockAfter}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2">
                {INVENTORY_MOVEMENT.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(item.date)}</p>
                      </div>
                      <Badge
                        className={cn(
                          "text-[10px] shrink-0",
                          item.action === "sale"
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        )}
                      >
                        {item.action === "sale" ? "Sale" : "Restock"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Quantity</p>
                        <p
                          className={cn(
                            "text-xs font-medium",
                            item.quantity < 0 ? "text-red-600" : "text-green-600"
                          )}
                        >
                          {item.quantity > 0 ? "+" : ""}
                          {item.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Before</p>
                        <p className="text-xs font-medium text-gray-900">{item.stockBefore}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">After</p>
                        <p className="text-xs font-bold text-gray-900">{item.stockAfter}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          </div>
        )}

        {/* Member vs Guest Spend */}
        {selectedReport === "member-vs-guest" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Member vs Guest Spend</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Member Stats */}
              <div className="p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <h4 className="text-sm sm:text-base font-semibold text-blue-900">Member Spend</h4>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-blue-700">Transactions</span>
                    <span className="text-xs sm:text-sm font-semibold text-blue-900">
                      {MEMBER_VS_GUEST_SPEND.member.transactions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-blue-700">Total</span>
                    <span className="text-base sm:text-lg font-bold text-blue-900">
                      {formatCurrency(MEMBER_VS_GUEST_SPEND.member.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-blue-700">Average</span>
                    <span className="text-xs sm:text-sm font-semibold text-blue-900">
                      {formatCurrency(MEMBER_VS_GUEST_SPEND.member.average)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-blue-700">Percentage</span>
                      <Badge className="bg-blue-500 text-white text-[10px] sm:text-xs">
                        {MEMBER_VS_GUEST_SPEND.member.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Stats */}
              <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">Guest Spend</h4>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-700">Transactions</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {MEMBER_VS_GUEST_SPEND.guest.transactions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-700">Total</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {formatCurrency(MEMBER_VS_GUEST_SPEND.guest.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-gray-700">Average</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {formatCurrency(MEMBER_VS_GUEST_SPEND.guest.average)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-700">Percentage</span>
                      <Badge className="bg-gray-500 text-white text-[10px] sm:text-xs">
                        {MEMBER_VS_GUEST_SPEND.guest.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-semibold text-gray-900">Total Revenue</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatCurrency(MEMBER_VS_GUEST_SPEND.total.total)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs sm:text-sm text-gray-600">Total Transactions</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {MEMBER_VS_GUEST_SPEND.total.transactions}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Read-only Notice */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-[10px] sm:text-xs text-gray-500">
          Reports are read-only. All data is generated from transaction and inventory records.
        </p>
      </div>
    </div>
  );
}
