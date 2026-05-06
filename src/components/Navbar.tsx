"use client";

import { Heart, MapPin, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Screen = "home" | "favorites";

interface NavbarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  favoritesCount: number;
}

export default function Navbar({
  activeScreen,
  onNavigate,
  favoritesCount,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 glass border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Flame size={22} className="text-brand-orange" />
          <span className="text-lg font-bold text-text-primary">
            Date<span className="text-brand-orange">Spot</span>
          </span>
        </button>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          {/* Nearby pill */}
          <button
            onClick={() => onNavigate("home")}
            className={cn(
              "flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition-colors",
              activeScreen === "home"
                ? "text-brand-orange"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <MapPin size={16} />
            <span className="hidden sm:inline">Explore</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => onNavigate("favorites")}
            className={cn(
              "relative flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium transition-colors",
              activeScreen === "favorites"
                ? "text-brand-orange"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Heart
              size={16}
              className={cn(
                activeScreen === "favorites" && "fill-brand-orange"
              )}
            />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                              flex items-center justify-center rounded-full
                              bg-brand-orange text-[10px] font-bold text-white px-1">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
