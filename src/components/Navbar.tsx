"use client";

import { Heart, Compass, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Screen = "home" | "favorites";

interface NavbarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onGoHome: () => void;
  favoritesCount: number;
}

export default function Navbar({
  activeScreen,
  onNavigate,
  onGoHome,
  favoritesCount,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 glass-strong border-b border-surface-border/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo — returns to homepage */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Flame size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-text-primary">Date</span>
            <span className="gradient-text">Spot</span>
          </span>
        </button>

        {/* Right nav */}
        <div className="flex items-center gap-1">
          {/* Explore */}
          <button
            onClick={() => onNavigate("home")}
            className={cn(
              "flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-medium transition-all",
              activeScreen === "home"
                ? "gradient-brand-subtle text-brand-purple"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
            )}
          >
            <Compass size={17} />
            <span className="hidden sm:inline">Explore</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => onNavigate("favorites")}
            className={cn(
              "relative flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-medium transition-all",
              activeScreen === "favorites"
                ? "gradient-brand-subtle text-brand-magenta"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
            )}
          >
            <Heart
              size={17}
              className={cn(
                activeScreen === "favorites" && "fill-brand-magenta"
              )}
            />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                              flex items-center justify-center rounded-full
                              gradient-brand text-[10px] font-bold text-white px-1">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
