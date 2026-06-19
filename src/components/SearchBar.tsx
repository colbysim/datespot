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
  placeholder = "Try \"Austin\" or \"sushi in Miami\"",
}: SearchBarProps) {
  return (
    <div className="relative flex items-center gap-3">
      {/* Search field */}
      <div className="relative flex-1 group">
        {/* Gradient glow ring on focus */}
        <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-focus-within:opacity-100
                       transition-opacity duration-300 blur-sm gradient-brand pointer-events-none" />

        <div className="relative bg-white rounded-2xl shadow-card border border-surface-border
                       group-focus-within:border-transparent group-focus-within:shadow-glow
                       transition-all duration-300">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-brand-purple" />
            ) : (
              <Search size={20} />
            )}
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 pl-13 pr-12 rounded-2xl
                       bg-transparent text-text-primary placeholder:text-text-muted
                       focus:outline-none transition-all text-[15px] font-medium
                       pl-[52px]"
          />

          {value && (
            <button
              onClick={() => onChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         p-1.5 rounded-full hover:bg-surface-elevated transition-colors"
            >
              <X size={16} className="text-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Filter button */}
      <button
        onClick={onFilterClick}
        className={cn(
          "relative h-14 w-14 flex items-center justify-center rounded-2xl",
          "shadow-card border transition-all duration-200",
          hasActiveFilters
            ? "gradient-brand text-white border-transparent shadow-glow"
            : "bg-white border-surface-border text-text-secondary hover:shadow-card-hover hover:text-text-primary"
        )}
        aria-label="Open filters"
      >
        <SlidersHorizontal size={20} />
        {hasActiveFilters && !hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full gradient-brand
                          border-2 border-white" />
        )}
      </button>
    </div>
  );
}
