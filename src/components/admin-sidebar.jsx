"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ClipboardList,
  Users,
  MessageSquare,
  Megaphone,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Court Management",
    icon: Calendar,
    href: "/court-management",
  },
  {
    title: "Lessons",
    icon: BookOpen,
    href: "/lessons",
  },
  {
    title: "Programs",
    icon: ClipboardList,
    href: "/programs",
  },
  {
    title: "Coaches",
    icon: Users,
    href: "/coaches",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    title: "Announcements",
    icon: Megaphone,
    href: "/announcements",
  },
  {
    title: "POS",
    icon: ShoppingCart,
    href: "/pos",
    active: true,
  },
  {
    title: "Facility Reports",
    icon: FileText,
    href: "/facility-reports",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
];

export function AdminSidebar() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon" 
      variant="sidebar"
      disableSpacer
      className="bg-gradient-to-b from-gray-50 to-gray-50/95 shrink-0 border-r border-gray-200/60"
    >
      <SidebarHeader className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-md ring-1 ring-gray-900/10">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bull's head / stylized animal with horns */}
              <path
                d="M10 3C8 3 6 4 5 6C4 7 3 9 4 11C4.5 12 5.5 13 7 13.5C7.5 14 8 14.5 8.5 15C9 15.5 9.5 16 10 16C10.5 16 11 15.5 11.5 15C12 14.5 12.5 14 13 13.5C14.5 13 15.5 12 16 11C17 9 16 7 15 6C14 4 12 3 10 3Z"
                fill="currentColor"
              />
              <path
                d="M7 8C7.5 8 8 8.5 8 9C8 9.5 7.5 10 7 10C6.5 10 6 9.5 6 9C6 8.5 6.5 8 7 8Z"
                fill="white"
              />
              <path
                d="M13 8C13.5 8 14 8.5 14 9C14 9.5 13.5 10 13 10C12.5 10 12 9.5 12 9C12 8.5 12.5 8 13 8Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight group-data-[collapsible=icon]:hidden">
            Squash
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    className={cn(
                      "h-9 rounded-lg px-2.5 text-sm font-medium transition-all duration-200 ease-out",
                      "group relative",
                      item.active
                        ? "bg-white text-gray-900 shadow-md shadow-gray-200/50 border border-gray-200/60 font-semibold"
                        : "text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-sm hover:shadow-gray-200/30 active:scale-[0.98]"
                    )}
                  >
                    <a href={item.href} className="flex items-center gap-2.5 w-full cursor-pointer">
                      <item.icon className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors",
                        item.active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"
                      )} />
                      <span className="truncate">{item.title}</span>
                      {item.active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-gray-900" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="bg-gradient-to-r from-transparent via-gray-200/60 to-transparent h-px" />
      <SidebarFooter className="bg-white/80 backdrop-blur-sm px-2 py-2.5 relative border-t border-gray-200/40" style={{ overflow: 'visible' }}>
        <div className="flex items-center">
          {/* Settings on the left */}
          <SidebarMenuButton
            asChild
            className="h-9 rounded-lg px-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
          >
            <a href="/settings" className="flex items-center gap-2.5 cursor-pointer">
              <Settings className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span>Settings</span>
            </a>
          </SidebarMenuButton>
        </div>
        
        {/* Collapse button - absolutely positioned, half outside */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md z-[100] ring-1 ring-gray-200/50 hover:ring-gray-300/50 active:scale-95"
          style={{ right: '-16px', position: 'absolute' }}
        >
          {state === "collapsed" ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
