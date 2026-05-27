"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, ArrowRight, X } from "lucide-react";

interface WelcomeScreenProps {
  onSelectCity: (city: string) => void;
  onUseLocation: () => void;
  isLocating: boolean;
  locationDenied: boolean;
}

const POPULAR_CITIES = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Miami",
  "Austin",
  "San Francisco",
];

export default function WelcomeScreen({
  onSelectCity,
  onUseLocation,
  isLocating,
  locationDenied,
}: WelcomeScreenProps) {
  const [cityInput, setCityInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      onSelectCity(cityInput.trim());
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-5 transition-all duration-300 ${
        visible ? "bg-black/40 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div
        className={`w-full max-w-sm bg-white rounded-2xl shadow-card-hover border border-surface-border overflow-hidden transition-all duration-300 ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-primary">
            Where are you going out?
          </h2>
          <p className="text-sm text-text-muted mt-0.5">
            Enter a city to find date spots
          </p>
        </div>

        <div className="px-5 pb-5">
          {/* City input */}
          <form onSubmit={handleSubmit} className="relative">
            <MapPin
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Try &quot;Austin&quot; or &quot;New York&quot;..."
              className="w-full pl-9 pr-11 py-3 rounded-xl border border-surface-border
                         bg-surface-elevated text-text-primary text-sm
                         placeholder:text-text-muted/60
                         focus:outline-none focus:ring-2 focus:ring-brand-purple/25
                         focus:border-brand-purple/40 transition-all"
            />
            {cityInput.trim() && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2
                           w-7 h-7 rounded-lg gradient-brand flex items-center
                           justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <ArrowRight size={14} className="text-white" />
              </button>
            )}
          </form>

          {/* Quick city chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => onSelectCity(city)}
                className="px-3 py-1.5 rounded-full text-xs font-medium
                           bg-surface-elevated text-text-secondary border border-surface-border
                           hover:border-brand-purple/30 hover:text-brand-purple transition-all"
              >
                {city}
              </button>
            ))}
          </div>

          {/* Divider + location */}
          {!locationDenied && (
            <>
              <div className="flex items-center gap-3 my-3.5">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>

              <button
                onClick={onUseLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                           gradient-brand-subtle border border-brand-purple/15
                           hover:border-brand-purple/30 transition-all text-sm font-medium
                           text-brand-purple"
              >
                {isLocating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin" />
                    Detecting location...
                  </>
                ) : (
                  <>
                    <Navigation size={15} />
                    Use my current location
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
