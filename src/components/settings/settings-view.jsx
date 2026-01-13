"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Settings as SettingsIcon } from "lucide-react";
import { ReportsView } from "./reports-view";
import { SettingsConfigView } from "./settings-config-view";

/**
 * Settings View
 * Control & Review - Reports and Settings Configuration
 */
export function SettingsView() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Settings & Reports</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Control configuration and review business reports
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3 sm:pb-4 border-b border-gray-200">
          <TabsList className="inline-flex h-9 sm:h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-hide w-full">
            <TabsTrigger value="reports" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <SettingsIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="reports" className="m-0 data-[state=active]:block h-full">
            <ReportsView />
          </TabsContent>
          <TabsContent value="settings" className="m-0 data-[state=active]:block h-full">
            <SettingsConfigView />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
