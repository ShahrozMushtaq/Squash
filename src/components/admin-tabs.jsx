"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, ShoppingCart, Package, Image, Receipt, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabItems = [
  {
    value: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    value: "checkout",
    label: "Checkout",
    icon: ShoppingCart,
    path: "/checkout",
  },
  {
    value: "catalog",
    label: "Catalog",
    icon: Package,
    path: "/catalog",
  },
  {
    value: "banners",
    label: "Banners",
    icon: Image,
    path: "/banners",
  },
  {
    value: "sales",
    label: "Sales",
    icon: Receipt,
    path: "/sales",
  },
  {
    value: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export function AdminTabs() {
  return (
    <div className="border-b border-gray-200 bg-white overflow-x-auto scrollbar-hide">
      <TabsList className="relative h-auto w-full min-w-max justify-start gap-2 md:gap-3 rounded-none border-0 bg-transparent px-3 md:px-4 pt-3 pb-0">
        {tabItems.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              // Base styles
              "relative h-9 rounded-lg px-3 md:px-4 text-xs md:text-sm font-medium transition-all mb-5 flex-shrink-0",
              "border border-transparent bg-transparent cursor-pointer",
              // Inactive state
              "text-gray-900",
              // Active state: white bg, blue text/icon, blue border, no shadow
              "data-[state=active]:bg-white data-[state=active]:text-[#2563eb] data-[state=active]:border-[#2563eb]",
              "data-[state=active]:font-normal",
              // Blue underline at the very bottom of the tab bar (where gray border is)
              "after:absolute after:left-0 after:right-0 after:bottom-[-20px] after:h-[3px] after:bg-transparent",
              "data-[state=active]:after:bg-[#2563eb]",
              // Focus styles
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2",
              // Hover
              "hover:text-gray-700",
              "data-[state=active]:hover:text-[#2563eb]"
            )}
          >
            <div className="flex items-center gap-1 md:gap-1.5 whitespace-nowrap">
              <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
