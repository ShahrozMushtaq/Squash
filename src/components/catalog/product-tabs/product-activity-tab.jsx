"use client";

import { getProductById, getActivityLogForProduct } from "@/lib/catalog/catalog-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Package, Box, Tag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Product Activity Tab
 * 
 * Read-only: Activity log entries
 * Does NOT mutate: Any data (strictly read-only)
 */
export function ProductActivityTab({ productId, variantId = null }) {
  const product = getProductById(productId);
  const activityLog = getActivityLogForProduct(productId);

  if (!product) {
    return (
      <div className="p-6 text-center text-gray-500">
        Product not found
      </div>
    );
  }

  const getActionIcon = (action) => {
    switch (action) {
      case "created":
        return <Package className="h-4 w-4" />;
      case "stock_adjusted":
        return <Box className="h-4 w-4" />;
      case "promoted":
        return <Tag className="h-4 w-4" />;
      case "transaction":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action) => {
    const colors = {
      created: "bg-blue-500",
      updated: "bg-gray-500",
      deleted: "bg-red-500",
      stock_adjusted: "bg-green-500",
      promoted: "bg-purple-500",
      transaction: "bg-yellow-500",
    };

    return (
      <Badge className={cn("text-white text-xs whitespace-nowrap", colors[action] || "bg-gray-500")}>
        {action.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
        <p className="text-sm text-gray-600 mt-1">
          Read-only audit trail of all product-related activities
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This log cannot be edited or deleted
        </p>
      </div>

      {activityLog.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
          <History className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-xs sm:text-sm text-gray-500">No activity recorded yet</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] whitespace-nowrap px-4 py-3">Date & Time</TableHead>
                <TableHead className="w-[160px] whitespace-nowrap px-4 py-3">Action</TableHead>
                <TableHead className="min-w-[250px] px-4 py-3">Changes</TableHead>
                <TableHead className="w-[120px] whitespace-nowrap px-4 py-3">Performed By</TableHead>
                <TableHead className="w-[150px] whitespace-nowrap px-4 py-3">Reason/Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLog.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap px-4 py-3">
                    {formatTimestamp(entry.timestamp)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {getActionIcon(entry.action)}
                      {getActionBadge(entry.action)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 px-4 py-3">
                    {entry.changes && Object.keys(entry.changes).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(entry.changes).map(([field, change]) => (
                          <div key={field} className="text-xs whitespace-nowrap">
                            <span className="font-medium">{field}:</span>{" "}
                            {change.old !== null && change.old !== undefined ? (
                              <>
                                <span className="text-red-600 line-through">
                                  {change.old}
                                </span>{" "}
                                <span className="text-gray-400">→</span>{" "}
                              </>
                            ) : null}
                            <span className="text-green-600">{change.new}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">No changes recorded</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 whitespace-nowrap px-4 py-3">
                    {entry.performedBy}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 whitespace-nowrap px-4 py-3">
                    {entry.metadata?.reason || entry.metadata?.transactionId || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {activityLog.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getActionIcon(entry.action)}
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      {entry.action}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 shrink-0">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
                {entry.changes && entry.changes.length > 0 ? (
                  <div className="space-y-1 mb-2">
                    {entry.changes.map((change, idx) => (
                      <div key={idx} className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">{change.field}:</span>{" "}
                        {change.old ? (
                          <>
                            <span className="text-red-600 line-through">
                              {change.old}
                            </span>{" "}
                            <span className="text-gray-400">→</span>{" "}
                          </>
                        ) : null}
                        <span className="text-green-600">{change.new}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">No changes recorded</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    By: {entry.performedBy}
                  </span>
                  {entry.metadata?.reason && (
                    <span className="text-[10px] sm:text-xs text-gray-500 truncate ml-2">
                      {entry.metadata.reason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
