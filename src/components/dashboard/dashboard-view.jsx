"use client";

import { useState, useEffect } from "react";
import {
  DASHBOARD_METRICS,
  RECENT_ACTIVITY,
  TOP_PRODUCTS,
  MONTHLY_SALES_DATA,
  SALES_BY_CATEGORY_DATA,
} from "@/lib/dashboard/dashboard-data";
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
import { DateRangePicker } from "./date-range-picker";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Activity,
  Package,
  Users,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dashboard View
 * Overview with key metrics, recent activity, and quick stats
 */
export function DashboardView() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [key, setKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatValue = (metric) => {
    if (metric.format === "currency") {
      return `$${metric.value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    if (metric.format === "percentage") {
      return `${metric.value}%`;
    }
    return `${metric.prefix}${metric.value.toLocaleString("en-US")}`;
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4" />;
      case "inventory":
        return <Package className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowSuccess(false);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update key to trigger re-render with animation
    setKey((prev) => prev + 1);
    setIsRefreshing(false);
    setShowSuccess(true);

    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with Date Range */}
      <div className="p-4 sm:p-6 bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Overview of your squash club operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 transition-all duration-300 flex-shrink-0",
                isRefreshing && "opacity-70",
                showSuccess && "border-green-500 bg-green-50 text-green-700"
              )}
              title={isRefreshing ? "Refreshing..." : showSuccess ? "Updated!" : "Refresh"}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : showSuccess ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1 sm:flex-initial">
              <DateRangePicker />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DASHBOARD_METRICS.map((metric, index) => (
            <div
              key={`${metric.id}-${key}`}
              className={cn(
                "bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-500",
                isRefreshing && "opacity-50 scale-95",
                !isRefreshing && "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: "600ms",
              }}
            >
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatValue(metric)}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={cn(
                      "text-xs font-medium flex items-center gap-1",
                      metric.change.type === "increase"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    )}
                    variant="outline"
                  >
                    {metric.change.type === "increase" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {metric.change.type === "increase" ? "+" : "-"}
                    {metric.change.value}%
                  </Badge>
                  <span className="text-xs text-gray-500">{metric.change.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Monthly Sales Chart */}
          <div
            key={`chart-1-${key}`}
            className={cn(
              "bg-white rounded-lg border border-gray-200 p-4 sm:p-6 flex flex-col transition-all duration-500 outline-none focus:outline-none",
              isRefreshing && "opacity-50 scale-95",
              !isRefreshing && "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{
              animationDelay: "400ms",
              animationDuration: "600ms",
            }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Monthly Sales</h3>
            <div className="flex-1 min-h-[250px] sm:min-h-[350px]">
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
                <BarChart data={MONTHLY_SALES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    cursor={false}
                  />
                  <Bar 
                    dataKey="target" 
                    fill="#d1d5db" 
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales by Category Chart */}
          <div
            key={`chart-2-${key}`}
            className={cn(
              "bg-white rounded-lg border border-gray-200 p-4 sm:p-6 flex flex-col transition-all duration-500 outline-none focus:outline-none",
              isRefreshing && "opacity-50 scale-95",
              !isRefreshing && "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{
              animationDelay: "500ms",
              animationDuration: "600ms",
            }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Sales by Category
            </h3>
            <div className="flex-1 flex flex-col min-h-[200px] sm:min-h-[250px]">
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                  <PieChart>
                    <Pie
                      data={SALES_BY_CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 30 : 60}
                      outerRadius={isMobile ? 60 : 100}
                      paddingAngle={2}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {SALES_BY_CATEGORY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => `${value}%`}
                      cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                {SALES_BY_CATEGORY_DATA.map((category) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">
                      {category.name}: {category.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div
            key={`activity-${key}`}
            className={cn(
              "bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-500",
              isRefreshing && "opacity-50 scale-95",
              !isRefreshing && "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{
              animationDelay: "600ms",
              animationDuration: "600ms",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Recent Activity</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 sm:h-8 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                View All
              </Button>
            </div>

            {/* Activity List */}
            <div className="divide-y divide-gray-100">
              {RECENT_ACTIVITY.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                      activity.type === "sale" && "bg-blue-50 text-blue-600",
                      activity.type === "inventory" && "bg-amber-50 text-amber-600",
                      activity.type === "customer" && "bg-emerald-50 text-emerald-600"
                    )}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 leading-5 mb-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-gray-500">{activity.user}</p>
                      {activity.amount && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <p className="text-xs font-semibold text-gray-700">
                            {formatCurrency(activity.amount)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-400 flex-shrink-0 font-medium">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div
            key={`products-${key}`}
            className={cn(
              "bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-500",
              isRefreshing && "opacity-50 scale-95",
              !isRefreshing && "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{
              animationDelay: "700ms",
              animationDuration: "600ms",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Top Products</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 sm:h-8 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                View All
              </Button>
            </div>

            {/* Products Table */}
            <div className="divide-y divide-gray-100">
              {TOP_PRODUCTS.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <Badge
                      className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-110",
                        index === 0 && "bg-amber-100 text-amber-700 border border-amber-200",
                        index === 1 && "bg-slate-100 text-slate-700 border border-slate-200",
                        index === 2 && "bg-orange-100 text-orange-700 border border-orange-200",
                        index > 2 && "bg-gray-100 text-gray-600 border border-gray-200"
                      )}
                    >
                      {index + 1}
                    </Badge>
                  </div>

                  {/* Product Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 leading-5 truncate">
                      {product.name}
                    </p>
                  </div>

                  {/* Sales & Revenue */}
                  <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Sales</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">{product.sales}</p>
                    </div>
                    <div className="text-right min-w-[70px] sm:min-w-[80px]">
                      <p className="text-xs text-gray-500 mb-0.5">Revenue</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
