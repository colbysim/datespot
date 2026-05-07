"use client";

import { cn } from "@/lib/utils";
import type { VenueCategory } from "@/lib/algorithm";

interface CategoryTabsProps {
  active: VenueCategory;
  onChange: (category: VenueCategory) => void;
}

const TABS: { id: VenueCategory; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "🔥" },
  { id: "restaurants", label: "Restaurants", icon: "🍽️" },
  { id: "cafes", label: "Cafes", icon: "☕" },
  { id: "parks", label: "Parks", icon: "🌳" },
  { id: "activities", label: "Activities", icon: "🎳" },
  { id: "nightlife", label: "Nightlife", icon: "🌙" },
];

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 px-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold",
            "whitespace-nowrap transition-all duration-200 shrink-0",
            active === tab.id
              ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/25"
              : "bg-surface-card text-text-secondary border border-surface-border hover:border-brand-orange/30 hover:text-text-primary"
          )}
        >
          <span className="text-base">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
