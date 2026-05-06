"use client";

import { useState, useCallback } from "react";

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  status: "idle" | "loading" | "granted" | "denied" | "error";
  error: string | null;
}

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoState>({
    latitude: null,
    longitude: null,
    status: "idle",
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeo((prev) => ({
        ...prev,
        status: "error",
        error: "Geolocation not supported",
      }));
      return;
    }

    setGeo((prev) => ({ ...prev, status: "loading" }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          status: "granted",
          error: null,
        });
      },
      (err) => {
        setGeo({
          latitude: null,
          longitude: null,
          status: err.code === 1 ? "denied" : "error",
          error: err.message,
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...geo, requestLocation };
}
