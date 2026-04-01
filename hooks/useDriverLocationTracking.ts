"use client";

import { useEffect, useRef, useState } from "react";
import { upsertBusLocation } from "@/services/realtimeService";

type UseDriverLocationTrackingParams = {
  busId: string | null;
  enabled: boolean;
  intervalMs?: number;
  onLocation?: (location: { latitude: number; longitude: number }) => void;
};

type DriverTrackingState = {
  trackingError: string;
  lastSyncAt: string | null;
};

export function useDriverLocationTracking({
  busId,
  enabled,
  intervalMs = 7000,
  onLocation,
}: UseDriverLocationTrackingParams): DriverTrackingState {
  const [trackingError, setTrackingError] = useState(() =>
    typeof navigator !== "undefined" && !("geolocation" in navigator)
      ? "Geolocation is not supported on this device."
      : "",
  );
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const lastSyncTimestamp = useRef(0);

  useEffect(() => {
    if (!enabled || !busId) {
      return;
    }

    if (!("geolocation" in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        onLocation?.({ latitude, longitude });

        const currentTime = Date.now();
        if (currentTime - lastSyncTimestamp.current < intervalMs) {
          return;
        }

        lastSyncTimestamp.current = currentTime;

        void upsertBusLocation(busId, latitude, longitude)
          .then((savedLocation) => {
            setLastSyncAt(savedLocation.updatedAt);
            setTrackingError("");
          })
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Unable to sync bus location.";
            setTrackingError(message);
          });
      },
      (error) => {
        setTrackingError(error.message || "Unable to read geolocation.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [busId, enabled, intervalMs, onLocation]);

  return {
    trackingError,
    lastSyncAt,
  };
}