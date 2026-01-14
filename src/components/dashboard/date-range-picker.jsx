"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Date Range Picker Component
 * Allows selecting predefined ranges or custom date ranges
 */
export function DateRangePicker({ 
  className, 
  value, 
  onChange,
  defaultDate = {
    from: new Date(2026, 0, 1),
    to: new Date(2026, 0, 13),
  }
}) {
  const [date, setDate] = React.useState(value || defaultDate);
  const [selectedRange, setSelectedRange] = React.useState("this-month");
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const presetRanges = {
    "this-month": {
      label: "This Month",
      from: new Date(2026, 0, 1),
      to: new Date(2026, 0, 13),
    },
    today: {
      label: "Today",
      from: new Date(),
      to: new Date(),
    },
    yesterday: {
      label: "Yesterday",
      from: addDays(new Date(), -1),
      to: addDays(new Date(), -1),
    },
    "last-7-days": {
      label: "Last 7 Days",
      from: addDays(new Date(), -7),
      to: new Date(),
    },
    "last-30-days": {
      label: "Last 30 Days",
      from: addDays(new Date(), -30),
      to: new Date(),
    },
    "last-90-days": {
      label: "Last 90 Days",
      from: addDays(new Date(), -90),
      to: new Date(),
    },
  };

  const handlePresetChange = (value) => {
    setSelectedRange(value);
    const preset = presetRanges[value];
    const newDate = {
      from: preset.from,
      to: preset.to,
    };
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full sm:w-auto justify-start text-left font-normal h-9 px-2 sm:px-3 text-xs sm:text-sm min-w-0",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <div className="flex items-center gap-1 sm:gap-2 truncate min-w-0">
              {date?.from ? (
                date.to ? (
                  <>
                    <span className="font-semibold hidden sm:inline">
                      {presetRanges[selectedRange]?.label || "Custom Range"}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm truncate">
                      {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                    </span>
                  </>
                ) : (
                  <span className="text-xs sm:text-sm truncate">{format(date.from, "MMM dd, yyyy")}</span>
                )
              ) : (
                <span className="text-xs sm:text-sm">Pick a date</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-[95vw] sm:max-w-none" align="end">
          <div className="flex flex-col sm:flex-row">
            {/* Preset Ranges */}
            <div className="border-b sm:border-b-0 sm:border-r border-gray-200 p-3 sm:p-4 space-y-1 w-full sm:w-[150px] flex-shrink-0 bg-gray-50">
              <div className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3">
                Quick Select
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 sm:gap-1">
                {Object.entries(presetRanges).map(([key, { label }]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-xs sm:text-sm h-7 sm:h-8 px-2 font-normal",
                      selectedRange === key
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                    onClick={() => handlePresetChange(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="p-3 sm:p-5 relative">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    setSelectedRange("custom");
                    if (onChange) {
                      onChange(newDate);
                    }
                  }
                }}
                numberOfMonths={isMobile ? 1 : 2}
                classNames={{
                  root: "relative",
                  months: "flex gap-4 sm:gap-8 relative",
                  month: "space-y-3 sm:space-y-4",
                  caption: "flex justify-center pt-1 relative items-center mb-2 sm:mb-4",
                  caption_label: "text-xs sm:text-sm font-medium",
                  nav: "absolute inset-x-0 top-0 flex items-center justify-between z-10",
                  nav_button: "h-7 w-7 sm:h-9 sm:w-9 bg-white border border-gray-200 opacity-70 hover:opacity-100 hover:bg-accent rounded-md inline-flex items-center justify-center shadow-sm",
                  nav_button_previous: "absolute -left-1",
                  nav_button_next: "absolute -right-1",
                  table: "w-full border-collapse",
                  head_row: "flex mb-1 sm:mb-2",
                  head_cell: "text-muted-foreground rounded-md w-8 sm:w-10 font-normal text-[0.7rem] sm:text-[0.8rem]",
                  row: "flex w-full mt-1 sm:mt-2",
                  cell: "relative p-0 text-center text-xs sm:text-sm focus-within:relative focus-within:z-20",
                  day: "h-8 w-8 sm:h-10 sm:w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md text-xs sm:text-sm",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
