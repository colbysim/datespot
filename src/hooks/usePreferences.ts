"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "datespot-preferences";

export interface UserPreferences {
  city: string | null;
  hasCompletedOnboarding: boolean;
  useCurrentLocation: boolean;
}

const DEFAULT_PREFS: UserPreferences = {
  city: null,
  hasCompletedOnboarding: false,
  useCurrentLocation: false,
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs, loaded]);

  const setCity = useCallback((city: string) => {
    setPrefs((prev) => ({
      ...prev,
      city,
      useCurrentLocation: false,
      hasCompletedOnboarding: true,
    }));
  }, []);

  const setUseCurrentLocation = useCallback(() => {
    setPrefs((prev) => ({
      ...prev,
      city: null,
      useCurrentLocation: true,
      hasCompletedOnboarding: true,
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
  }, []);

  return {
    prefs,
    loaded,
    setCity,
    setUseCurrentLocation,
    resetPreferences,
  };
}
