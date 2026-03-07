"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
  filterOptions?: FilterOption[];
  onRefresh?: () => void;
  showRefresh?: boolean;
  className?: string;
}

/**
 * Reusable search and filter bar component
 * Handles search input and optional dropdown filter
 * 
 * Usage:
 * ```tsx
 * <SearchFilterBar
 *   search={search}
 *   onSearchChange={setSearch}
 *   filterValue={status}
 *   onFilterChange={setStatus}
 *   filterOptions={[
 *     { value: "", label: "All Statuses" },
 *     { value: "active", label: "Active" },
 *   ]}
 * />
 * ```
 */
export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = "Search...",
  filterValue,
  onFilterChange,
  filterLabel,
  filterOptions = [],
  onRefresh,
  showRefresh = false,
  className,
}: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-3 items-start sm:items-center",
        className,
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 rounded-none bg-background/50 border border-input font-mono text-xs uppercase placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 transition-colors"
        />
      </div>

      {/* Filter Dropdown */}
      {filterOptions.length > 0 && onFilterChange && (
        <Select value={filterValue || ""} onValueChange={onFilterChange}>
          <SelectTrigger className={cn(
            "rounded-none bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0",
            filterLabel ? "min-w-140" : "min-w-130",
          )}>
            <SelectValue placeholder={filterLabel || "Select option"} />
          </SelectTrigger>
          <SelectContent className="rounded-none border-border/40 bg-card/95 font-mono text-xs uppercase">
            {filterOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="rounded-none font-mono text-xs uppercase"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Refresh Button */}
      {showRefresh && onRefresh && (
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2"
        >
          <RefreshCw className="size-3" /> Refresh
        </Button>
      )}
    </div>
  );
}
