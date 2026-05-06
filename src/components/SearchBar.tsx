"use client";

import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  isLoading: boolean;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  isLoading,
  onFilterClick,
  hasActiveFilters,
  placeholder = "Search a city — e.g. Austin, TX",
}: SearchBarProps) {
  return (
    <div className="relative flex items-center gap-2">
      {/* Search field */}
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-brand-orange" />
          ) : (
            <Search size={18} />
          )}
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-10 rounded-xl
                     bg-surface-card border border-surface-border
                     text-text-primary placeholder:text-text-muted
                     focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20
                     transition-all text-[15px]"
        />

        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       p-1 rounded-full hover:bg-surface-elevated transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>
        )}
      </div>

      {/* Filter button */}
      <button
        onClick={onFilterClick}
        className={cn(
          "relative h-12 w-12 flex items-center justify-center rounded-xl",
          "border transition-all",
          hasActiveFilters
            ? "bg-brand-orange/15 border-brand-orange/40 text-brand-orange"
            : "bg-surface-card border-surface-border text-text-secondary hover:border-brand-orange/30"
        )}
        aria-label="Open filters"
      >
        <SlidersHorizontal size={18} />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-orange" />
        )}
      </button>
    </div>
  );
}
