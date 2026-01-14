"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Date Picker Component
 * Single date picker with Quick Select presets matching DateRangePicker style
 */
export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Pick a date",
  className,
  includeTime = false 
}) {
  const parseValue = (val) => {
    if (!val || val === "") return null;
    try {
      return new Date(val);
    } catch {
      return null;
    }
  };

  const [selectedDate, setSelectedDate] = React.useState(parseValue(value));
  const [selectedPreset, setSelectedPreset] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const parsed = parseValue(value);
    if (parsed) {
      setSelectedDate(parsed);
    } else {
      setSelectedDate(null);
      setSelectedPreset(null);
    }
  }, [value]);

  const presetDates = {
    today: {
      label: "Today",
      date: new Date(),
    },
    yesterday: {
      label: "Yesterday",
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    tomorrow: {
      label: "Tomorrow",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
  };

  const handlePresetChange = (key) => {
    const preset = presetDates[key];
    const newDate = preset.date;
    setSelectedDate(newDate);
    setSelectedPreset(key);
    if (onChange) {
      if (includeTime) {
        // Keep existing time if available, otherwise use current time
        const existingDate = selectedDate ? new Date(selectedDate) : new Date();
        newDate.setHours(existingDate.getHours());
        newDate.setMinutes(existingDate.getMinutes());
        onChange(newDate.toISOString().slice(0, 16));
      } else {
        onChange(newDate.toISOString().split('T')[0]);
      }
    }
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setSelectedPreset(null);
      if (onChange) {
        if (includeTime) {
          // Keep existing time if available, otherwise use current time
          const existingDate = selectedDate ? new Date(selectedDate) : new Date();
          date.setHours(existingDate.getHours());
          date.setMinutes(existingDate.getMinutes());
          onChange(date.toISOString().slice(0, 16));
        } else {
          onChange(date.toISOString().split('T')[0]);
        }
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 px-3 text-sm",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            <span>{format(selectedDate, includeTime ? "MMM dd, yyyy HH:mm" : "MMM dd, yyyy")}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[95vw] sm:max-w-none" align="start">
        <div className="flex flex-col sm:flex-row">
          {/* Preset Dates */}
          <div className="border-b sm:border-b-0 sm:border-r border-gray-200 p-3 sm:p-4 space-y-1 w-full sm:w-[150px] flex-shrink-0 bg-gray-50">
            <div className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3">
              Quick Select
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
              {Object.entries(presetDates).map(([key, { label }]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-xs sm:text-sm h-7 sm:h-8 px-2 font-normal",
                    selectedPreset === key
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
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              numberOfMonths={isMobile ? 1 : 1}
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
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
