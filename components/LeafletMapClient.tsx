"use client";

import L, { type LeafletEventHandlerFnMap } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import type { MapViewProps } from "./MapView";

const defaultCenter = {
  lat: 10.9361,
  lng: 76.7435,
};

const markerIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapFallback() {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
      Map unavailable (Phase 1 fallback)
    </div>
  );
}

function RecenterOnUpdate({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), {
      animate: true,
      duration: 1,
    });
  }, [center.lat, center.lng, map]);

  return null;
}

export default function LeafletMapClient({ center, zoom = 13, markerLabel, customPopup }: MapViewProps) {
  const [mapFailed, setMapFailed] = useState(false);

  const safeCenter = useMemo(
    () =>
      center && Number.isFinite(center.lat) && Number.isFinite(center.lng)
        ? center
        : defaultCenter,
    [center],
  );

  const tileHandlers = useMemo<LeafletEventHandlerFnMap>(
    () => ({
      tileerror: () => {
        setMapFailed(true);
      },
    }),
    [],
  );

  if (mapFailed) {
    return <MapFallback />;
  }

  return (
    <div className="h-full w-full rounded-xl">
      <MapContainer
        center={[safeCenter.lat, safeCenter.lng]}
        zoom={zoom}
        zoomControl={false}
        className="h-full w-full relative z-0"
      >
        <RecenterOnUpdate center={safeCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={tileHandlers}
        />
        <ZoomControl position="topright" />
        <Marker position={[safeCenter.lat, safeCenter.lng]} icon={markerIcon}>
          <Popup>{customPopup ? customPopup : (markerLabel ?? "Live bus location")}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
