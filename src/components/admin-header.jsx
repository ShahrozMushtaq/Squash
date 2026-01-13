"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Mail,
  ChevronDown,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function AdminHeader() {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef(null);
  const { toggleSidebar } = useSidebar();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle click outside to collapse search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        !searchValue
      ) {
        setSearchExpanded(false);
      }
    };

    if (searchExpanded && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchExpanded, searchValue, isMobile]);

  // Prevent body scroll when mobile search is open
  useEffect(() => {
    if (searchExpanded && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchExpanded, isMobile]);

  return (
    <>
      {/* Mobile Full-Screen Search Overlay */}
      {searchExpanded && isMobile && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 m-0">
          {/* Dark backdrop with opacity - Full screen */}
          <div
            className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSearchValue("");
              setSearchExpanded(false);
            }}
          />
          
          {/* Close button - Top right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchValue("");
              setSearchExpanded(false);
            }}
            className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
          
          {/* Search Bar Container - Centered */}
          <div
            ref={searchRef}
            className="relative w-full max-w-lg z-10 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-12 pr-12 h-12 text-base rounded-xl border-gray-300 bg-white shadow-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                autoFocus
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setSearchValue("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="flex h-12 items-center gap-2 border-b border-gray-200/60 px-3 md:px-4 w-full">
        {/* Mobile Sidebar Toggle - Only visible on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-gray-100/80 shrink-0 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95 h-8 w-8"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4 text-gray-500" />
        </Button>
        
        {/* Search Section - Desktop: expands in place, Mobile: triggers overlay */}
        <div ref={!isMobile ? searchRef : null} className="flex items-center gap-2">
          {searchExpanded && !isMobile ? (
            <>
              <div className="relative w-56 md:w-72">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-8 pr-8 h-8 text-sm rounded-lg border-gray-200/60 bg-gray-50/50 focus:bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200/50 transition-all"
                  autoFocus
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded hover:bg-gray-200/60"
                    onClick={() => {
                      setSearchValue("");
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchValue("");
                  setSearchExpanded(false);
                }}
                className="h-8 shrink-0 rounded-lg text-sm font-medium hover:bg-gray-100 px-2"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100/80 shrink-0 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95 h-8 w-8"
              onClick={() => setSearchExpanded(true)}
            >
              <Search className="h-4 w-4 text-gray-500" />
            </Button>
          )}
        </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Side Actions - Always visible */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100/80 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95 h-8 w-8"
            >
              <Bell className="h-4 w-4 text-gray-600" />
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-semibold shadow-sm"
              >
                3
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-xl border-gray-200/60 rounded-xl" align="end">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5">3 unread</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-100/60 hover:bg-gray-50/80 cursor-pointer transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-2 shadow-sm ring-2 ring-blue-100" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-950">New booking received</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-b border-gray-100/60 hover:bg-gray-50/80 cursor-pointer transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 mt-2 shadow-sm ring-2 ring-green-100" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-950">Payment received</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-b border-gray-100/60 hover:bg-gray-50/80 cursor-pointer transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500 mt-2 shadow-sm ring-2 ring-amber-100" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-950">New message</p>
                    <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50/50">
              <Button variant="ghost" className="w-full justify-center text-sm font-medium hover:bg-gray-100 rounded-lg">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Messages */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100/80 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95 h-8 w-8"
            >
              <Mail className="h-4 w-4 text-gray-600" />
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-semibold shadow-sm"
              >
                2
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-xl border-gray-200/60 rounded-xl" align="end">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-semibold text-sm text-gray-900">Messages</h3>
              <p className="text-xs text-gray-500 mt-0.5">2 unread</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-100/60 hover:bg-gray-50/80 cursor-pointer transition-colors group">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-950">John Doe</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      Hey, can we schedule a lesson for tomorrow?
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-b border-gray-100/60 hover:bg-gray-50/80 cursor-pointer transition-colors group">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">SM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-950">Sarah Miller</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      Thanks for the great coaching session!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50/50">
              <Button variant="ghost" className="w-full justify-center text-sm font-medium hover:bg-gray-100 rounded-lg">
                View all messages
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100/80 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95 h-8"
            >
              <Avatar className="h-7 w-7 ring-1 ring-gray-200/60">
                <AvatarImage src="" alt="Admin" />
                <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-xs font-semibold shadow-sm">
                  AP
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-semibold text-gray-900 leading-tight">
                  Admin Panel
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">admin@squash.com</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-500 hidden md:block transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200/60 rounded-xl">
            <DropdownMenuLabel className="p-4 pb-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-gray-900">Admin Panel</p>
                <p className="text-xs text-gray-500">admin@squash.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem className="rounded-lg mx-1 my-0.5 cursor-pointer focus:bg-gray-100">
              <User className="mr-2.5 h-4 w-4 text-gray-600" />
              <span className="font-medium">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg mx-1 my-0.5 cursor-pointer focus:bg-gray-100">
              <Settings className="mr-2.5 h-4 w-4 text-gray-600" />
              <span className="font-medium">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg mx-1 my-0.5 cursor-pointer focus:bg-gray-100">
              <HelpCircle className="mr-2.5 h-4 w-4 text-gray-600" />
              <span className="font-medium">Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem className="text-red-600 rounded-lg mx-1 my-0.5 cursor-pointer focus:bg-red-50 focus:text-red-700">
              <LogOut className="mr-2.5 h-4 w-4" />
              <span className="font-medium">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}
