"use client";

import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Filters } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";
import { PRICE_LEVELS } from "@/data/categories";

interface FilterSheetProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose: () => void;
  onApply: () => void;
}

export default function FilterSheet({
  filters,
  onChange,
  onClose,
  onApply,
}: FilterSheetProps) {
  const togglePrice = (level: number) => {
    onChange({
      ...filters,
      priceLevels: filters.priceLevels.includes(level)
        ? filters.priceLevels.filter((x) => x !== level)
        : [...filters.priceLevels, level],
    });
  };

  const hasFilters =
    filters.priceLevels.length > 0 ||
    filters.minRating > 0 ||
    filters.radiusMiles !== 15;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto
                      rounded-t-3xl glass border-t border-surface-border
                      animate-slide-up hide-scrollbar">
        {/* Handle */}
        <div className="sticky top-0 glass z-10 pt-3 pb-2 px-6">
          <div className="w-10 h-1 rounded-full bg-surface-border mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-8 space-y-7">
          {/* Price Range */}
          <section>
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Price Range
            </h3>
            <div className="flex gap-2">
              {PRICE_LEVELS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => togglePrice(p.value)}
                  className={cn(
                    "chip flex-1 text-center",
                    filters.priceLevels.includes(p.value) && "chip-active"
                  )}
                >
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-[11px] opacity-60 mt-0.5">
                    {p.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Min Rating */}
          <section>
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Minimum Rating
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={4.5}
                step={0.5}
                value={filters.minRating}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minRating: parseFloat(e.target.value),
                  })
                }
                className="flex-1 accent-brand-orange h-1.5 rounded-full
                           appearance-none bg-surface-elevated
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-brand-orange
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-sm font-semibold text-brand-orange min-w-[3rem] text-right">
                {filters.minRating > 0 ? `${filters.minRating}+` : "Any"}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Our algorithm already filters out low-quality spots. Use this to raise the bar further.
            </p>
          </section>

          {/* Radius */}
          <section>
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
              Search Radius
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={filters.radiusMiles}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    radiusMiles: parseInt(e.target.value),
                  })
                }
                className="flex-1 accent-brand-orange h-1.5 rounded-full
                           appearance-none bg-surface-elevated
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-brand-orange
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-sm font-semibold text-brand-orange min-w-[3rem] text-right">
                {filters.radiusMiles} mi
              </span>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              disabled={!hasFilters}
              className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl
                         bg-surface-elevated text-text-secondary border border-surface-border
                         hover:border-brand-orange/30 disabled:opacity-30
                         transition-all flex-1"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={onApply}
              className="flex items-center justify-center h-12 px-5 rounded-xl
                         bg-brand-orange text-white font-semibold
                         hover:bg-brand-orange-dark active:scale-[0.98]
                         transition-all flex-[2]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
