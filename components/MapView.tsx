"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

type MapViewProps = {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
};

const defaultCenter = {
  lat: 10.9386,
  lng: 76.9554,
};

export default function MapView({ center, zoom = 13 }: MapViewProps) {
  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();
  const hasApiKey = apiKey.length > 0;
  const safeCenter =
    center && Number.isFinite(center.lat) && Number.isFinite(center.lng)
      ? center
      : defaultCenter;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "karunya-bus-map",
    googleMapsApiKey: apiKey,
  });

  if (!hasApiKey) {
    return (
      <div className="rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to view the map.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="h-80 w-full rounded border border-zinc-200"
      center={safeCenter}
      zoom={zoom}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    />
  );
}
