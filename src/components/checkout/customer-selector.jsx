"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { User, UserPlus, X, Search, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerSelector({
  customers,
  selectedCustomer,
  onCustomerSelect,
  onCustomerClear,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  // Filter customers by name, email, or phone
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers.slice(0, 5); // Show first 5 when no search
    }

    const query = searchQuery.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query)
    );
  }, [customers, searchQuery]);

  const handleSelectCustomer = (customer) => {
    onCustomerSelect(customer);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearCustomer = () => {
    onCustomerClear();
    setSearchQuery("");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Customer Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Customer</h3>
        </div>
      </div>

      {/* Customer Content */}
      <div className="p-3 sm:p-5">
        {selectedCustomer ? (
          // Selected customer display
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {selectedCustomer.name}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                {selectedCustomer.email}
              </div>
              {selectedCustomer.isMember && (
                <div className="text-xs text-green-600 mt-1 font-medium">
                  Member • {selectedCustomer.memberDiscount * 100}% discount
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={handleClearCustomer}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Customer search
          <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <PopoverAnchor asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <Input
                  ref={inputRef}
                  placeholder="Search customer..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                  }}
                  className="pl-10 h-10 text-sm border-gray-300"
                />
              </div>
            </PopoverAnchor>
            <PopoverContent 
              className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 border-gray-200 shadow-lg" 
              align="start"
              side="bottom"
              sideOffset={4}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                // Focus the inner input instead
                const innerInput = e.currentTarget.querySelector('input[placeholder="Name, email, or phone..."]');
                if (innerInput) {
                  setTimeout(() => innerInput.focus(), 0);
                }
              }}
              onInteractOutside={(e) => {
                const target = e.target;
                // Don't close if clicking on the trigger input or its container
                if (
                  target === inputRef.current ||
                  (inputRef.current && inputRef.current.contains(target)) ||
                  target?.closest('[data-radix-popper-content-wrapper]')
                ) {
                  e.preventDefault();
                  return false;
                }
              }}
              onEscapeKeyDown={() => {
                setIsOpen(false);
                inputRef.current?.blur();
              }}
            >
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <Input
                  placeholder="Name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-sm border-gray-300 bg-white"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No customers found
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {customer.email}
                          </div>
                        </div>
                        {customer.isMember && (
                          <BadgeCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-9 text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                >
                  Continue as guest
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
