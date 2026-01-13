"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminTabs } from "@/components/admin-tabs";
import { Checkout } from "@/components/checkout";
import { CatalogView } from "@/components/catalog/catalog-view";
import { BannersView } from "@/components/banners/banners-view";
import { SalesView } from "@/components/sales/sales-view";
import { SettingsView } from "@/components/settings/settings-view";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// Map URL paths to tab values
const pathToTab = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/checkout": "checkout",
  "/catalog": "catalog",
  "/banners": "banners",
  "/sales": "sales",
  "/settings": "settings",
};

function ContentArea() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize activeTab from pathname immediately to avoid flicker
  // Use function initializer to compute initial state from pathname
  const [activeTab, setActiveTab] = useState(() => {
    return pathToTab[pathname] || "dashboard";
  });

  // Sync tab with URL when pathname changes
  useEffect(() => {
    const tab = pathToTab[pathname] || "dashboard";
    setActiveTab(tab);
    
    // Redirect root path to /dashboard
    if (pathname === "/") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  // Handle tab change - update URL
  const handleTabChange = (value) => {
    // Update tab state immediately to prevent flicker
    setActiveTab(value);
    
    const paths = {
      dashboard: "/dashboard",
      checkout: "/checkout",
      catalog: "/catalog",
      banners: "/banners",
      sales: "/sales",
      settings: "/settings",
    };
    const path = paths[value] || "/dashboard";
    router.push(path);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-50 transition-[width] duration-300 ease-in-out h-screen overflow-hidden">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Sticky Container for Header and Tabs */}
        <div className="sticky top-0 z-50 flex flex-col bg-white/95 backdrop-blur-md shadow-sm shrink-0">
          <AdminHeader />
          <AdminTabs />
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <TabsContent value="dashboard" className="m-0 data-[state=active]:block h-full">
            <DashboardView />
          </TabsContent>
          <TabsContent value="checkout" className="m-0 data-[state=active]:block">
            <Checkout />
          </TabsContent>
          <TabsContent value="catalog" className="m-0 data-[state=active]:block h-full">
            <CatalogView />
          </TabsContent>
          <TabsContent value="banners" className="m-0 data-[state=active]:block h-full">
            <BannersView />
          </TabsContent>
          <TabsContent value="sales" className="m-0 data-[state=active]:block h-full">
            <SalesView />
          </TabsContent>
          <TabsContent value="settings" className="m-0 data-[state=active]:block h-full">
            <SettingsView />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <ContentArea />
    </SidebarProvider>
  );
}
